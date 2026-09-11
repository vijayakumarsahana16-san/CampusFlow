const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Ensure JWT_SECRET is loaded properly
    if (!process.env.JWT_SECRET) {
      console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
      return res.status(500).json({ message: 'Internal server error' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains { id: user._id }

    next();
  } catch (error) {
    // 3. Differentiate between expired and invalid tokens for better client handling
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Token is invalid' });
  }
};

module.exports = { authenticateAdmin };