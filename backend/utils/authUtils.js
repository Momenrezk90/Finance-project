// backend/utils/authUtils.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },  // Ensure that the `role` is included in the token
    process.env.JWT_SECRET,  // JWT secret from .env
    { expiresIn: '6h' }      // Token expiry (1 hour)
  );
};

module.exports = { generateToken };
