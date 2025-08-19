import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  Lock,
  Login,
  Email,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RestrictedAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { username: authUsername } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleRequestActivation = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Debug: Check what's in localStorage
      const storedUsername = localStorage.getItem('username');
      const storedEmail = localStorage.getItem('userEmail');
      const storedToken = localStorage.getItem('jwtToken');
      
      console.log('Debug - localStorage:', {
        storedUsername,
        storedEmail,
        hasToken: !!storedToken,
        authUsername
      });

      const username = authUsername || storedUsername || '';
      const email = storedEmail; // optional

      if (!username) {
        setMessage({
          type: 'error',
          text: 'Username not found. Please log in again.',
        });
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
      headers['X-Username'] = username;

      const requestBody: any = {
        username,
        requestMessage: `User ${username} is requesting account activation.`,
      };
      
      // No need to add email - backend will fetch it from the database

      console.log('Sending request:', { headers, body: requestBody });

      const response = await fetch('http://localhost:12001/api/auth/request-activation', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Activation request sent! Your PI/Team Leader will review it.',
        });
      } else {
        setMessage({
          type: 'error',
          text: responseText || 'Failed to send activation request. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Lock sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Account Restricted
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your account has been deactivated. You can request activation below.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {message && (
            <Alert
              severity={message.type}
              icon={message.type === 'success' ? <CheckCircle /> : <Error />}
              sx={{ mb: 3 }}
            >
              {message.text}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Email />}
              onClick={handleRequestActivation}
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': { background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)' },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Request Account Activation'}
            </Button>

            <Button variant="outlined" size="large" startIcon={<Login />} onClick={handleGoToLogin} sx={{ py: 1.5 }}>
              Back to Login
            </Button>
          </Box>

          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              After sending your request, your PI/Team Leader or an Admin can approve it from the web dashboard.
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RestrictedAccessPage;
