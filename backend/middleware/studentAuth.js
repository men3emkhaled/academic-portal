const jwt = require('jsonwebtoken');

const studentAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!['student', 'assistant', 'admin'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied. Student, Assistant, or Admin only.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { studentAuth };