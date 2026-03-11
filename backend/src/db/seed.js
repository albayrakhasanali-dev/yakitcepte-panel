const { getDb, createTables } = require('./schema');
const bcrypt = require('bcryptjs');

const db = getDb();
createTables(db);

// Clear existing data
const tables = ['contract_invoices','device_requests','prepaid_logs','monthly_consumption',
  'invoice_items','purchases','payments','invoices','devices','device_groups',
  'credit_limits','users','fleets'];
tables.forEach(t => db.exec(`DELETE FROM ${t}`));

// Seed Fleets
const fleets = [
  { code: 'FL001', name: 'ABC Lojistik', company: 'ABC Lojistik A.Ş.', fuel: 'Açık', payment: 'Vadeli', balance: -45230.50, net_balance: -38500.00, accounted: -42000.00, waybill: 12500.00, net_waybill: 10625.00, limit: 100000, remaining: 54769.50, rep: 'Ahmet Yılmaz' },
  { code: 'FL002', name: 'XYZ Taşımacılık', company: 'XYZ Taşımacılık Ltd.', fuel: 'Açık', payment: 'Vadeli', balance: -78400.00, net_balance: -66440.00, accounted: -72000.00, waybill: 23400.00, net_waybill: 19890.00, limit: 200000, remaining: 121600.00, rep: 'Mehmet Kaya' },
  { code: 'FL003', name: 'Güneş Nakliyat', company: 'Güneş Nakliyat ve Tic. A.Ş.', fuel: 'Kapalı', payment: 'Peşin', balance: 15000.00, net_balance: 12750.00, accounted: 15000.00, waybill: 0, net_waybill: 0, limit: 50000, remaining: 65000.00, rep: 'Ayşe Demir' },
  { code: 'FL004', name: 'Yıldız Kargo', company: 'Yıldız Kargo ve Dağıtım A.Ş.', fuel: 'Açık', payment: 'Vadeli', balance: -125800.00, net_balance: -106930.00, accounted: -120000.00, waybill: 45600.00, net_waybill: 38760.00, limit: 300000, remaining: 174200.00, rep: 'Ahmet Yılmaz' },
  { code: 'FL005', name: 'Mavi Filo', company: 'Mavi Filo Kiralama Ltd.', fuel: 'Açık', payment: 'Vadeli', balance: -32100.00, net_balance: -27285.00, accounted: -30000.00, waybill: 8900.00, net_waybill: 7565.00, limit: 75000, remaining: 42900.00, rep: 'Mehmet Kaya' },
];

const insertFleet = db.prepare(`INSERT INTO fleets (fleet_code, fleet_name, company_name, fuel_status, payment_type, balance, net_balance, accounted_balance, waybill, net_waybill, defined_limit, remaining_limit, sales_rep) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);

const fleetIds = [];
for (const f of fleets) {
  const info = insertFleet.run(f.code, f.name, f.company, f.fuel, f.payment, f.balance, f.net_balance, f.accounted, f.waybill, f.net_waybill, f.limit, f.remaining, f.rep);
  fleetIds.push(info.lastInsertRowid);
}

// Seed Users
const hash = bcrypt.hashSync('123456', 10);
const insertUser = db.prepare(`INSERT INTO users (username, password_hash, role, fleet_id, full_name) VALUES (?,?,?,?,?)`);
insertUser.run('admin', bcrypt.hashSync('admin123', 10), 'admin', null, 'Sistem Yöneticisi');
insertUser.run('abc', hash, 'customer', fleetIds[0], 'ABC Kullanıcı');
insertUser.run('xyz', hash, 'customer', fleetIds[1], 'XYZ Kullanıcı');
insertUser.run('gunes', hash, 'customer', fleetIds[2], 'Güneş Kullanıcı');
insertUser.run('yildiz', hash, 'customer', fleetIds[3], 'Yıldız Kullanıcı');
insertUser.run('mavi', hash, 'customer', fleetIds[4], 'Mavi Kullanıcı');

// Seed Credit Limits
const insertCredit = db.prepare(`INSERT INTO credit_limits (fleet_id, name, type, amount, status) VALUES (?,?,?,?,?)`);
for (const fid of fleetIds) {
  insertCredit.run(fid, 'Ana Limit', 'Sabit', 50000 + Math.random() * 100000, 'Aktif');
  insertCredit.run(fid, 'Ek Limit', 'Değişken', 10000 + Math.random() * 30000, 'Aktif');
}

// Seed Device Groups
const insertDG = db.prepare(`INSERT INTO device_groups (fleet_id, name, device_count, separate_report, separate_invoice) VALUES (?,?,?,?,?)`);
const dgIds = {};
for (let i = 0; i < fleetIds.length; i++) {
  const fid = fleetIds[i];
  const info1 = insertDG.run(fid, 'Genel', 5 + i * 2, 1, 1);
  const info2 = insertDG.run(fid, 'Şehir İçi', 3 + i, 1, 0);
  dgIds[fid] = [info1.lastInsertRowid, info2.lastInsertRowid];
}

// Seed Devices
const plates = ['34 ABC 001','34 ABC 002','34 ABC 003','06 XYZ 100','06 XYZ 101','06 XYZ 102',
  '35 GNS 200','35 GNS 201','16 YLD 300','16 YLD 301','16 YLD 302','16 YLD 303',
  '07 MVF 400','07 MVF 401','07 MVF 402'];
const insertDevice = db.prepare(`INSERT INTO devices (fleet_id, device_group_id, device_number, plate, limit_behaviour, status) VALUES (?,?,?,?,?,?)`);
let plateIdx = 0;
for (let i = 0; i < fleetIds.length; i++) {
  const fid = fleetIds[i];
  const groups = dgIds[fid];
  const count = i < 2 ? 3 : 2;
  for (let j = 0; j < count; j++) {
    insertDevice.run(fid, groups[j % 2], `D${String(plateIdx + 1).padStart(4, '0')}`, plates[plateIdx], 'Limit Aşımında Kapat', 'Aktif');
    plateIdx++;
  }
}

// Seed Purchases
const cities = ['İstanbul','Ankara','İzmir','Bursa','Antalya','Kocaeli','Adana'];
const stations = ['Petrol Ofisi Kartal','BP Ümraniye','Shell Bostancı','Opet Kızılay','Total Alsancak','PO Nilüfer','BP Lara'];
const products = ['Motorin Med','Pro Dizel','Benzin 95','Eurodizel','Gazoil'];
const distributors = ['Petrol Ofisi','BP','Shell','Opet','Total'];

const insertPurchase = db.prepare(`INSERT INTO purchases (fleet_id, city, station_name, station_code, device_group_name, plate, device_number, product, litre, unit_price, amount, discounted_amount, vat_rate, discount_rate, distributor, kilometre, purchase_date, invoice_period, source, processed) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

for (let fid of fleetIds) {
  const devs = db.prepare('SELECT * FROM devices WHERE fleet_id = ?').all(fid);
  for (let m = 0; m < 12; m++) {
    const month = String(m + 1).padStart(2, '0');
    const purchaseCount = 8 + Math.floor(Math.random() * 12);
    for (let p = 0; p < purchaseCount; p++) {
      const dev = devs[Math.floor(Math.random() * devs.length)];
      const cityIdx = Math.floor(Math.random() * cities.length);
      const prodIdx = Math.floor(Math.random() * products.length);
      const litre = Math.round((20 + Math.random() * 80) * 100) / 100;
      const unitPrice = Math.round((38 + Math.random() * 5) * 100000) / 100000;
      const amount = Math.round(litre * unitPrice * 100) / 100;
      const discount = Math.round(amount * 0.02 * 100) / 100;
      const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
      const dg = db.prepare('SELECT name FROM device_groups WHERE id = ?').get(dev.device_group_id);

      insertPurchase.run(
        fid, cities[cityIdx], stations[cityIdx], `ST${cityIdx + 100}`,
        dg ? dg.name : 'Genel', dev.plate, dev.device_number,
        products[prodIdx], litre, unitPrice, amount, amount - discount,
        18, 2, distributors[prodIdx],
        50000 + Math.floor(Math.random() * 150000),
        `2025-${month}-${day}`, `2025-${month}-01`, 'Web Servisi', 1
      );
    }
  }
}

// Seed Payments
const payDescs = ['İŞB-DEKONT','HALK-DEKONT','Havale','Çek','EFT'];
const payTypes = ['Banka Hareketi','Muhasebe','Banka Hareketi','Banka Hareketi','Banka Hareketi'];
const paySources = ['Banka Hareketi','Muhasebe Programı','Banka Hareketi','Banka Hareketi','Banka Hareketi'];
const insertPayment = db.prepare(`INSERT INTO payments (fleet_id, description, announcement_date, payment_date, amount, notes, payment_type, source, external_id) VALUES (?,?,?,?,?,?,?,?,?)`);

for (let fid of fleetIds) {
  for (let m = 0; m < 12; m++) {
    const month = String(m + 1).padStart(2, '0');
    const payCount = 2 + Math.floor(Math.random() * 3);
    for (let p = 0; p < payCount; p++) {
      const idx = Math.floor(Math.random() * payDescs.length);
      const day = String(5 + Math.floor(Math.random() * 20)).padStart(2, '0');
      const amt = Math.round((5000 + Math.random() * 30000) * 100) / 100;
      insertPayment.run(
        fid, payDescs[idx],
        `2025-${month}-${day}`, `2025-${month}-${day}`,
        amt, '', payTypes[idx], paySources[idx],
        `EXT${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`
      );
    }
  }
}

// Seed Invoices + Items
const insertInvoice = db.prepare(`INSERT INTO invoices (fleet_id, invoice_no, uuid, ettn, payable_amount, service_amount, quantity, vat_amount, invoice_date, due_date, e_invoice, invoice_type, envelope_status, envelope_detail) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const insertItem = db.prepare(`INSERT INTO invoice_items (invoice_id, product, quantity, unit_price, discount, vat, service_amount, vat_base) VALUES (?,?,?,?,?,?,?,?)`);

let invCounter = 1;
for (let fid of fleetIds) {
  for (let m = 0; m < 12; m++) {
    const month = String(m + 1).padStart(2, '0');
    const invNo = `YKC2025${String(invCounter++).padStart(6, '0')}`;
    const serviceAmt = Math.round((10000 + Math.random() * 40000) * 100) / 100;
    const vatAmt = Math.round(serviceAmt * 0.20 * 100) / 100;
    const payableAmt = Math.round((serviceAmt + vatAmt) * 100) / 100;
    const qty = Math.round((500 + Math.random() * 2000) * 100) / 100;

    const info = insertInvoice.run(
      fid, invNo,
      `${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}`,
      `ETTN${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      payableAmt, serviceAmt, qty, vatAmt,
      `2025-${month}-28`, `2025-${String(Math.min(12, m + 2)).padStart(2, '0')}-28`,
      1, 'Borç', 'Başarılı', 'Kabul Edildi'
    );

    for (const prod of ['Motorin Med', 'Pro Dizel']) {
      const itemQty = Math.round(qty / 2 * 100) / 100;
      const itemPrice = Math.round((38 + Math.random() * 5) * 100000) / 100000;
      const itemService = Math.round(itemQty * itemPrice * 100) / 100;
      const itemVat = Math.round(itemService * 0.20 * 100) / 100;
      insertItem.run(info.lastInsertRowid, prod, itemQty, itemPrice, 0, itemVat, itemService, itemService);
    }
  }
}

// Seed Monthly Consumption
const insertMC = db.prepare(`INSERT INTO monthly_consumption (fleet_id, year_month, total_litres, change_pct, gross_amount) VALUES (?,?,?,?,?)`);
for (let fid of fleetIds) {
  let prevLitres = 0;
  for (let m = 0; m < 12; m++) {
    const month = String(m + 1).padStart(2, '0');
    const litres = Math.round((2000 + Math.random() * 5000) * 100) / 100;
    const changePct = prevLitres > 0 ? Math.round(((litres - prevLitres) / prevLitres) * 1000) / 10 : 0;
    const gross = Math.round(litres * (38 + Math.random() * 5) * 100) / 100;
    insertMC.run(fid, `2025-${month}-01`, litres, changePct, gross);
    prevLitres = litres;
  }
}

// Seed Prepaid Logs
const insertPL = db.prepare(`INSERT INTO prepaid_logs (fleet_id, card_number, receipt_no, change_amount, log_date) VALUES (?,?,?,?,?)`);
for (let fid of fleetIds) {
  for (let i = 0; i < 5; i++) {
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
    insertPL.run(fid, `CARD${String(fid).padStart(3,'0')}${i}`, `FIS${Math.floor(Math.random() * 99999)}`, Math.round((1000 + Math.random() * 5000) * 100) / 100, `2025-${month}-${day}`);
  }
}

// Seed Device Requests
const insertDR = db.prepare(`INSERT INTO device_requests (fleet_id, plate, request_status, order_status, assembly_code) VALUES (?,?,?,?,?)`);
const reqStatuses = ['Onaylandı','Beklemede','Red'];
const ordStatuses = ['Tamamlandı','Hazırlanıyor','İptal'];
for (let fid of fleetIds) {
  const devs = db.prepare('SELECT plate FROM devices WHERE fleet_id = ?').all(fid);
  for (let i = 0; i < 2; i++) {
    const dev = devs[i % devs.length];
    insertDR.run(fid, dev.plate, reqStatuses[i % 3], ordStatuses[i % 3], `MTJ${Math.floor(Math.random() * 9999)}`);
  }
}

// Seed Contract Invoices
const insertCI = db.prepare(`INSERT INTO contract_invoices (fleet_id, code, invoice_date, status) VALUES (?,?,?,?)`);
for (let fid of fleetIds) {
  for (let m = 0; m < 3; m++) {
    const month = String(m + 1).padStart(2, '0');
    insertCI.run(fid, `PF${fid}${m + 1}`, `2025-${month}-15`, m === 0 ? 'Onaylandı' : 'Beklemede');
  }
}

console.log('Database seeded successfully!');
console.log(`Fleets: ${fleetIds.length}`);
console.log(`Users: ${db.prepare('SELECT COUNT(*) as c FROM users').get().c}`);
console.log(`Purchases: ${db.prepare('SELECT COUNT(*) as c FROM purchases').get().c}`);
console.log(`Payments: ${db.prepare('SELECT COUNT(*) as c FROM payments').get().c}`);
console.log(`Invoices: ${db.prepare('SELECT COUNT(*) as c FROM invoices').get().c}`);

db.close();
