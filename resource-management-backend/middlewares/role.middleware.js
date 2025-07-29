// Middleware to check if user has required role
module.exports = function role(allowedRoles = []) {
  return (req, res, next) => {
    // Check user role against allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}; 