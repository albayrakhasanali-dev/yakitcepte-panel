const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/schema');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı ve parola gerekli' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  db.close();

  if (!user) return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya parola' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya parola' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, fleet_id: user.fleet_id, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role, fleet_id: user.fleet_id, full_name: user.full_name }
  });
});

router.get('/me', authenticateToken, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, role, fleet_id, full_name FROM users WHERE id = ?').get(req.user.id);
  db.close();
  res.json(user);
});

module.exports = router;
