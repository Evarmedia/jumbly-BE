const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role, UserClient, Client } = require("../models/models.js");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../utils/emailService.js");
const { Op } = require("sequelize");
const sequelize = require('../config/db'); 

const config = require("../config/jwt");
const redis = require("../utils/redis.js");

const register = async (req, res) => {
  try {
    const {
      role_id,
      email,
      password,
      first_name,
      last_name,
      address,
      gender,
      phone,
      photo,
      education,
      birthdate,
      status,
      website,
      company_name,
      industry,
      official_email,
      contact_person,
    } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Check if the role exists
    const role = await Role.findByPk(role_id);
    if (!role) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a transaction for atomicity
    const transaction = await sequelize.transaction();
    try {
      // Create the user
      const newUser = await User.create(
        {
          email,
          password: hashedPassword,
          role_id,
          phone,
        },
        { transaction }
      );

      // If the user is a client, create a client record and associate it with the user
      if (role.role_name === "client") {

        // Create a client record
        const newClient = await Client.create(
          {
            website,
            company_name,
            industry,
            official_email,
            contact_person,
          },
          { transaction }
        );

        // Create the many-to-many relationship in UserClients
        await UserClient.create(
          {
            user_id: newUser.user_id,
            client_id: newClient.client_id,
          },
          { transaction }
        );
      }

      // Commit the transaction
      await transaction.commit();

      // Generate a verification code
      // const verificationCode = crypto.randomBytes(3).toString('hex');

      // Store the code in Redis with an expiration time (10 minutes)
      // redis
      //   .setex(`verification_code_${email}`, 600, verificationCode)
      //   .catch((err) =>
      //     console.error("Failed to store verification code in Redis:", err)
      //   );

      // Send the verification email
      // sendVerificationEmail(email, verificationCode).catch((err) =>
      //   console.error("Failed to send verification email:", err)
      // );

      return res.status(201).json({
        message:
          "User registered successfully. Check your email for verification.",
        user: {
          user_id: newUser.user_id,
          email: newUser.email,
          role_id: newUser.role_id,
        },
      });
    } catch (err) {
      // Rollback transaction if anything goes wrong
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Log in a user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    payload = {
      user: {
        user_id: user.user_id,
        username: user.username,
        role_id: user.Role.role_id,
        role_name: user.Role.role_name,
      },
    };

    // Generate a JWT token
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });

    // Set JWT token in HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // The cookie can only be accessed by the server, not JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 3600000, // Cookie expiration time (1 hour in ms)
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.Role.role_id,
        role_name: user.Role.role_name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// verify-email
// Controller to verify the email code with Redis
const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  // Get the verification code from Redis
  const storedCode = await redis.get(`verification_code_${email}`);
  if (!storedCode) {
    return res
      .status(400)
      .json({ message: "Verification code has expired or does not exist" });
  }

  // Compare the stored code with the submitted one
  if (storedCode === verificationCode) {
    // Update the user's status to 'verified'
    const user = await User.findOne({ where: { email } });
    if (user) {
      await user.update({
        status: "verified",
      });

      // delete the code from Redis once verified
      await redis.del(`verification_code_${email}`);

      return res.status(200).json({ message: "Email verified successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } else {
    return res.status(400).json({ message: "Invalid verification code" });
  }
};

// Forgot Password Endpoint
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a random reset token (for example, using crypto)
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiration = new Date(Date.now() + 3600000); // Token expires in 1 hour

    // Store reset token and expiration in the database
    user.reset_token = resetToken;
    user.reset_token_expiration = resetTokenExpiration;
    await user.save();

    // Send the reset token to the user's email
    await sendResetPasswordEmail(user.email, resetToken);

    return res.status(200).json({
      message: "Password reset email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Reset Password Endpoint
const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Find the user by the reset token
    const user = await User.findOne({
      where: {
        reset_token: resetToken,
        reset_token_expiration: {
          [Op.gt]: new Date(), // Ensure the token has not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and reset token fields
    user.password = hashedPassword;
    user.reset_token = null;
    user.reset_token_expiration = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been successfully updated." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
