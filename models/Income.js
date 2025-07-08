const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  date: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  userId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
