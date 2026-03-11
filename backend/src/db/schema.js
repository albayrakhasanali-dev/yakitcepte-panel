const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function getDb() {
  const dbDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, 'yakitcepte.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

function createTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS fleets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_code TEXT UNIQUE,
      fleet_name TEXT NOT NULL,
      company_name TEXT,
      fuel_status TEXT DEFAULT 'Kapalı',
      payment_type TEXT DEFAULT 'Vadeli',
      balance REAL DEFAULT 0,
      net_balance REAL DEFAULT 0,
      accounted_balance REAL DEFAULT 0,
      waybill REAL DEFAULT 0,
      net_waybill REAL DEFAULT 0,
      defined_limit REAL DEFAULT 0,
      remaining_limit REAL DEFAULT 0,
      sales_rep TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      fleet_id INTEGER REFERENCES fleets(id),
      full_name TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS credit_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      name TEXT,
      type TEXT,
      amount REAL,
      status TEXT DEFAULT 'Aktif'
    );

    CREATE TABLE IF NOT EXISTS device_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      device_count INTEGER DEFAULT 0,
      separate_report INTEGER DEFAULT 1,
      separate_invoice INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      device_group_id INTEGER REFERENCES device_groups(id),
      device_number TEXT,
      plate TEXT NOT NULL,
      limit_behaviour TEXT,
      status TEXT DEFAULT 'Aktif'
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      invoice_no TEXT UNIQUE,
      uuid TEXT,
      ettn TEXT,
      payable_amount REAL,
      service_amount REAL,
      quantity REAL,
      vat_amount REAL,
      invoice_date TEXT,
      due_date TEXT,
      e_invoice INTEGER DEFAULT 1,
      invoice_type TEXT DEFAULT 'Borç',
      envelope_status TEXT,
      envelope_detail TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      city TEXT,
      station_name TEXT,
      station_code TEXT,
      device_group_name TEXT,
      plate TEXT,
      device_number TEXT,
      product TEXT,
      litre REAL,
      unit_price REAL,
      amount REAL,
      discounted_amount REAL,
      vat_rate REAL DEFAULT 18,
      discount_rate REAL DEFAULT 0,
      distributor TEXT,
      kilometre INTEGER DEFAULT 0,
      purchase_date TEXT NOT NULL,
      invoice_period TEXT,
      source TEXT,
      processed INTEGER DEFAULT 0,
      invoice_id INTEGER REFERENCES invoices(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      description TEXT,
      announcement_date TEXT,
      payment_date TEXT,
      amount REAL,
      notes TEXT,
      payment_type TEXT,
      source TEXT,
      external_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
      product TEXT,
      quantity REAL,
      unit_price REAL,
      discount REAL DEFAULT 0,
      vat REAL,
      service_amount REAL,
      vat_base REAL
    );

    CREATE TABLE IF NOT EXISTS monthly_consumption (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      year_month TEXT,
      total_litres REAL,
      change_pct REAL,
      gross_amount REAL
    );

    CREATE TABLE IF NOT EXISTS prepaid_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      card_number TEXT,
      receipt_no TEXT,
      change_amount REAL,
      log_date TEXT
    );

    CREATE TABLE IF NOT EXISTS device_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      plate TEXT,
      request_status TEXT,
      order_status TEXT,
      assembly_code TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contract_invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fleet_id INTEGER REFERENCES fleets(id) ON DELETE CASCADE,
      code TEXT,
      invoice_date TEXT,
      status TEXT
    );
  `);
}

module.exports = { getDb, createTables };
