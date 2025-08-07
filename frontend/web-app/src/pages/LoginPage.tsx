import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Link, Container, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Science } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
                const [telephoneReg, setTelephoneReg] = useState('');
              const [confirmPassword, setConfirmPassword] = useState('');
              const [success, setSuccess] = useState('');
              const [resetToken, setResetToken] = useState('');
              const [newPassword, setNewPassword] = useState('');
              const [confirmNewPassword, setConfirmNewPassword] = useState('');
              const [loginMethod, setLoginMethod] = useState<'username' | 'telephone'>('username');
              const [role, setRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
                const { login } = useAuth();

              // Role options
              const roleOptions = [
                'Lab PI',
                'Master Student', 
                'PhD Student',
                'Data Analyst',
                'Technician',
                'Professor'
              ];

              // Check if we should show register form based on navigation state
              useEffect(() => {
                if (location.state?.showRegister) {
                  setIsRegister(true);
                }
              }, [location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const loginData = {
        password,
        ...(loginMethod === 'username' ? { username } : { telephone })
      };
      
                        const response = await axios.post('http://localhost:12001/api/auth/login', loginData);

                  // Use auth context to login
                  login(response.data.token, response.data.username, response.data.role);
      
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
                if (!role) {
                  setError('Please select a role.');
                  return;
                }
                try {
                  await axios.post('http://localhost:12001/api/auth/register', {
                    username,
                    password,
                    email,
                    telephone: telephoneReg,
                    role,
                  });
                  setSuccess('Registration successful! You can now log in.');
                  setIsRegister(false);
                  setUsername('');
                  setPassword('');
                  setConfirmPassword('');
                  setEmail('');
                  setTelephoneReg('');
                  setRole('');
                } catch (err: any) {
                  setError('Registration failed. Please try again.');
                }
              };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('http://localhost:12001/api/auth/forgot-password', {
        email,
      });
      setSuccess('Password reset link sent to your email. Check your inbox.');
      setIsForgotPassword(false);
      setEmail('');
    } catch (err: any) {
      setError('Failed to send reset link. Please check your email address.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await axios.post('http://localhost:12001/api/auth/reset-password', {
        resetToken,
        newPassword,
      });
      setSuccess('Password reset successful! You can now log in with your new password.');
      setIsResetPassword(false);
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError('Failed to reset password. Please check your reset token.');
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Paper
          component="form" 
          onSubmit={
            isRegister ? handleRegister : 
            isForgotPassword ? handleForgotPassword : 
            isResetPassword ? handleResetPassword : 
            handleLogin
          } 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <img 
              src="/logo.png" 
              alt="AgenticOmics Logo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback Logo */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 30% 70%, #00d4ff 0%, #00ff88 100%)',
                borderRadius: '50%',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <Science sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </Box>
          
          <Typography variant="h4" mb={3} sx={{ fontWeight: 600, color: '#1e3c72' }}>
            {isRegister ? 'Create Account' : isForgotPassword ? 'Forgot Password' : isResetPassword ? 'Reset Password' : 'Welcome Back'}
          </Typography>
          
          {!isRegister && !isForgotPassword && !isResetPassword && (
            <>
              {/* Login Method Toggle */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant={loginMethod === 'username' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setLoginMethod('username')}
                  sx={{ flex: 1 }}
                >
                  Username
                </Button>
                <Button
                  variant={loginMethod === 'telephone' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setLoginMethod('telephone')}
                  sx={{ flex: 1 }}
                >
                  Phone Number
                </Button>
              </Box>
              
              {/* Login Fields */}
              {loginMethod === 'username' ? (
                <TextField
                  label="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                />
              ) : (
                <TextField
                  label="Phone Number"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  placeholder="+1234567890"
                />
              )}
              
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            </>
          )}
          
          {isRegister && (
            <>
              <TextField
                label="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                required
                type="email"
              />
                                        <TextField
                            label="Phone Number (Optional)"
                            value={telephoneReg}
                            onChange={e => setTelephoneReg(e.target.value)}
                            fullWidth
                            margin="normal"
                            placeholder="+1234567890"
                          />
                          <FormControl fullWidth margin="normal" required>
                            <InputLabel>Role</InputLabel>
                            <Select
                              value={role}
                              label="Role"
                              onChange={(e) => setRole(e.target.value)}
                            >
                              {roleOptions.map((roleOption) => (
                                <MenuItem key={roleOption} value={roleOption}>
                                  {roleOption}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                          />
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            </>
          )}
          
          {isForgotPassword && (
            <TextField
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              type="email"
            />
          )}
          
          {isResetPassword && (
            <>
              <TextField
                label="Reset Token"
                value={resetToken}
                onChange={e => setResetToken(e.target.value)}
                fullWidth
                margin="normal"
                required
                placeholder="Enter the token from your email"
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            </>
          )}
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 3 }}
          >
            {isRegister ? 'Register' : isForgotPassword ? 'Send Reset Link' : isResetPassword ? 'Reset Password' : 'Login'}
          </Button>
          
          <Box mt={2} textAlign="center">
            {!isRegister && !isForgotPassword && !isResetPassword && (
              <>
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
                  sx={{ display: 'block', mb: 1 }}
                >
                  Don't have an account? Register
                </Link>
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                >
                  Forgot your password?
                </Link>
              </>
            )}
            
            {isRegister && (
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
              >
                Already have an account? Login
              </Link>
            )}
            
            {isForgotPassword && (
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }}
              >
                Back to Login
              </Link>
            )}
            
            {isResetPassword && (
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => { setIsResetPassword(false); setError(''); setSuccess(''); }}
              >
                Back to Login
              </Link>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;