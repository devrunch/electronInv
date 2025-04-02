const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('../../prisma/generated/remote');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

exports.login = async (req, res) => {

  const { username, password } = req.body;
  console.log(req.body);  

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token, user: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.profile = async (req, res) => {
  const { user } = req;
  return res.status(200).json(user);
};
