// middleware/spotifyAuth.js
const axios = require('axios');
const qs = require('qs');

let accessToken = null;
let tokenExpiresAt = null;

const getSpotifyAccessToken = async () => {
  if (accessToken && tokenExpiresAt > Date.now()) {
    return accessToken;
  }

  const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
    grant_type: 'client_credentials'
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    }
  });

  accessToken = response.data.access_token;
  tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

  return accessToken;
};

module.exports = getSpotifyAccessToken;
