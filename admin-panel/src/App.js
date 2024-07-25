import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, AppBar, Typography, IconButton, Badge, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Dashboard from './pages/Dashboard';
import CreateUserForm from './components/CreateUserForm';
import UserList from './components/UserList';
import Sidebar from './components/Sidebar';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import PrivateRoute from './components/PrivateRoute';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MusicPage from './pages/MusicPage';
import CategoryWiseMusicPage from './pages/CategoryWiseMusicPage';
import TopChartsPage from './pages/TopChartsPage';
import TopPlaylistPage from './pages/TopPlaylistPage';
import SearchPage from './pages/SearchPage';
import HistoryPage from './pages/HistoryPage';
import AllCategoriesPage from './pages/AllCategoriesPage';

const drawerWidth = 240;

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const setToken = (token) => {
    setAuthToken(token);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setAuthToken('');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchQuery.trim() !== '') {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Determine whether to show the AppBar and Sidebar
  const showTopBarAndSidebar = !['/login', '/register'].includes(location.pathname);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {showTopBarAndSidebar && <Sidebar logout={logout} />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
         
        }}
      >
        {showTopBarAndSidebar && (
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <img
                src="/logo.png"
                alt="Logo"
                style={{ height: 58, marginRight: '16px' }}
              />
              <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, display: 'flex' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search for music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="submit" edge="end">
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: '50%',
                    minWidth: '200px',
                    maxWidth: '400px', margin:'0 auto', bgcolor: 'background.paper', borderRadius: 1 }}
                />
              </Box>
              {authToken ? (
                <>
                  <IconButton color="inherit">
                    <Badge badgeContent={4} color="secondary">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  <IconButton color="inherit" onClick={logout}>
                    <AccountCircle />
                  </IconButton>
                </>
              ) : (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Button color="inherit" onClick={() => navigate('/login')} sx={{ mr: 1 }}>
                    Sign In
                  </Button>
                  <Button color="inherit" onClick={() => navigate('/register')}>
                    Sign Up
                  </Button>
                </Box>
              )}
            </Toolbar>
          </AppBar>
        )}
        {showTopBarAndSidebar && <Toolbar />}
        <Routes sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
        }}>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm setAuthToken={setToken} />} />
          <Route path="/users/list" element={<PrivateRoute authToken={authToken} component={UserList} />} />
          <Route path="/users/new" element={<PrivateRoute authToken={authToken} component={CreateUserForm} />} />
          <Route path="/" element={<MusicPage />} />
          <Route path="/:category" element={<CategoryWiseMusicPage />} />
          <Route path="/top-charts" element={<TopChartsPage />} />
          <Route path="/top-playlists" element={<TopPlaylistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/history" element={<PrivateRoute authToken={authToken} component={HistoryPage} />} />
          <Route path="/music/all-cat" element={<AllCategoriesPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
