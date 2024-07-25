const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: Token not provided' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decodedToken);
    const user = await User.findById(decodedToken.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
};

module.exports = authMiddleware;
