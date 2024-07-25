import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, List, ListItem, ListItemText, Divider, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false); // State for dialog
  const [dialogMessage, setDialogMessage] = useState(''); // State for dialog message
  const authToken = localStorage.getItem('token'); // Retrieve the token from localStorage

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!authToken) {
      console.error('No auth token found');
      setDialogMessage('Authentication token not found. Please log in again.');
      setOpen(true);
      return;
    }

    try {
      const response = await axios.get('https://music-app-zhkf.onrender.com/api/users', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setDialogMessage('Error fetching users. Please try again.');
      setOpen(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!authToken) {
      console.error('No auth token found');
      setDialogMessage('Authentication token not found. Please log in again.');
      setOpen(true);
      return;
    }

    try {
      await axios.delete(`https://music-app-zhkf.onrender.com/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setDialogMessage('User deleted successfully.');
      setOpen(true);
      // After successful deletion, fetch users again to update the list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setDialogMessage('Error deleting user. Please try again.');
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <h2>User List</h2>
      <List>
        {users.map((user) => (
          <div key={user._id}>
            <ListItem>
              <ListItemText
                primary={user.name}
                secondary={`Email: ${user.email} | Role: ${user.role}`}
              />
              <Button onClick={() => handleDeleteUser(user._id)} color="secondary">Delete</Button>
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>
      {/* Success/Error Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserList;
