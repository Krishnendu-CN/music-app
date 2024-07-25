import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Paper, Typography, styled, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Link } from 'react-router-dom';

// Define the styled component with background image
const BackgroundBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'row',
}));

const ImageSection = styled(Box)(({ theme }) => ({
  flex: 1,
  position: 'relative', // Needed for positioning logo
  backgroundImage: `url('https://staticweb6.jiosaavn.com/web6/jioindw/dist/1721278719/_i/artist/DiljitDosanjh.png')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#960020',
}));

const Logo = styled('img')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2), // Adjust as needed
  left: theme.spacing(2), // Adjust as needed
  height: '60px', // Adjust as needed
}));

const FormSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(4),
}));
const LogoLink = styled(Link)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2), // Adjust as needed
  left: theme.spacing(2), // Adjust as needed
  display: 'inline-block',
}));
const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  width: 400,
  maxWidth: '100%',
}));

const LoginForm = ({ setAuthToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(() => {
    const storedAttempts = localStorage.getItem('attemptCount');
    return storedAttempts ? parseInt(storedAttempts) : 3;
  });
  const [isLocked, setIsLocked] = useState(() => {
    const storedLockStatus = localStorage.getItem('isLocked');
    return storedLockStatus ? JSON.parse(storedLockStatus) : false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('attemptCount', attemptCount);
    localStorage.setItem('isLocked', JSON.stringify(isLocked));

    if (isLocked) {
      setTimeout(() => {
        setIsLocked(false); // Unlock the account after 1 hour
        setAttemptCount(3); // Reset attempts after unlocking
      }, 3600000); // 1 hour in milliseconds
    }
  }, [attemptCount, isLocked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLocked) {
        setDialogMessage('Account is locked. Please try again later.');
        setOpenDialog(true);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      console.log('User logged in:', response.data);

      const token = response.data.token;
      localStorage.setItem('token', token);

      setAuthToken(token);

      navigate('/');
    } catch (error) {
      console.log(error.response.data.message);
      console.error('Error logging in:', error);

      setAttemptCount(prev => prev - 1);

      if (attemptCount === 1) {
        setIsLocked(true); // Lock the account
        setDialogMessage('You have exhausted your login attempts. Account locked for 1 hour.');
        setOpenDialog(true);
      } else {
        setDialogMessage(`Invalid email or password. ${attemptCount - 1} attempts remaining.`);
        setOpenDialog(true);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogMessage('');
  };

  return (
    <BackgroundBox>
      <ImageSection>
        <LogoLink to="/">
          <Logo src="/logo.png" alt="Logo" />
        </LogoLink>
      </ImageSection>
      <FormSection>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
          Welcome to Music Co.
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', textAlign: 'center', mb: 4 }}>
          Login to continue on Music Co.
        </Typography>
        <StyledPaper elevation={3}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              style={{ marginBottom: 20 }}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              style={{ marginBottom: 20 }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
            >
              Login
            </Button>
          </form>
        </StyledPaper>
      </FormSection>

      {/* Dialog for displaying error messages */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Login Error</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </BackgroundBox>
  );
};

export default LoginForm;
