const express = require('express');
const { getDb } = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const { page = 1, limit = 20, fleet_id, description, payment_type, date_from, date_to, sort_by = 'payment_date', sort_dir = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (req.user.role !== 'admin') {
      conditions.push('p.fleet_id = ?');
      params.push(req.user.fleet_id);
    } else if (fleet_id) {
      conditions.push('p.fleet_id = ?');
      params.push(parseInt(fleet_id));
    }
    if (description) { conditions.push('p.description LIKE ?'); params.push(`%${description}%`); }
    if (payment_type) { conditions.push('p.payment_type LIKE ?'); params.push(`%${payment_type}%`); }
    if (date_from) { conditions.push('p.payment_date >= ?'); params.push(date_from); }
    if (date_to) { conditions.push('p.payment_date <= ?'); params.push(date_to); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM payments p ${where}`).get(...params).count;
    const rows = db.prepare(`SELECT p.*, f.fleet_name, f.fleet_code FROM payments p LEFT JOIN fleets f ON p.fleet_id = f.id ${where} ORDER BY p.payment_date DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } finally { db.close(); }
});

router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const row = db.prepare(`SELECT p.*, f.fleet_name, f.fleet_code, f.company_name FROM payments p LEFT JOIN fleets f ON p.fleet_id = f.id WHERE p.id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    if (req.user.role !== 'admin' && row.fleet_id !== req.user.fleet_id) {
      return res.status(403).json({ error: 'Erişim reddedildi' });
    }
    res.json(row);
  } finally { db.close(); }
});

module.exports = router;
