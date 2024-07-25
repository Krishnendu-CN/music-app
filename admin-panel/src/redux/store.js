import { configureStore } from '@reduxjs/toolkit';
import musicReducer from './slices/musicSlice';

export const store = configureStore({
  reducer: {
    music: musicReducer,
  },
});
export default store;