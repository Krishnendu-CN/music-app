import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

const CreateUserForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [open, setOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const authToken = localStorage.getItem('token'); // Retrieve the token from localStorage

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authToken) {
      setDialogMessage('Authentication token not found. Please log in again.');
      setOpen(true);
      return;
    }

    try {
      const newUser = { name, email, password, role };
      const response = await axios.post('http://localhost:5000/api/users', newUser, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      console.log('User created:', response.data);

      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setDialogMessage('User created successfully.');
      setOpen(true);
    } catch (error) {
      console.error('Error creating user:', error);
      setDialogMessage('Error creating user. Please try again.');
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <h2>Create New User</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          style={{ marginBottom: 10 }}
        />
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          style={{ marginBottom: 10 }}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          style={{ marginBottom: 10 }}
        />
        <FormControl variant="outlined" fullWidth style={{ marginBottom: 10 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            label="Role"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          type="submit"
        >
          Create User
        </Button>
      </form>

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

export default CreateUserForm;
