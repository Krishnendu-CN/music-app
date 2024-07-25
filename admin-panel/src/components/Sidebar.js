import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, Button, Drawer, Box, Typography } from '@mui/material';

const Sidebar = ({ logout }) => {
  const [userRole, setUserRole] = React.useState('');
  const authToken = localStorage.getItem('token');

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (authToken) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/role', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const data = await response.json();
          console.log(data);
          setUserRole(data.role);
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, [authToken]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <Typography variant="h6" sx={{ my: 2, textAlign: 'center' }}>
          Admin Panel
        </Typography>
        <List>
          
          {userRole === 'admin' && (
            <>
              
              <ListItem button component={Link} to="/users/list">
                <ListItemText primary="Users" />
              </ListItem>
              <ListItem button component={Link} to="/users/new">
                <ListItemText primary="Create New User" />
              </ListItem>
            </>
          )}
          <ListItem button component={Link} to="/">
            <ListItemText primary="Music" />
          </ListItem>
          <ListItem button component={Link} to="/new-releases">
            <ListItemText primary="New Releases" />
          </ListItem>
           <ListItem button component={Link} to="/top-charts">
            <ListItemText primary="Top Charts" />
          </ListItem>
           <ListItem button component={Link} to="/top-playlists">
            <ListItemText primary="Top Playlists" />
          </ListItem>
           <ListItem button component={Link} to="/history">
            <ListItemText primary="History" />
          </ListItem>
          {userRole === 'admin' && (
            <>
              <ListItem>
              <Button variant="contained" color="secondary" onClick={logout} fullWidth>
                Logout
              </Button>
              </ListItem>
            </>
          )}
          
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
