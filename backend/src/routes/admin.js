const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/schema');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Users management
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  try {
    const users = db.prepare(`SELECT u.id, u.username, u.role, u.fleet_id, u.full_name, u.created_at, f.fleet_name FROM users u LEFT JOIN fleets f ON u.fleet_id = f.id ORDER BY u.id`).all();
    res.json(users);
  } finally { db.close(); }
});

router.post('/users', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  try {
    const { username, password, role, fleet_id, full_name } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const info = db.prepare('INSERT INTO users (username, password_hash, role, fleet_id, full_name) VALUES (?,?,?,?,?)').run(username, hash, role || 'customer', fleet_id || null, full_name);
    res.json({ id: info.lastInsertRowid });
  } finally { db.close(); }
});

router.put('/users/:id/password', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  try {
    const hash = bcrypt.hashSync(req.body.password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

router.delete('/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

// Contract invoices
router.get('/contractinvoices', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    if (req.user.role !== 'admin') {
      conditions.push('ci.fleet_id = ?');
      params.push(req.user.fleet_id);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const total = db.prepare(`SELECT COUNT(*) as count FROM contract_invoices ci ${where}`).get(...params).count;
    const rows = db.prepare(`SELECT ci.*, f.fleet_name FROM contract_invoices ci LEFT JOIN fleets f ON ci.fleet_id = f.id ${where} ORDER BY ci.invoice_date DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } finally { db.close(); }
});

module.exports = router;
