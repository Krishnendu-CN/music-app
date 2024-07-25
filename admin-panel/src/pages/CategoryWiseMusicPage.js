import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Grid } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useParams } from 'react-router-dom';

const truncateText = (text, maxWords) => {
  const words = text.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return text;
};

const CategoryWiseMusicPage = () => {
  const { category } = useParams();
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  const fetchCategoryTracks = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/category/${category}`);
      console.log(response.data);
      setTracks(response.data[0].tracks); // Adjust based on actual response structure
    } catch (error) {
      console.error('Error fetching category tracks:', error);
    }
  };

  const handlePlay = (track) => {
    setCurrentTrack(track);
  };

  useEffect(() => {
    if (category) {
      fetchCategoryTracks();
    }
  }, [category]);

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
          zIndex: 9999
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

export default CategoryWiseMusicPage;
