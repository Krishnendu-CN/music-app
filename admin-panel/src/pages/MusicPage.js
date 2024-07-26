import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Grid, Button, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Player from '../components/Player'; // Ensure you have this component
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTrack, setTracks } from '../redux/slices/musicSlice';

const categories = [
  { id: 'new-releases', name: '' }
];

const MusicPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracksState] = useState([]);
  const [playlists, setPlaylists] = useState({});
  const [searchPerformed, setSearchPerformed] = useState(false);
  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.music.currentTrack);
  const [playerVisible, setPlayerVisible] = useState(false);

  const handleSearch = async () => {
    setSearchPerformed(true); // Indicate that a search has been performed
    try {
      const response = await axios.get('https://music-app-zhkf.onrender.com/api/search', {
        params: { query: searchQuery },
      });
      console.log('Search API Response:', response.data); // Log the API response
      setTracksState(response.data.tracks.items);
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  };

  const fetchPlaylists = useCallback(async () => {
    try {
      const playlistPromises = categories.map(async (category) => {
        const response = await axios.get(`https://music-app-zhkf.onrender.com/api/category/${category.id}`);
        console.log(`Playlist API Response for ${category.name}:`, response.data); // Log the API response
        return { [category.name]: response.data };
      });

      const playlistsData = await Promise.all(playlistPromises);
      const combinedPlaylists = playlistsData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setPlaylists(combinedPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  }, []);

  const handlePlay = async (track) => {
    console.log(track);
    setPlayerVisible(true);
    dispatch(setCurrentTrack(track));
   
  };

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mt: 2 }}>
        {searchPerformed ? (
          <>
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
            {playerVisible && currentTrack && (
              <Box sx={{ mt: 2 }}>
                <Player src={currentTrack.preview_url} /> {/* Update this to match your track's audio URL */}
              </Box>
            )}
          </>
        ) : (
          Object.keys(playlists).map((category) => (
            <Box key={category} sx={{ mt: 4 }}>
              <Typography variant="h5">{category}</Typography>
              <Grid container spacing={2}>
                {playlists[category].map((playlist) => (
                  <Grid item xs={12} sm={12} md={12} lg={12} key={`${playlist.id}-${Math.random().toString(36).substr(2, 9)}`}>
                    <Typography variant="h6">{playlist.name}</Typography>
                    <Grid container spacing={2}>
                      {playlist.tracks && playlist.tracks.map((track_cat) => (
                        track_cat && track_cat.name ? (
                          <Grid item xs={12} sm={6} md={4} lg={2} key={`grid-${track_cat.id}-${Math.random().toString(36).substr(2, 9)}`}>
                            <Box sx={{ position: 'relative', '&:hover .overlay': { opacity: 1 } }}>
                              <Card>
                                <CardMedia
                                  component="img"
                                  image={track_cat.album.images.length > 0 ? track_cat.album.images[0].url : ''}
                                  alt={track_cat.name}
                                  sx={{ height: 140, width: '100%', objectFit: 'cover' }}
                                />
                                <CardContent sx={{ textAlign: 'center' }}>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {truncateText(track_cat.name, 5)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {truncateText(track_cat.artists.map(artist => artist.name).join(', '), 3)}
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
                                <IconButton onClick={() => handlePlay(track_cat)} sx={{
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
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

const truncateText = (text, maxWords) => {
  const words = text.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return text;
};

export default MusicPage;
