const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and protect routes
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from header
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user data to request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}; 