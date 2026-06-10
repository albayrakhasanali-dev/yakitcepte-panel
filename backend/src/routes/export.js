const express = require('express');
const ExcelJS = require('exceljs');
const { getDb } = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:type', authenticateToken, async (req, res) => {
  const db = getDb();
  try {
    const { type } = req.params;
    const { format = 'xlsx', fleet_id } = req.query;
    const fid = req.user.role === 'admin' ? fleet_id : req.user.fleet_id;

    let rows = [];
    let columns = [];

    switch (type) {
      case 'purchases':
        rows = db.prepare(`SELECT p.*, f.fleet_name FROM purchases p LEFT JOIN fleets f ON p.fleet_id = f.id ${fid ? 'WHERE p.fleet_id = ?' : ''} ORDER BY p.purchase_date DESC`).all(...(fid ? [fid] : []));
        columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Filo', key: 'fleet_name', width: 20 },
          { header: 'Şehir', key: 'city', width: 15 },
          { header: 'İstasyon', key: 'station_name', width: 25 },
          { header: 'Plaka', key: 'plate', width: 15 },
          { header: 'Ürün', key: 'product', width: 15 },
          { header: 'Litre', key: 'litre', width: 10 },
          { header: 'Birim Fiyat', key: 'unit_price', width: 12 },
          { header: 'Tutar', key: 'amount', width: 12 },
          { header: 'İskontolu Tutar', key: 'discounted_amount', width: 15 },
          { header: 'Tarih', key: 'purchase_date', width: 20 },
        ];
        break;
      case 'payments':
        rows = db.prepare(`SELECT p.*, f.fleet_name FROM payments p LEFT JOIN fleets f ON p.fleet_id = f.id ${fid ? 'WHERE p.fleet_id = ?' : ''} ORDER BY p.payment_date DESC`).all(...(fid ? [fid] : []));
        columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Filo', key: 'fleet_name', width: 20 },
          { header: 'Açıklama', key: 'description', width: 20 },
          { header: 'Tutar', key: 'amount', width: 12 },
          { header: 'Ödeme Tarihi', key: 'payment_date', width: 20 },
          { header: 'Ödeme Tipi', key: 'payment_type', width: 15 },
          { header: 'Kaynak', key: 'source', width: 15 },
        ];
        break;
      case 'invoices':
        rows = db.prepare(`SELECT i.*, f.fleet_name FROM invoices i LEFT JOIN fleets f ON i.fleet_id = f.id ${fid ? 'WHERE i.fleet_id = ?' : ''} ORDER BY i.invoice_date DESC`).all(...(fid ? [fid] : []));
        columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Filo', key: 'fleet_name', width: 20 },
          { header: 'Fatura No', key: 'invoice_no', width: 20 },
          { header: 'Ödenecek Tutar', key: 'payable_amount', width: 15 },
          { header: 'Miktar', key: 'quantity', width: 10 },
          { header: 'KDV', key: 'vat_amount', width: 10 },
          { header: 'Fatura Tarihi', key: 'invoice_date', width: 15 },
          { header: 'Vade', key: 'due_date', width: 15 },
        ];
        break;
      case 'devices':
        rows = db.prepare(`SELECT d.*, f.fleet_name, dg.name as group_name FROM devices d LEFT JOIN fleets f ON d.fleet_id = f.id LEFT JOIN device_groups dg ON d.device_group_id = dg.id ${fid ? 'WHERE d.fleet_id = ?' : ''} ORDER BY d.id`).all(...(fid ? [fid] : []));
        columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Filo', key: 'fleet_name', width: 20 },
          { header: 'Grup', key: 'group_name', width: 15 },
          { header: 'Cihaz No', key: 'device_number', width: 15 },
          { header: 'Plaka', key: 'plate', width: 15 },
          { header: 'Davranış', key: 'limit_behaviour', width: 20 },
          { header: 'Durum', key: 'status', width: 10 },
        ];
        break;
      case 'device_requests':
        rows = db.prepare(`SELECT dr.*, f.fleet_name FROM device_requests dr LEFT JOIN fleets f ON dr.fleet_id = f.id ${fid ? 'WHERE dr.fleet_id = ?' : ''} ORDER BY dr.created_at DESC`).all(...(fid ? [fid] : []));
        columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Filo', key: 'fleet_name', width: 20 },
          { header: 'Plaka', key: 'plate', width: 15 },
          { header: 'İstek Durumu', key: 'request_status', width: 15 },
          { header: 'Sipariş Durumu', key: 'order_status', width: 15 },
          { header: 'Montaj Kodu', key: 'assembly_code', width: 15 },
          { header: 'Oluşturulma', key: 'created_at', width: 20 },
        ];
        break;
      default:
        return res.status(400).json({ error: 'Geçersiz export tipi' });
    }

    if (format === 'csv') {
      const header = columns.map(c => c.header).join(',');
      const csvRows = rows.map(r => columns.map(c => `"${(r[c.key] || '').toString().replace(/"/g, '""')}"`).join(','));
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${type}.csv`);
      res.send('\uFEFF' + header + '\n' + csvRows.join('\n'));
    } else {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Veri');
      sheet.columns = columns;
      rows.forEach(r => sheet.addRow(r));
      sheet.getRow(1).font = { bold: true };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } finally { db.close(); }
});

module.exports = router;
