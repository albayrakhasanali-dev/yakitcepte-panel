const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token gerekli' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Geçersiz token' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin yetkisi gerekli' });
  }
  next();
}

function requireFleetAccess(req, res, next) {
  const fleetId = parseInt(req.params.fleetId || req.query.fleet_id || req.body.fleet_id);
  if (req.user.role === 'admin') return next();
  if (req.user.fleet_id && req.user.fleet_id === fleetId) return next();
  if (!fleetId && req.user.fleet_id) {
    req.query.fleet_id = req.user.fleet_id;
    return next();
  }
  return res.status(403).json({ error: 'Bu filoya erişim yetkiniz yok' });
}

module.exports = { authenticateToken, requireAdmin, requireFleetAccess, JWT_SECRET };
