import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardMedia, CircularProgress, Grid, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setTracks, setCurrentTrack, setCategories, clearCurrentTrack } from '../redux/slices/musicSlice'; // Adjust the path if necessary
import Player from '../components/Player';  // Adjust the path if necessary

const TopPlaylistPage = () => {
  const dispatch = useDispatch();
  const tracks = useSelector((state) => state.music.tracks);
  const currentTrack = useSelector((state) => state.music.currentTrack);
  console.log(currentTrack);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
 
  const [loading, setLoading] = useState(true);

  const fetchAccessToken = async () => {
    try {
      const response = await axios.get('https://music-app-zhkf.onrender.com/api/token');
      return response.data.accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };

  const fetchPlaylists = async () => {
    const accessToken = await fetchAccessToken();
    if (!accessToken) return;

    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      const response = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', { headers });
      if (response.data.playlists?.items) {
        setPlaylists(response.data.playlists.items);
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    const accessToken = await fetchAccessToken();
    if (!accessToken) return;

    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, { headers });
      if (response.data?.items) {
        const trackList = response.data.items.map(item => item.track);
        dispatch(setTracks(trackList));
        dispatch(setCurrentTrack(trackList[0]));
        setSelectedPlaylist(playlists.find(playlist => playlist.id === playlistId));
      } else {
        console.error('Unexpected response structure for tracks:', response.data);
      }
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
    }
  };

  const handlePlay = async (track, index) => {
    dispatch(setCurrentTrack(track));
    
    
  };

  const handleTrackEnded = () => {
   
    const currentTrackIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    if (currentTrackIndex !== -1 && currentTrackIndex < tracks.length - 1) {
      const nextTrackIndex = currentTrackIndex + 1;
      dispatch(setCurrentTrack(tracks[nextTrackIndex]));
     
    } else {
      dispatch(clearCurrentTrack());
    }
  };

  const handlePreviousTrack = () => {
    const currentTrackIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    if (currentTrackIndex !== -1 && currentTrackIndex > 0) {
      const prevTrackIndex = currentTrackIndex - 1;
      dispatch(setCurrentTrack(tracks[prevTrackIndex]));
     
    }
  };

  const handleNextTrack = () => {
    const currentTrackIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    if (currentTrackIndex !== -1 && currentTrackIndex < tracks.length - 1) {
      const nextTrackIndex = currentTrackIndex + 1;
      dispatch(setCurrentTrack(tracks[nextTrackIndex]));
      
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {selectedPlaylist && (
            <Button variant="contained" onClick={() => setSelectedPlaylist(null)} sx={{ mb: 2 }}>
              Back to Playlists
            </Button>
          )}
          {selectedPlaylist ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <CardMedia
                    component="img"
                    image={selectedPlaylist.images.length > 0 ? selectedPlaylist.images[0].url : ''}
                    alt={selectedPlaylist.name}
                    sx={{ height: 300, width: '100%', objectFit: 'cover' }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {selectedPlaylist.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedPlaylist.description}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handlePlay(tracks[0], 0)}
                      sx={{
                        mt: 2,
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        width: '100px',
                        height: '40px',
                      }}
                    >
                      Play
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mt: 2 }}>
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
                          {currentTrack && currentTrack.id === track.id ? (
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
          ) : (
            <Grid container spacing={2}>
              {playlists.map((playlist) => (
                playlist && playlist.name ? (
                  <Grid item xs={12} sm={6} md={4} lg={2} key={playlist.id}>
                    <Box sx={{ position: 'relative', '&:hover .overlay': { opacity: 1 } }}>
                      <Card onClick={() => fetchPlaylistTracks(playlist.id)}>
                        <CardMedia
                          component="img"
                          image={playlist.images.length > 0 ? playlist.images[0].url : ''}
                          alt={playlist.name}
                          sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                        />
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {truncateText(playlist.name, 5)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {truncateText(playlist.description, 3)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                ) : null
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default TopPlaylistPage;
