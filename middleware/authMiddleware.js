const jwt = require("jsonwebtoken");
const sequelize = require("../config/db"); // Import Sequelize instance
const config = require("../config/jwt"); // JWT secret configuration

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret); // Verify the token
    req.user = decoded.user; // Attach user details to the request

    // Dynamically set the @current_user_id in the database session
    // if (req.user && req.user.user_id) {
    //   await sequelize.query(`SET @current_user_id = ${req.user.user_id}`);
    //   console.log("Updated userID to logger Triggers");
    // }
    // NOT SUPPORTED NATIVELY BY SQLITE
    // console.log("Decoded token payload:", decoded);
    // console.log("Request user:", req.user);

    next(); // Proceed to the next middleware or route
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;
