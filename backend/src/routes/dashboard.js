const express = require('express');
const { getDb } = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  try {
    const fleetId = req.user.role === 'admin' ? req.query.fleet_id : req.user.fleet_id;
    const year = req.query.year || '2025';
    const deviceGroupId = req.query.device_group_id;

    let fleetCondition = '';
    const params = [];

    if (fleetId) {
      fleetCondition = 'AND p.fleet_id = ?';
      params.push(parseInt(fleetId));
    } else if (req.user.role !== 'admin') {
      fleetCondition = 'AND p.fleet_id = ?';
      params.push(req.user.fleet_id);
    }

    // Monthly data
    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      const month = String(m).padStart(2, '0');
      const dateStart = `${year}-${month}-01`;
      const dateEnd = `${year}-${month}-31`;

      let dgCondition = '';
      const monthParams = [...params];
      if (deviceGroupId) {
        dgCondition = 'AND p.device_group_name = (SELECT name FROM device_groups WHERE id = ?)';
        monthParams.push(parseInt(deviceGroupId));
      }

      const row = db.prepare(`
        SELECT COALESCE(SUM(p.litre), 0) as total_litres, COALESCE(SUM(p.amount), 0) as total_amount
        FROM purchases p
        WHERE p.purchase_date >= ? AND p.purchase_date <= ? ${fleetCondition} ${dgCondition}
      `).get(dateStart, dateEnd, ...monthParams);

      monthlyData.push({
        month: m,
        monthName: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][m-1],
        litres: Math.round(row.total_litres * 100) / 100,
        amount: Math.round(row.total_amount * 100) / 100
      });
    }

    // Current month & year totals
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear().toString();

    const thisMonthParams = [...params];
    const thisMonth = db.prepare(`
      SELECT COALESCE(SUM(litre), 0) as litres, COALESCE(SUM(amount), 0) as amount
      FROM purchases p
      WHERE p.purchase_date >= ? AND p.purchase_date <= ? ${fleetCondition}
    `).get(`${currentYear}-${currentMonth}-01`, `${currentYear}-${currentMonth}-31`, ...thisMonthParams);

    const thisYearParams = [...params];
    const thisYear = db.prepare(`
      SELECT COALESCE(SUM(litre), 0) as litres, COALESCE(SUM(amount), 0) as amount
      FROM purchases p
      WHERE p.purchase_date >= ? AND p.purchase_date <= ? ${fleetCondition}
    `).get(`${year}-01-01`, `${year}-12-31`, ...thisYearParams);

    // Device groups for filter
    let deviceGroups = [];
    if (fleetId) {
      deviceGroups = db.prepare('SELECT id, name FROM device_groups WHERE fleet_id = ?').all(parseInt(fleetId));
    }

    // Admin summary
    let adminSummary = null;
    if (req.user.role === 'admin' && !fleetId) {
      adminSummary = {
        totalFleets: db.prepare('SELECT COUNT(*) as c FROM fleets').get().c,
        totalBalance: db.prepare('SELECT COALESCE(SUM(balance), 0) as s FROM fleets').get().s,
        totalDevices: db.prepare('SELECT COUNT(*) as c FROM devices').get().c,
        activeFleets: db.prepare("SELECT COUNT(*) as c FROM fleets WHERE fuel_status = 'Açık'").get().c,
      };
    }

    res.json({
      monthlyData,
      thisMonth: { litres: Math.round(thisMonth.litres * 100) / 100, amount: Math.round(thisMonth.amount * 100) / 100 },
      thisYear: { litres: Math.round(thisYear.litres * 100) / 100, amount: Math.round(thisYear.amount * 100) / 100 },
      deviceGroups,
      adminSummary
    });
  } finally { db.close(); }
});

module.exports = router;
