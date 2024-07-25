import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Grid, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';



const TopChartsPage = () => {
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [waveformActive, setWaveformActive] = useState(false); // State for waveform
  const audioPlayerRef = useRef(null); // Ref for AudioPlayer

  const fetchAccessToken = async () => {
    try {
      const response = await axios.get('https://music-app-zhkf.onrender.com/api/token');
      return response.data.accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error);
    }
  };

  const fetchTopCharts = async () => {
    const accessToken = await fetchAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`
    };

    try {
      const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', { headers });
      setAlbums(response.data.albums.items);
    } catch (error) {
      console.error('Error fetching top charts:', error);
    }
  };

  const fetchAlbumTracks = async (albumId) => {
    const accessToken = await fetchAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`
    };

    try {
      const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, { headers });
      setTracks(response.data.items);
      setSelectedAlbum(albums.find(album => album.id === albumId));
    } catch (error) {
      console.error('Error fetching album tracks:', error);
    }
  };

  const handlePlay = async (track, index) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setWaveformActive(true); // Activate waveform
    console.log(track);
    if (audioPlayerRef.current && audioPlayerRef.current.audio) {
      audioPlayerRef.current.audio.current.play(); // Play the track
    }
    // try {
    //   await axios.post('https://music-app-zhkf.onrender.com/api/history', {
    //     trackId: track.id,
    //     trackName: track.name,
    //     artistNames: track.artists.map(artist => artist.name),
    //     albumName: track.album.name,
    //     albumImageUrl: track.album.images[0]?.url || '',
    //   }, {
    //     headers: {
    //       Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming you store the token in localStorage
    //     },
    //   });
    // } catch (error) {
    //   console.error('Error saving track to history:', error);
    // }
  };

  const handleTrackEnded = () => {
    setWaveformActive(false); // Reset waveform on track end
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      const nextTrackIndex = currentTrackIndex + 1;
      setCurrentTrack(tracks[nextTrackIndex]);
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
      setCurrentTrack(tracks[prevTrackIndex]);
      setCurrentTrackIndex(prevTrackIndex);
      setWaveformActive(true); // Activate waveform for previous track
      audioPlayerRef.current.audio.current.play(); // Play the previous track
    }
  };

  const handleNextTrack = () => {
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      const nextTrackIndex = currentTrackIndex + 1;
      setCurrentTrack(tracks[nextTrackIndex]);
      setCurrentTrackIndex(nextTrackIndex);
      setWaveformActive(true); // Activate waveform for next track
      audioPlayerRef.current.audio.current.play(); // Play the next track
    }
  };

  const truncateText = (text, limit) => {
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  };

  useEffect(() => {
    fetchTopCharts();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {selectedAlbum ? selectedAlbum.name : 'Top Charts'}
      </Typography>
      {selectedAlbum ? (
        <Box>
          <Button variant="contained" onClick={() => setSelectedAlbum(null)} sx={{ mb: 2 }}>
            Back to Albums
          </Button>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CardMedia
                component="img"
                image={selectedAlbum.images.length > 0 ? selectedAlbum.images[0].url : ''}
                alt={selectedAlbum.name}
                sx={{ height: 300, width: '100%', objectFit: 'cover' }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {selectedAlbum.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedAlbum.artists.map(artist => artist.name).join(', ')}
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
          {albums.map((album) => (
            album && album.name ? (
              <Grid item xs={12} sm={6} md={4} lg={2} key={album.id}>
                <Box sx={{ position: 'relative', '&:hover .overlay': { opacity: 1 } }}>
                  <Card onClick={() => fetchAlbumTracks(album.id)}>
                    <CardMedia
                      component="img"
                      image={album.images.length > 0 ? album.images[0].url : ''}
                      alt={album.name}
                      sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                    />
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {truncateText(album.name, 15)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {truncateText(album.artists.map(artist => artist.name).join(', '), 15)}
                      </Typography>
                    </CardContent>
                    <Box className="overlay" sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease-in-out',
                    }}>
                      <PlayArrowIcon sx={{ fontSize: '3rem' }} />
                    </Box>
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
                ref={audioPlayerRef}
                autoPlay={true}
                src={currentTrack.preview_url}
                showSkipControls={false} // Hide the default skip controls
                showJumpControls={false}
                onEnded={handleTrackEnded} // Handle track end event
                onPlay={() => setWaveformActive(true)} // Activate waveform on play
                onPause={() => setWaveformActive(false)} // Reset waveform on pause
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

export default TopChartsPage;
