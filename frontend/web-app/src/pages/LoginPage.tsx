import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Link } from '@mui/material';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:8081/login', {
        username,
        password,
      }, { withCredentials: true });
      navigate('/welcome');
    } catch (err: any) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await axios.post('http://localhost:8081/register', {
        username,
        password,
        email,
      });
      setSuccess('Registration successful! You can now log in.');
      setIsRegister(false);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setEmail('');
    } catch (err: any) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Box component="form" onSubmit={isRegister ? handleRegister : handleLogin} sx={{ width: 340, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" mb={2} align="center">{isRegister ? 'Register' : 'Login'}</Typography>
        {isRegister && (
          <TextField
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        )}
        <TextField
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        {isRegister && (
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          {isRegister ? 'Register' : 'Login'}
        </Button>
        <Box mt={2} textAlign="center">
          <Link component="button" variant="body2" onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}>
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;