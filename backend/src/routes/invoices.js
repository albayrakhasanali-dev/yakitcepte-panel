const express = require('express');
const { getDb } = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const { page = 1, limit = 20, fleet_id, invoice_no, date_from, date_to } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (req.user.role !== 'admin') {
      conditions.push('i.fleet_id = ?');
      params.push(req.user.fleet_id);
    } else if (fleet_id) {
      conditions.push('i.fleet_id = ?');
      params.push(parseInt(fleet_id));
    }
    if (invoice_no) { conditions.push('i.invoice_no LIKE ?'); params.push(`%${invoice_no}%`); }
    if (date_from) { conditions.push('i.invoice_date >= ?'); params.push(date_from); }
    if (date_to) { conditions.push('i.invoice_date <= ?'); params.push(date_to); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM invoices i ${where}`).get(...params).count;
    const rows = db.prepare(`SELECT i.*, f.fleet_name, f.fleet_code FROM invoices i LEFT JOIN fleets f ON i.fleet_id = f.id ${where} ORDER BY i.invoice_date DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } finally { db.close(); }
});

router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const row = db.prepare(`SELECT i.*, f.fleet_name, f.fleet_code, f.company_name FROM invoices i LEFT JOIN fleets f ON i.fleet_id = f.id WHERE i.id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    if (req.user.role !== 'admin' && row.fleet_id !== req.user.fleet_id) {
      return res.status(403).json({ error: 'Erişim reddedildi' });
    }
    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(row.id);
    res.json({ ...row, items });
  } finally { db.close(); }
});

module.exports = router;
