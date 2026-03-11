const express = require('express');
const { getDb } = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const { page = 1, limit = 20, fleet_id, city, plate, product, date_from, date_to, sort_by = 'purchase_date', sort_dir = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (req.user.role !== 'admin') {
      conditions.push('fleet_id = ?');
      params.push(req.user.fleet_id);
    } else if (fleet_id) {
      conditions.push('fleet_id = ?');
      params.push(parseInt(fleet_id));
    }
    if (city) { conditions.push('city LIKE ?'); params.push(`%${city}%`); }
    if (plate) { conditions.push('plate LIKE ?'); params.push(`%${plate}%`); }
    if (product) { conditions.push('product LIKE ?'); params.push(`%${product}%`); }
    if (date_from) { conditions.push('purchase_date >= ?'); params.push(date_from); }
    if (date_to) { conditions.push('purchase_date <= ?'); params.push(date_to); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const allowedSorts = ['purchase_date', 'amount', 'litre', 'city', 'plate'];
    const sortCol = allowedSorts.includes(sort_by) ? sort_by : 'purchase_date';
    const sortDirection = sort_dir === 'ASC' ? 'ASC' : 'DESC';

    const total = db.prepare(`SELECT COUNT(*) as count FROM purchases ${where}`).get(...params).count;
    const rows = db.prepare(`SELECT p.*, f.fleet_name, f.fleet_code FROM purchases p LEFT JOIN fleets f ON p.fleet_id = f.id ${where} ORDER BY ${sortCol} ${sortDirection} LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } finally { db.close(); }
});

router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const row = db.prepare(`SELECT p.*, f.fleet_name, f.fleet_code, i.invoice_no FROM purchases p LEFT JOIN fleets f ON p.fleet_id = f.id LEFT JOIN invoices i ON p.invoice_id = i.id WHERE p.id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Kayıt bulunamadı' });
    if (req.user.role !== 'admin' && row.fleet_id !== req.user.fleet_id) {
      return res.status(403).json({ error: 'Erişim reddedildi' });
    }
    res.json(row);
  } finally { db.close(); }
});

module.exports = router;
