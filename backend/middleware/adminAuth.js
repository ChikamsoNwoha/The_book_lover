// middleware/adminAuth.js
const jwt = require('jsonwebtoken');

module.exports = function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Expect: Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach admin info to request (optional but useful)
    req.admin = {
      id: decoded.adminId,
    };

    next();
  } catch (err) {
    console.error('JWT auth error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
