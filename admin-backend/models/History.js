// models/History.js
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trackId: {
    type: String,
    required: true,
  },
  trackName: String,
  artistNames: [String],
  albumName: String,
  albumImageUrl: String,
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

const History = mongoose.model('History', historySchema);

module.exports = History;
