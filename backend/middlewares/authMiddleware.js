const jwt = require('jsonwebtoken');
require('dotenv').config();
const { PrismaClient } = require('../../prisma/generated/remote');
const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

async function authenticateToken(req, res, next) {
  let token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  token = token.replace('Bearer ', '');
  await jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    
    req.user = await prisma.user.findUnique({ where: { username: user.id } });
    next();
  });
}

module.exports = { authenticateToken };
