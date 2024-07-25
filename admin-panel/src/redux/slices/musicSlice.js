import { createSlice } from '@reduxjs/toolkit';

export const musicSlice = createSlice({
  name: 'music',
  initialState: {
    tracks: [],
    categories: [],
    currentTrack: null,
  },
  reducers: {
    setTracks: (state, action) => {
      state.tracks = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
    },
    clearCurrentTrack: (state) => {
      state.currentTrack = null;
    },
  },
});

export const { setTracks, setCategories, setCurrentTrack, clearCurrentTrack } = musicSlice.actions;
export default musicSlice.reducer;
