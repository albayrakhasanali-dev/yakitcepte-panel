const express = require('express');
const { getDb } = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Devices
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const { page = 1, limit = 20, fleet_id, plate, device_number, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (req.user.role !== 'admin') {
      conditions.push('d.fleet_id = ?');
      params.push(req.user.fleet_id);
    } else if (fleet_id) {
      conditions.push('d.fleet_id = ?');
      params.push(parseInt(fleet_id));
    }
    if (plate) { conditions.push('d.plate LIKE ?'); params.push(`%${plate}%`); }
    if (device_number) { conditions.push('d.device_number LIKE ?'); params.push(`%${device_number}%`); }
    if (status) { conditions.push('d.status = ?'); params.push(status); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM devices d ${where}`).get(...params).count;
    const rows = db.prepare(`SELECT d.*, f.fleet_name, dg.name as group_name FROM devices d LEFT JOIN fleets f ON d.fleet_id = f.id LEFT JOIN device_groups dg ON d.device_group_id = dg.id ${where} ORDER BY d.id LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } finally { db.close(); }
});

// Device Groups
router.get('/groups', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const conditions = [];
    const params = [];
    if (req.user.role !== 'admin') {
      conditions.push('dg.fleet_id = ?');
      params.push(req.user.fleet_id);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const rows = db.prepare(`SELECT dg.*, f.fleet_name FROM device_groups dg LEFT JOIN fleets f ON dg.fleet_id = f.id ${where} ORDER BY dg.id`).all(...params);
    res.json(rows);
  } finally { db.close(); }
});

router.post('/groups', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const fleet_id = req.user.role === 'admin' ? req.body.fleet_id : req.user.fleet_id;
    const { name, separate_report, separate_invoice } = req.body;
    const info = db.prepare('INSERT INTO device_groups (fleet_id, name, separate_report, separate_invoice) VALUES (?,?,?,?)').run(fleet_id, name, separate_report ? 1 : 0, separate_invoice ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  } finally { db.close(); }
});

// Device Requests
router.get('/requests', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    if (req.user.role !== 'admin') {
      conditions.push('dr.fleet_id = ?');
      params.push(req.user.fleet_id);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const total = db.prepare(`SELECT COUNT(*) as count FROM device_requests dr ${where}`).get(...params).count;
    const rows = db.prepare(`SELECT dr.*, f.fleet_name FROM device_requests dr LEFT JOIN fleets f ON dr.fleet_id = f.id ${where} ORDER BY dr.created_at DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } finally { db.close(); }
});

router.post('/requests', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const fleet_id = req.user.role === 'admin' ? req.body.fleet_id : req.user.fleet_id;
    const { plate } = req.body;
    const info = db.prepare('INSERT INTO device_requests (fleet_id, plate, request_status, order_status) VALUES (?,?,?,?)').run(fleet_id, plate, 'Beklemede', 'Hazırlanıyor');
    res.json({ id: info.lastInsertRowid });
  } finally { db.close(); }
});

// Prepaid Logs
router.get('/prepaidlogs', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    if (req.user.role !== 'admin') {
      conditions.push('pl.fleet_id = ?');
      params.push(req.user.fleet_id);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const total = db.prepare(`SELECT COUNT(*) as count FROM prepaid_logs pl ${where}`).get(...params).count;
    const rows = db.prepare(`SELECT pl.*, f.fleet_name FROM prepaid_logs pl LEFT JOIN fleets f ON pl.fleet_id = f.id ${where} ORDER BY pl.log_date DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } finally { db.close(); }
});

module.exports = router;
