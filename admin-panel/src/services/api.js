// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://music-app-zhkf.onrender.com', // Replace with your API URL
});

export default API;
