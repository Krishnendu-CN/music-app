// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jwtAuthMiddleware = require('./middleware/authMiddleware');
const cors = require('cors'); // Import CORS middleware
const axios = require('axios'); // Import axios for HTTP requests
const getSpotifyAccessToken = require('./middleware/spotifyAuth'); // Import Spotify auth middleware
const historyRoutes = require('./routes/historyRoutes');



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors()); // Use CORS middleware to allow all origins

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', jwtAuthMiddleware, userRoutes); // Protected route with JWT middleware
app.use('/api/history', jwtAuthMiddleware, historyRoutes); // New history routes



app.get('/api/token', async (req, res) => {
  try {
    const accessToken = await getSpotifyAccessToken();
    res.json({ accessToken });
  } catch (error) {
    console.error('Error fetching access token:', error);
    res.status(500).json({ error: 'Failed to fetch access token' });
  }
});

// Aggregation route to count users by their role
app.get('/api/new/roles_new', async (req, res) => {
  try {
    const User = require('./models/User'); // Import the User model
    const rolesCount = await User.aggregateUserRoles(); // Use the aggregation method from the User model
    res.json(rolesCount);
  } catch (error) {
    console.error('Error aggregating user roles:', error);
    res.status(500).json({ error: 'Failed to aggregate user roles' });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // useCreateIndex: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Spotify search route
app.get('/api/search', async (req, res) => {
  const { query } = req.query; // Get search query from request query parameters

  try {
    const accessToken = await getSpotifyAccessToken(); // Get Spotify access token

    // Make request to Spotify API
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        q: query,
        type: 'track',
        limit: 10 // Limit number of results
      }
    });

    res.json(response.data); // Return response from Spotify API
  } catch (error) {
    //console.error('Error searching tracks on Spotify:', error);
    res.status(500).json({ error: 'Failed to search tracks on Spotify' });
  }
});

// Spotify category route
// index.js
// Spotify new releases route (maintaining the same response structure)
app.get('/api/category/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  try {
    const accessToken = await getSpotifyAccessToken();

    // Get new releases from Spotify API
    const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 20 // Number of new releases to fetch
      }
    });

    const newReleases = response.data.albums.items;
    console.log(newReleases);
    
    // Format the response to match your current structure (playlists with tracks)
    // Since new releases are albums, we'll treat each album as a "playlist" with its tracks
    const albumsWithTracks = await Promise.all(newReleases.map(async (album) => {
      // Get the tracks for each album
      const tracksResponse = await axios.get(`https://api.spotify.com/v1/albums/${album.id}/tracks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        id: album.id,
        name: album.name,
        // Include album image for consistency with your frontend if needed
        images: album.images,
        // Format tracks to match your current response structure
        tracks: tracksResponse.data.items
      };
    }));

    res.json(albumsWithTracks); // Return albums with tracks in the same format as before
  } catch (error) {
    console.error('Error fetching new releases from Spotify:', error);
    res.status(500).json({ error: 'Failed to fetch new releases from Spotify' });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ message: 'Unauthorized access' });
  } else {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
