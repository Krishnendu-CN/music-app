import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Card, CardContent, CardMedia, Grid, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Player from '../components/Player'; // Ensure you have this component
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTrack, setTracks } from '../redux/slices/musicSlice';

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
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.music.currentTrack);
  const tracks = useSelector((state) => state.music.tracks);

  const handleSearch = useCallback(async () => {
    setSearchPerformed(true); // Indicate that a search has been performed
    try {
      const response = await axios.get('https://music-app-zhkf.onrender.com/api/search', {
        params: { query: searchQuery },
      });
      console.log('Search API Response:', response.data); // Log the API response
      dispatch(setTracks(response.data.tracks.items));
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  }, [searchQuery, dispatch]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, [searchQuery, handleSearch]);

  const handlePlay = async (track) => {
    console.log(track);
    setPlayerVisible(true);
    dispatch(setCurrentTrack(track));
    // Save the recently played track to localStorage
    try {
      await axios.post('https://music-app-zhkf.onrender.com/api/history', {
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
      
    </Box>
  );
};

export default SearchPage;
