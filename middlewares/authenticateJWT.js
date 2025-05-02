const jwt = require('jsonwebtoken');
const logger = require('../utils/logger')
const SECRET_KEY = 'Abishek_secret'; 

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn(`Unauthorized access attempt - no token provided`);
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error(`JWT verification failed: ${err.message}`);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateJWT;
