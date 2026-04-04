const jwt = require('jsonwebtoken');

const studentAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  console.log('🔐 studentAuth - Authorization header:', authHeader ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, user:', decoded.id, 'role:', decoded.role);
    
    if (decoded.role !== 'student') {
      console.log('❌ Invalid role:', decoded.role);
      return res.status(403).json({ message: 'Access denied. Student only.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { studentAuth };