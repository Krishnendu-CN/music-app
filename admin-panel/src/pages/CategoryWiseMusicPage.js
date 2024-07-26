import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Grid } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTrack, setTracks } from '../redux/slices/musicSlice';

const truncateText = (text, maxWords) => {
  const words = text.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return text;
};

const CategoryWiseMusicPage = () => {
  const { category } = useParams();
  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.music.currentTrack);
  console.log(currentTrack);
  const tracks = useSelector((state) => state.music.tracks);
  const [playerVisible, setPlayerVisible] = useState(false);

  const fetchCategoryTracks = useCallback(async () => {
    try {
      const response = await axios.get(`https://music-app-zhkf.onrender.com/api/category/${category}`);
      console.log(response.data);
      dispatch(setTracks(response.data[0].tracks)); // Adjust based on actual response structure
    } catch (error) {
      console.error('Error fetching category tracks:', error);
    }
  }, [category, dispatch]);

  useEffect(() => {
    if (category) {
      fetchCategoryTracks();
    }
  }, [category, fetchCategoryTracks]);

  const handlePlay = async (track) => {
    setPlayerVisible(true);
    dispatch(setCurrentTrack(track));
    // Save the recently played track to localStorage
    try {
      
    } catch (error) {
      console.error('Error saving track to history:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {category.charAt(0).toUpperCase() + category.slice(1)} Tracks
      </Typography>
      <Grid container spacing={2}>
        {tracks.map((track) => (
          track && track.name ? (
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
          ) : null
        ))}
      </Grid>
     
    </Box>
  );
};

export default CategoryWiseMusicPage;
