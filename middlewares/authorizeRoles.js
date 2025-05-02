const logger = require("../utils/logger");

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      const user = req.user;
  
      if (!user || !allowedRoles.includes(user.role)) {
        logger.warn("Access denied: Invalid Authorization!")
        return res.status(403).json({ message: "Access denied: insufficient permissions" });
      }
  
      next();
    };
  };
  
  module.exports = authorizeRoles;
  