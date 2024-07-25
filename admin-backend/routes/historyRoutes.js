// routes/historyRoutes.js
const express = require('express');
const History = require('../models/History');
const jwtAuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get recently played tracks for a user
router.get('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await History.find({ userId }).sort({ playedAt: -1 }).limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Add a track to the history
router.post('/', jwtAuthMiddleware, async (req, res) => {
  const { trackId, trackName, artistNames, albumName, albumImageUrl } = req.body;
  const userId = req.user.id;

  try {
    // Check if the track is already in the history
    const existingTrack = await History.findOne({ userId, trackId });

    if (existingTrack) {
      existingTrack.playedAt = Date.now();
      await existingTrack.save();
    } else {
      const newTrack = new History({ userId, trackId, trackName, artistNames, albumName, albumImageUrl });
      await newTrack.save();
    }

    res.status(201).json({ message: 'Track added to history' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add track to history' });
  }
});

module.exports = router;
