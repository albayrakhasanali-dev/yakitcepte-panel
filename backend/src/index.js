require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { getDb, createTables } = require('./db/schema');

// Initialize DB
const db = getDb();
createTables(db);
db.close();

const app = express();

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fleets', require('./routes/fleets'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/export', require('./routes/export'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Yakıt Cepte API running on port ${PORT}`);
});
