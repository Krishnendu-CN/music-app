import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Grid, Button, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Player from '../components/Player';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTrack, setTracks } from '../redux/slices/musicSlice';

const TopChartsPage = () => {
  const dispatch = useDispatch();
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracksState] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentTrack = useSelector((state) => state.music.currentTrack);
console.log(currentTrack);
  const fetchAccessToken = useCallback(async () => {
    try {
      const response = await axios.get('https://music-app-zhkf.onrender.com/api/token');
      return response.data.accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  }, []);

  const fetchTopCharts = useCallback(async () => {
    const accessToken = await fetchAccessToken();
    if (!accessToken) return;

    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', { headers });
      setAlbums(response.data.albums.items);
    } catch (error) {
      console.error('Error fetching top charts:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchAccessToken]);

  const fetchAlbumTracks = useCallback(async (albumId) => {
    const accessToken = await fetchAccessToken();
    if (!accessToken) return;

    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, { headers });
      const trackList = response.data.items;
      setTracksState(trackList);
      dispatch(setTracks(trackList));
      dispatch(setCurrentTrack(trackList[0]));
      setSelectedAlbum(albums.find(album => album.id === albumId));
    } catch (error) {
      console.error('Error fetching album tracks:', error);
    }
  }, [albums, dispatch, fetchAccessToken]);

  const handlePlay = useCallback((track) => {
    dispatch(setCurrentTrack(track));
  }, [dispatch]);

  const truncateText = (text, limit) => text.length > limit ? `${text.substring(0, limit)}...` : text;

  useEffect(() => {
    fetchTopCharts();
  }, [fetchTopCharts]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
                  onClick={() => handlePlay(tracks[0])}
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
            {tracks.map((track) => (
              track && track.name ? (
                <TrackCard
                  key={track.id}
                  track={track}
                  isCurrentTrack={currentTrack && currentTrack.id === track.id}
                  onPlay={() => handlePlay(track)}
                />
              ) : null
            ))}
          </Grid>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {albums.map((album) => (
            album && album.name ? (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => fetchAlbumTracks(album.id)}
              />
            ) : null
          ))}
        </Grid>
      )}
     
    </Box>
  );
};

const AlbumCard = React.memo(({ album, onClick }) => (
  <Grid item xs={12} sm={6} md={4} lg={2}>
    <Box sx={{ position: 'relative', '&:hover .overlay': { opacity: 1 } }}>
      <Card onClick={onClick}>
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
));

const TrackCard = React.memo(({ track, isCurrentTrack, onPlay }) => (
  <Grid item xs={12}>
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
        onClick={onPlay}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: 50,
          height: 50,
          borderRadius: '50%',
          backgroundColor: isCurrentTrack ? '#1976d2' : '#ccc',
        }}
      >
        {isCurrentTrack ? (
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
));

const truncateText = (text, limit) => text.length > limit ? `${text.substring(0, limit)}...` : text;

export default TopChartsPage;
