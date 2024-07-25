// src/components/Player.js

import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton, Box, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { setCurrentTrack, clearCurrentTrack } from '../redux/slices/musicSlice';

const Player = () => {
  const dispatch = useDispatch();
  const { currentTrack, tracks } = useSelector(state => state.music);
  const audioPlayerRef = useRef(null);

  const handleTrackEnded = () => {
    if (tracks.length > 0) {
      const currentTrackIndex = tracks.findIndex(track => track.id === currentTrack?.id);
      if (currentTrackIndex !== -1 && currentTrackIndex < tracks.length - 1) {
        const nextTrackIndex = currentTrackIndex + 1;
        dispatch(setCurrentTrack(tracks[nextTrackIndex]));
        audioPlayerRef.current.audio.current.play();
      } else {
        dispatch(clearCurrentTrack());
      }
    }
  };

  const handlePreviousTrack = () => {
    if (tracks.length > 0) {
      const currentTrackIndex = tracks.findIndex(track => track.id === currentTrack?.id);
      if (currentTrackIndex > 0) {
        const prevTrackIndex = currentTrackIndex - 1;
        dispatch(setCurrentTrack(tracks[prevTrackIndex]));
        audioPlayerRef.current.audio.current.play();
      }
    }
  };

  const handleNextTrack = () => {
    if (tracks.length > 0) {
      const currentTrackIndex = tracks.findIndex(track => track.id === currentTrack?.id);
      if (currentTrackIndex < tracks.length - 1) {
        const nextTrackIndex = currentTrackIndex + 1;
        dispatch(setCurrentTrack(tracks[nextTrackIndex]));
        audioPlayerRef.current.audio.current.play();
      }
    }
  };

  return (
    currentTrack && (
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
              autoPlay={false}
              src={currentTrack.preview_url}
              showSkipControls={false}
              showJumpControls={false}
              onEnded={handleTrackEnded}
              style={{ width: '100%', borderRadius: '8px', backgroundColor: '#fff' }}
            />
          </Box>
          <IconButton onClick={handleNextTrack} sx={{ color: 'white', fontSize: '2rem' }}>
            <SkipNextIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>
    )
  );
};

export default Player;
