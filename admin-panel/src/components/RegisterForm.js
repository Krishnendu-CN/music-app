import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, styled, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

// Define the styled component with background image
const BackgroundBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'row',
}));

const ImageSection = styled(Box)(({ theme }) => ({
  flex: 1,
  position: 'relative',
  backgroundImage: `url('https://staticweb6.jiosaavn.com/web6/jioindw/dist/1721278719/_i/artist/DiljitDosanjh.png')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#960020',
}));

const LogoLink = styled(Link)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2), // Adjust as needed
  left: theme.spacing(2), // Adjust as needed
  display: 'inline-block',
}));

const Logo = styled('img')(({ theme }) => ({
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  width: 400,
  maxWidth: '100%',
}));

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState('user'); // Default role is 'user'

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
      console.log('User registered:', response.data);
      // Optionally: Redirect to login or display success message
    } catch (error) {
      console.error('Error registering user:', error);
    }
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
          Register to continue on Music Co.
        </Typography>
        <StyledPaper elevation={3}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              style={{ marginBottom: 20 }}
            />
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
              Register
            </Button>
          </form>
        </StyledPaper>
      </FormSection>
    </BackgroundBox>
  );
};

export default RegisterForm;
