import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Grid, Button, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const truncateText = (text, maxWords) => {
  const words = text.split(' ');
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
};

const AllCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [waveformActive, setWaveformActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const accessToken = await fetchAccessToken();
      if (!accessToken) return;

      const headers = { Authorization: `Bearer ${accessToken}` };

      const response = await axios.get('https://api.spotify.com/v1/browse/categories', { headers });
      setCategories(response.data.categories.items || []);
      if (response.data.categories.items.length > 0) {
        setSelectedCategory(response.data.categories.items[0].id); // Default to the first category
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryTracks = async (categoryId) => {
    try {
      const accessToken = await fetchAccessToken();
      if (!accessToken) return;

      const headers = { Authorization: `Bearer ${accessToken}` };

      const response = await axios.get(`https://api.spotify.com/v1/browse/categories/${categoryId}/playlists`, { headers });
      if (response.data.playlists?.items) {
        // Assuming that the first playlist's tracks are to be displayed
        const firstPlaylistId = response.data.playlists.items[0].id;
        const tracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${firstPlaylistId}/tracks`, { headers });
        if (tracksResponse.data?.items) {
          const trackList = tracksResponse.data.items.map(item => item.track);
          setTracks(trackList);
          setCurrentTrack(trackList[0]);
          setCurrentTrackIndex(0);
        }
      }
    } catch (error) {
      console.error('Error fetching category tracks:', error);
    }
  };

  const fetchAccessToken = async () => {
    try {
      const response = await axios.get('https://music-app-zhkf.onrender.com/api/token');
      return response.data.accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };

  const handlePlay = async (track, index) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setWaveformActive(true);

    try {
      await axios.post('https://music-app-zhkf.onrender.com/api/history', {
        trackId: track.id,
        trackName: track.name,
        artistNames: track.artists.map(artist => artist.name),
        albumName: track.album.name,
        albumImageUrl: track.album.images[0]?.url || '',
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error saving track to history:', error);
    }
  };

  const handleTrackEnded = () => {
    setWaveformActive(false);
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      const nextTrackIndex = currentTrackIndex + 1;
      setCurrentTrack(tracks[nextTrackIndex]);
      setCurrentTrackIndex(nextTrackIndex);
      setWaveformActive(true);
    } else {
      setCurrentTrack(null);
      setCurrentTrackIndex(null);
    }
  };

  const handlePreviousTrack = () => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      const prevTrackIndex = currentTrackIndex - 1;
      setCurrentTrack(tracks[prevTrackIndex]);
      setCurrentTrackIndex(prevTrackIndex);
      setWaveformActive(true);
    }
  };

  const handleNextTrack = () => {
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      const nextTrackIndex = currentTrackIndex + 1;
      setCurrentTrack(tracks[nextTrackIndex]);
      setCurrentTrackIndex(nextTrackIndex);
      setWaveformActive(true);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryTracks(selectedCategory);
    }
  }, [selectedCategory]);

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {selectedCategory ? (
            <>
              <Button variant="contained" onClick={() => setSelectedCategory(null)} sx={{ mb: 2 }}>
                Back to Categories
              </Button>
              <Box>
                <Grid container spacing={2}>
                  {tracks.map((track, index) => (
                    track && track.name ? (
                      <Grid item xs={12} key={track.id}>
                        <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {track.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {track.artists.map(artist => artist.name).join(', ')}
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={() => handlePlay(track, index)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              backgroundColor: currentTrack && currentTrack.id === track.id ? '#1976d2' : '#ccc',
                            }}
                          >
                            {currentTrack && currentTrack.id === track.id && waveformActive ? (
                              <Box className="waveform-container" sx={{ padding: '10px' }}>
                                <Box className="waveform-bar" />
                                <Box className="waveform-bar" />
                                <Box className="waveform-bar" />
                                <Box className="waveform-bar" />
                                <Box className="waveform-bar" />
                              </Box>
                            ) : (
                              <PlayArrowIcon sx={{ color: '#fff', fontSize: '2rem' }} />
                            )}
                          </IconButton>
                        </Card>
                      </Grid>
                    ) : null
                  ))}
                </Grid>
              </Box>
            </>
          ) : (
            <Grid container spacing={2}>
              {categories.map((category) => (
                category && category.name ? (
                  <Grid item xs={12} sm={6} md={4} lg={2} key={category.id}>
                    <Box sx={{ position: 'relative', '&:hover .overlay': { opacity: 1 } }}>
                      <Card onClick={() => setSelectedCategory(category.id)}>
                        <CardMedia
                          component="img"
                          image={category.icons.length > 0 ? category.icons[0].url : ''}
                          alt={category.name}
                          sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                        />
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {truncateText(category.name, 5)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {truncateText(category.description, 3)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                ) : null
              ))}
            </Grid>
          )}

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
              <img src={currentTrack.album.images[0]?.url} alt={currentTrack.name} style={{ width: '60px', height: '60px', marginRight: '10px' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{currentTrack.name}</Typography>
                <Typography variant="body2" color="text.secondary">{currentTrack.artists.map(artist => artist.name).join(', ')}</Typography>
              </Box>
              <IconButton onClick={handlePreviousTrack} sx={{ color: 'white' }}>
                <SkipPreviousIcon />
              </IconButton>
              <AudioPlayer
                autoPlay
                src={currentTrack.preview_url}
                onEnded={handleTrackEnded}
                style={{ flexGrow: 1, margin: '0 10px' }}
              />
              <IconButton onClick={handleNextTrack} sx={{ color: 'white' }}>
                <SkipNextIcon />
              </IconButton>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AllCategoriesPage;
