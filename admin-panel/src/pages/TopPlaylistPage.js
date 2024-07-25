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

const TopPlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [waveformActive, setWaveformActive] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

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
      setLoading(false); // Set loading to false after fetching data
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
        setTracks(trackList);
        setCurrentTrack(trackList[0]);
        
        setCurrentTrackIndex(0);
        setSelectedPlaylist(playlists.find(playlist => playlist.id === playlistId));
      } else {
        console.error('Unexpected response structure for tracks:', response.data);
      }
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
    }
  };

  // const handlePlay = (track, index) => {
  //   setCurrentTrack(track);
  //   setCurrentTrackIndex(index);
  //   setWaveformActive(true);

  //   // Save the recently played track to localStorage
  //   const currentHistory = JSON.parse(localStorage.getItem('recentTracks')) || [];
  //   const trackExists = currentHistory.some(existingTrack => existingTrack.id === track.id);
  //   if (!trackExists) {
  //     const updatedHistory = [track, ...currentHistory].slice(0, 10);
  //     localStorage.setItem('recentTracks', JSON.stringify(updatedHistory));
  //   }
  // };

   const handlePlay = async (track, index) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setWaveformActive(true);
console.log(track);
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
                <Typography variant="subtitle1">By: {currentTrack.artists.map(artist => artist.name).join(', ')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600 }}>
                <IconButton onClick={handlePreviousTrack} sx={{ color: 'white', fontSize: '2rem' }}>
                  <SkipPreviousIcon fontSize="inherit" />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                  <AudioPlayer
                    src={currentTrack.preview_url}
                    showSkipControls={false}
                    showJumpControls={false}
                    onEnded={handleTrackEnded}
                    onPlay={() => setWaveformActive(true)}
                    onPause={() => setWaveformActive(false)}
                    style={{ width: '100%', borderRadius: '8px', backgroundColor: '#fff' }}
                  />
                </Box>
                <IconButton onClick={handleNextTrack} sx={{ color: 'white', fontSize: '2rem' }}>
                  <SkipNextIcon fontSize="inherit" />
                </IconButton>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default TopPlaylistPage;
