import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, List, ListItem, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useNavigate } from 'react-router-dom';

const truncateText = (text, maxWords) => {
  const words = text.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return text;
};

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [waveformActive, setWaveformActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch recently played tracks from the backend
    const fetchHistory = async () => {
      try {
        const response = await axios.get('https://music-app-zhkf.onrender.com/api/history', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setHistory(response.data);
        if (response.data.length > 0) {
          setCurrentTrack(response.data[0]);
          setCurrentTrackIndex(0);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handlePlay = async (track, index) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setWaveformActive(true);

    
  };

  const handleTrackEnded = () => {
    setWaveformActive(false); // Reset waveform on track end
    if (currentTrackIndex !== null && currentTrackIndex < history.length - 1) {
      const nextTrackIndex = currentTrackIndex + 1;
      setCurrentTrack(history[nextTrackIndex]);
      setCurrentTrackIndex(nextTrackIndex);
      setWaveformActive(true); // Activate waveform for next track
    } else {
      setCurrentTrack(null);
      setCurrentTrackIndex(null);
    }
  };

  const handlePreviousTrack = () => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      const prevTrackIndex = currentTrackIndex - 1;
      setCurrentTrack(history[prevTrackIndex]);
      setCurrentTrackIndex(prevTrackIndex);
      setWaveformActive(true);
    }
  };

  const handleNextTrack = () => {
    if (currentTrackIndex !== null && currentTrackIndex < history.length - 1) {
      const nextTrackIndex = currentTrackIndex + 1;
      setCurrentTrack(history[nextTrackIndex]);
      setCurrentTrackIndex(nextTrackIndex);
      setWaveformActive(true);
    }
  };

  const handleBackToPlaylists = () => {
    navigate('/top-playlists'); // Adjust this path if needed
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Recently Played
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : history.length > 0 ? (
        <List>
          {history.map((track, index) => (
            <ListItem
              button
              key={index}
              onClick={() => handlePlay(track, index)}
              sx={{ mb: 1, border: '1px solid #ddd', borderRadius: '8px', p: 1, display: 'flex', alignItems: 'center' }}
            >
              <Card sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                {track.albumImageUrl ? (
                  <CardMedia
                    component="img"
                    image={track.albumImageUrl}
                    alt={track.trackName}
                    sx={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ width: 100, height: 100, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No Image</Typography>
                  </Box>
                )}
                <CardContent sx={{ flex: '1 0 auto', p: 1 }}>
                  <Typography variant="h6" noWrap>{track.trackName}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {track.artistNames.join(', ')}
                  </Typography>
                </CardContent>
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
                    backgroundColor: currentTrack && currentTrack.trackId === track.trackId ? '#1976d2' : '#ccc',
                  }}
                >
                  {currentTrack && currentTrack.trackId === track.trackId && waveformActive ? (
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
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No recent tracks available.
        </Typography>
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
        <img src={currentTrack.albumImageUrl} alt={currentTrack.trackName} style={{ width: '100px', height: '100px', borderRadius: '8px', marginRight: '10px' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{currentTrack.trackName}</Typography>
            <Typography variant="subtitle1">By: {currentTrack.artistNames.join(', ')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600 }}>
            <IconButton onClick={handlePreviousTrack} sx={{ color: 'white', fontSize: '2rem' }}>
              <SkipPreviousIcon fontSize="inherit" />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <AudioPlayer
                src={currentTrack.preview_url}
                showSkipControls={false} // Hide the default skip controls
                showJumpControls={false}
                onEnded={handleTrackEnded} // Handle track end event
                style={{ width: '100%', borderRadius: '8px', backgroundColor: '#fff' }}
              />
            </Box>
            <IconButton onClick={handleNextTrack} sx={{ color: 'white', fontSize: '2rem' }}>
              <SkipNextIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HistoryPage;
