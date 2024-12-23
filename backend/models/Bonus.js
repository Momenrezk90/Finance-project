// backend/models/Bonus.js
const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reason: { type: String, required: true },
  amount: { type: Number, required: true },
  attachedFile: { type: String }, // Optional file
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bonus', bonusSchema);
