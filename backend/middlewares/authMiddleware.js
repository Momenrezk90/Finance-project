const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Ensure the correct path to the User model

const protect = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
      console.log("num 1");
      return res.status(401).json({ message: 'Token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user based on decoded ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user information to the request
    req.user = user;
    next();
  } catch (error) {
    console.log("num 2");
    console.error("Error in protect middleware:", error); // Enhanced logging for debugging
    res.status(401).json({ message: 'Error during authentication', error: error.message });
  }
};



// Authorize route: check if user has required role(s)
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  next();
};


// Check if the authenticated user is authorized to access bonuses assigned to them
const checkAssignedBonusAccess = (req, res, next) => {
  if (req.user.role === 'user') {
    if (req.params.id) {
      return Bonus.findById(req.params.id)
        .then(bonus => {
          if (bonus.assignedTo !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only access your own bonuses' });
          }
          next();
        })
        .catch(error => {
          res.status(500).json({ message: 'Error accessing bonus' });
        });
    }
  }
  next();
};


module.exports = { protect, authorize, checkAssignedBonusAccess };
