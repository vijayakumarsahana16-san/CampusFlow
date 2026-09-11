const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  const { fullName, email, collegeName, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    user = await User.create({ fullName, email, collegeName, password });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, fullName, email, collegeName } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received with:', { email, password }); // Debugging line

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, collegeName: user.collegeName } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
};