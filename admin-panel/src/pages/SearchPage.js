import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Card, CardContent, CardMedia, Grid, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const truncateText = (text, maxWords) => {
  const words = text.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return text;
};

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchPage = () => {
  const query = useQuery();
  const searchQuery = query.get('query');
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    if (searchQuery) {
      const fetchTracks = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/search', {
            params: { query: searchQuery },
          });
          console.log('Search API Response:', response.data); // Log the API response
          setTracks(response.data.tracks.items);
        } catch (error) {
          console.error('Error searching tracks:', error);
        }
      };

      fetchTracks();
    }
  }, [searchQuery]);

  const handlePlay = async (track) => {
    setCurrentTrack(track);
    // Save the recently played track to localStorage
  try {
      await axios.post('http://localhost:5000/api/history', {
        trackId: track.id,
        trackName: track.name,
        artistNames: track.artists.map(artist => artist.name),
        albumName: track.album.name,
        albumImageUrl: track.album.images[0]?.url || '',
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming you store the token in localStorage
        },
      });
    } catch (error) {
      console.error('Error saving track to history:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Search Results for "{searchQuery}"
      </Typography>
      <Grid container spacing={2}>
        {tracks.map((track) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={track.id}>
            <Box sx={{ position: 'relative', '&:hover .overlay': { opacity: 1 } }}>
              <Card>
                <CardMedia
                  component="img"
                  image={track.album.images.length > 0 ? track.album.images[0].url : ''}
                  alt={track.name}
                  sx={{ height: 140, width: '100%', objectFit: 'cover' }}
                />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {truncateText(track.name, 5)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {truncateText(track.artists.map(artist => artist.name).join(', '), 3)}
                  </Typography>
                </CardContent>
              </Card>
              <Box className="overlay" sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: 0,
                transition: 'opacity 0.3s',
              }}>
                <IconButton onClick={() => handlePlay(track)} sx={{
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: 'white' },
                  borderRadius: '50%',
                  padding: '10px',
                }}>
                  <PlayArrowIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {currentTrack && (
  <Box sx={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    zIndex: 9999 // Increased z-index to ensure it stays in front
  }}>
    <img src={currentTrack.album.images[0].url} alt={currentTrack.name} style={{ width: '100px', height: '100px', borderRadius: '8px', marginRight: '10px' }} />
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h6">{currentTrack.name}</Typography>
      <Typography variant="subtitle1">By: {currentTrack.artists.map(artist_cur => artist_cur.name).join(', ')}</Typography>
    </Box>
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <AudioPlayer
        autoPlay
        src={currentTrack.preview_url}
        showSkipControls
        showJumpControls={false}
        style={{ width: '100%', borderRadius: '8px', backgroundColor: '#fff' }}
      />
    </Box>
  </Box>
)}
    </Box>
  );
};

export default SearchPage;
