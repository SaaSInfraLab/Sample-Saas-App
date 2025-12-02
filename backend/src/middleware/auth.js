const jwt = require('jsonwebtoken');
const { isValidTenant } = require('../config/tenants');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!isValidTenant(decoded.tenantId)) {
      return res.status(403).json({ error: 'Invalid tenant' });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}

function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    tenantId: user.tenant_id,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

module.exports = {
  authenticateToken,
  generateToken,
};

