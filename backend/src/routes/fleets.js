const express = require('express');
const { getDb } = require('../db/schema');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all fleets (admin) or single fleet (customer)
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    if (req.user.role === 'admin') {
      const fleets = db.prepare('SELECT * FROM fleets ORDER BY id').all();
      res.json(fleets);
    } else {
      const fleet = db.prepare('SELECT * FROM fleets WHERE id = ?').get(req.user.fleet_id);
      res.json(fleet ? [fleet] : []);
    }
  } finally { db.close(); }
});

// Get single fleet
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const id = parseInt(req.params.id);
    if (req.user.role !== 'admin' && req.user.fleet_id !== id) {
      return res.status(403).json({ error: 'Erişim reddedildi' });
    }
    const fleet = db.prepare('SELECT * FROM fleets WHERE id = ?').get(id);
    if (!fleet) return res.status(404).json({ error: 'Filo bulunamadı' });

    // Get credit limits
    const creditLimits = db.prepare('SELECT * FROM credit_limits WHERE fleet_id = ?').all(id);
    // Get recent payments
    const recentPayments = db.prepare('SELECT * FROM payments WHERE fleet_id = ? ORDER BY payment_date DESC LIMIT 5').all(id);
    // Get monthly consumption
    const consumption = db.prepare('SELECT * FROM monthly_consumption WHERE fleet_id = ? ORDER BY year_month DESC LIMIT 12').all(id);
    // Get recent invoices
    const recentInvoices = db.prepare('SELECT * FROM invoices WHERE fleet_id = ? ORDER BY invoice_date DESC LIMIT 5').all(id);

    const totalLitres12 = consumption.reduce((sum, c) => sum + (c.total_litres || 0), 0);

    res.json({ ...fleet, creditLimits, recentPayments, consumption: consumption.reverse(), recentInvoices, totalLitres12 });
  } finally { db.close(); }
});

// Create fleet (admin)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  try {
    const { fleet_code, fleet_name, company_name, fuel_status, payment_type, defined_limit, sales_rep } = req.body;
    const info = db.prepare(`INSERT INTO fleets (fleet_code, fleet_name, company_name, fuel_status, payment_type, defined_limit, remaining_limit, sales_rep) VALUES (?,?,?,?,?,?,?,?)`)
      .run(fleet_code, fleet_name, company_name, fuel_status || 'Kapalı', payment_type || 'Vadeli', defined_limit || 0, defined_limit || 0, sales_rep);
    res.json({ id: info.lastInsertRowid });
  } finally { db.close(); }
});

// Update fleet (admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  try {
    const { fleet_name, company_name, fuel_status, payment_type, defined_limit, sales_rep } = req.body;
    db.prepare(`UPDATE fleets SET fleet_name=?, company_name=?, fuel_status=?, payment_type=?, defined_limit=?, sales_rep=?, updated_at=datetime('now') WHERE id=?`)
      .run(fleet_name, company_name, fuel_status, payment_type, defined_limit, sales_rep, req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

// Delete fleet (admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  try {
    db.prepare('DELETE FROM fleets WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

module.exports = router;
