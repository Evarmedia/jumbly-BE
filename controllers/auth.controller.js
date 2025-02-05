const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/jwt");
const {
  User,
  Tenant,
  Role,
  UserClient,
  Client,
} = require("../models/models.js");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendRegistrationPasswordResetEmail,
} = require("../utils/emailService.js");
const { Op } = require("sequelize");
const sequelize = require("../config/db");

const redis = require("../utils/redis.js");

const { TenantRole } = require("../models/models.js");

const registerTenant = async (req, res) => {
  try {
    const {
      role_name, // Should always be "admin"
      email,
      password,
      first_name,
      last_name,
      address,
      gender,
      phone,
      photo,
      company_name,
    } = req.body;

    if (role_name.toLowerCase() !== "admin") {
      return res
        .status(400)
        .json({ message: "New tenant creation requires an admin role." });
    }

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const transaction = await sequelize.transaction();

    try {
      // Create the new tenant
      const newTenant = await Tenant.create(
        {
          tenant_name: company_name,
        },
        { transaction }
      );

      // Default roles to assign to the new tenant
      const defaultRoleNames = ["admin", "client", "supervisor", "operator"];

      // Find role IDs for default roles
      const roles = await Role.findAll({
        where: { role_name: defaultRoleNames },
        attributes: ["role_id", "role_name"],
        transaction,
      });

      if (roles.length !== defaultRoleNames.length) {
        throw new Error("Some default roles are missing in the system.");
      }

      // Assign default roles to the new tenant in TenantRoles
      await TenantRole.bulkCreate(
        roles.map((role) => ({
          tenant_id: newTenant.tenant_id,
          role_id: role.role_id,
        })),
        { transaction }
      );

      // Find the "admin" role_id for the new admin user
      const adminRole = roles.find((role) => role.role_name === "admin");

      if (!adminRole) {
        throw new Error("Admin role missing in the system.");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the admin user
      const newAdmin = await User.create(
        {
          email,
          password: hashedPassword,
          role_id: adminRole.role_id,
          first_name,
          last_name,
          address,
          gender,
          phone,
          photo,
          tenant_id: newTenant.tenant_id,
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      // // Generate a verification code
      // const verificationCode = crypto.randomBytes(3).toString('hex');

      // // Store the code in Redis with an expiration time (10 minutes)
      // redis
      //   .setex(`verification_code_${email}`, 600, verificationCode)
      //   .catch((err) =>
      //     console.error("Failed to store verification code in Redis:", err)
      //   );

      // // Send the verification email
      // sendVerificationEmail(email, verificationCode).catch((err) =>
      //   console.error("Failed to send verification email:", err)
      // );

      return res.status(201).json({
        message: "Tenant registered successfully, Verification code sent!.",
        user: {
          tenant_id: newTenant.tenant_id,
          tenant_name: newTenant.tenant_name,
          user_id: newAdmin.user_id,
          email: newAdmin.email,
          role_name: "admin",
        },
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("Tenant Registration Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const {
      role_name, // Role to assign to the new user
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
      website,
      company_name,
      industry,
      official_email,
      contact_person,
    } = req.body;

    // Validate that only admins can register new users
    if (!req.user || req.user.role_name !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can register new users." });
    }

    const tenant_id = req.user.tenant_id;

    // Validate required fields
    if (!email || !password || !role_name) {
      return res
        .status(400)
        .json({ message: "Email, password, and role name are required." });
    }

    const transaction = await sequelize.transaction();

    try {
      // Find the role ID from the global Roles table
      const role = await Role.findOne({
        where: { role_name: role_name.toLowerCase() }, // Case-insensitive check
        attributes: ["role_id", "role_name"],
        transaction,
      });

      if (!role) {
        return res
          .status(400)
          .json({
            message: `Invalid role name: ${role_name}. Please create it first.`,
          });
      }

      // Ensure that the tenant has access to the role
      const tenantRole = await TenantRole.findOne({
        where: { tenant_id, role_id: role.role_id },
        transaction,
      });

      if (!tenantRole) {
        return res
          .status(403)
          .json({
            message: `Role '${role_name}' is not assigned to this tenant. Please add it first.`,
          });
      }

      // Check if the user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use." });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const newUser = await User.create(
        {
          email,
          password: hashedPassword,
          role_id: role.role_id,
          first_name,
          last_name,
          address,
          gender,
          phone,
          photo,
          education,
          birthdate,
          tenant_id,
        },
        { transaction }
      );

      // Create client-specific record if the role_name is "client"
      if (role.role_name === "client") {
        const newClient = await Client.create(
          {
            email,
            website,
            company_name,
            industry,
            official_email: official_email || email,
            contact_person,
            tenant_id,
          },
          { transaction }
        );

        await UserClient.create(
          {
            user_id: newUser.user_id,
            client_id: newClient.client_id,
          },
          { transaction }
        );
      }

      // Generate a random reset token (for example, using crypto)
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiration = new Date(Date.now() + 600000); // Token expires in 10 min

      // Store reset token and expiration in the database
      await newUser.update(
        {
          reset_token: resetToken,
          reset_token_expiration: resetTokenExpiration,
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      // Send the registration password reset email
      try {
        await sendRegistrationPasswordResetEmail(newUser.email, resetToken);
      } catch (err) {
        console.error("Failed to send registration password reset email:", err);
      }

      return res.status(201).json({
        message:
          `User registered successfully. Password reset email sent to ${newUser.email}. Please check your inbox.`,
        user: {
          user_id: newUser.user_id,
          email: newUser.email,
          role_name: role.role_name,
          tenant_id,
        },
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("User Registration Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Log in a user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Fetch the user with password included
    const user = await User.scope("withPassword").findOne({
      where: { email },
      include: [
        {
          model: Role,
          attributes: ["role_id", "role_name"],
        },
        {
          model: Tenant,
          attributes: ["tenant_id", "tenant_name"],
        },
      ],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Verify that the user's role is assigned to their tenant
    const tenantRole = await TenantRole.findOne({
      where: { tenant_id: user.tenant_id, role_id: user.Role.role_id },
    });

    if (!tenantRole) {
      return res
        .status(403)
        .json({
          message:
            "Your role is no longer assigned to this tenant. Contact an admin.",
        });
    }

    // Payload for access token
    const payload = {
      user: {
        user_id: user.user_id,
        email: user.email,
        role_id: user.Role.role_id,
        role_name: user.Role.role_name,
        tenant_id: user.tenant_id,
        tenant_name: user.Tenant?.tenant_name,
      },
    };

    // Generate access token (short-lived)
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiration,
    });

    // Generate refresh token (long-lived)
    const refresh_token = jwt.sign(
      { user_id: user.user_id },
      config.refresh_token_secret,
      { expiresIn: config.refresh_token_expiration }
    );

    // Set the refresh token in an HttpOnly cookie
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Respond with the access token and user details
    res.status(200).json({
      message: "Login successful",
      token,
      refresh_token, // Temporarily added for testing in development
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        email: user.email,
        role_id: user.Role.role_id,
        role_name: user.Role.role_name,
        tenant_id: user.tenant_id,
        tenant_name: user.Tenant?.tenant_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// referesh-token
const refreshToken = async (req, res) => {
  try {
    // Get the refresh token from cookies
    const refresh_token = req.body.refresh_token || req.cookies.refresh_token;

    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    // Verify the refresh token
    jwt.verify(
      refresh_token,
      config.refresh_token_secret,
      async (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Invalid or expired refresh token." });
        }

        // Find the user based on the decoded token payload
        const user = await User.findByPk(decoded.user_id, { include: "Role" });
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        // Payload for access token
        const payload = {
          user: {
            user_id: user.user_id,
            email: user.email,
            role_id: user.Role.role_id,
            role_name: user.Role.role_name,
          },
        };

        // Generate a new access token
        const token = jwt.sign(
          payload,
          config.jwtSecret,
          { expiresIn: config.jwtExpiration } // Short-lived access token
        );

        res.status(200).json({
          message: "Access token refreshed successfully.",
          token,
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            email: user.email,
            role_id: user.Role.role_id,
            role_name: user.Role.role_name,
          },
        });
      }
    );
  } catch (error) {
    console.error("Error refreshing token:", error.message);
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

// const resetRegistrationPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     // Check if user exists
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Generate a random reset token (for example, using crypto)
//     const resetToken = crypto.randomBytes(20).toString("hex");
//     const resetTokenExpiration = new Date(Date.now() + 3600000); // Token expires in 1 hour

//     // Store reset token and expiration in the database
//     user.reset_token = resetToken;
//     user.reset_token_expiration = resetTokenExpiration;
//     await user.save();

//     // Send the reset token to the user's email
//     await sendRgistrationPasswordResetEmail(user.email, resetToken);

//     return res.status(200).json({
//       message: "Password reset email sent. Please check your inbox.",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

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
  registerTenant,
  registerUser,
  login,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  // resetRegistrationPassword,
};
