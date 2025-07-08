require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const Expense = require('./models/Expense');
const Income = require('./models/Income');

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/api/expenses', verifyToken, async (req, res) => {
  const expenses = await Expense.find({ userId: req.userId });
  res.json(expenses);
});

app.post('/api/expenses', verifyToken, async (req, res) => {
  const newExpense = new Expense({ ...req.body, userId: req.userId });
  await newExpense.save();
  res.json(newExpense);
});

app.put('/api/expenses/:id', verifyToken, async (req, res) => {
  const updated = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  res.json(updated);
});

app.delete('/api/expenses/:id', verifyToken, async (req, res) => {
  await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ success: true });
});

app.get('/api/income', verifyToken, async (req, res) => {
  const income = await Income.find({ userId: req.userId });
  res.json(income);
});

app.post('/api/income', verifyToken, async (req, res) => {
  const newIncome = new Income({ ...req.body, userId: req.userId });
  await newIncome.save();
  res.json(newIncome);
});

app.put('/api/income/:id', verifyToken, async (req, res) => {
  const updated = await Income.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  res.json(updated);
});

app.delete('/api/income/:id', verifyToken, async (req, res) => {
  await Income.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
