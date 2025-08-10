import React, { useState } from 'react';
import { Box, Button, Typography, Alert, TextField, Switch, FormControlLabel } from '@mui/material';
import axios from 'axios';

const DataUploadDebug: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [username, setUsername] = useState<string>('testuser');
  const [password, setPassword] = useState<string>('testpass');
  const [useDirectAccess, setUseDirectAccess] = useState<boolean>(false);

  const getBaseUrl = () => {
    return useDirectAccess ? 'http://localhost:8082' : 'http://localhost:12001';
  };

  const login = async () => {
    try {
      setStatus('Logging in...');
      setError('');
      
      const response = await axios.post('http://localhost:12001/api/auth/login', {
        username,
        password
      });
      
      const { token, username: loggedInUsername } = response.data;
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('username', loggedInUsername);
      
      setStatus(`Login successful! Username: ${loggedInUsername}`);
    } catch (err: any) {
      setError(`Login failed: ${err.response?.data?.error || err.message}`);
      setStatus('');
    }
  };

  const testAuth = async () => {
    try {
      setStatus('Testing authentication...');
      const token = localStorage.getItem('jwtToken');
      const username = localStorage.getItem('username');
      
      setStatus(`Token: ${token ? 'Present' : 'Missing'}, Username: ${username || 'Missing'}`);
      
      if (!token) {
        setError('No JWT token found. Please log in first.');
        return;
      }

      // Test the files API
      const response = await axios.get(`${getBaseUrl()}/api/data/files`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      setStatus(`Files API working! Found ${response.data.length} files (using ${useDirectAccess ? 'direct' : 'gateway'} access)`);
      setError('');
    } catch (err: any) {
      setError(`Auth test failed: ${err.message}`);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      }
      setStatus('');
    }
  };

  const testUpload = async () => {
    try {
      setStatus('Testing upload...');
      const token = localStorage.getItem('jwtToken');
      
      if (!token) {
        setError('No JWT token found. Please log in first.');
        return;
      }

      // Create a simple test file
      const testContent = 'This is a test file for debugging';
      const testFile = new File([testContent], 'test-debug.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('description', 'Debug test file');
      formData.append('tags', 'debug,test');
      formData.append('isPublic', 'false');

      const response = await axios.post(
        `${getBaseUrl()}/api/data/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      setStatus(`Upload successful! File ID: ${response.data.id} (using ${useDirectAccess ? 'direct' : 'gateway'} access)`);
      setError('');
    } catch (err: any) {
      setError(`Upload test failed: ${err.message}`);
      if (err.response) {
        setError(`Upload test failed: ${err.response.status} - ${err.response.data?.error || err.message}`);
      }
      setStatus('');
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    setStatus('Logged out successfully');
    setError('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Debug Tool
      </Typography>
      
      {/* Access Mode Toggle */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Access Mode
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={useDirectAccess}
              onChange={(e) => setUseDirectAccess(e.target.checked)}
            />
          }
          label={`Use ${useDirectAccess ? 'Direct Access (port 8082)' : 'API Gateway (port 12001)'}`}
        />
        <Typography variant="body2" color="text.secondary">
          Direct Access: http://localhost:8082 | API Gateway: http://localhost:12001
        </Typography>
      </Box>
      
      {/* Login Section */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Step 1: Login
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="small"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={login}>
            Login
          </Button>
        </Box>
      </Box>

      {/* Test Section */}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={testAuth} sx={{ mr: 2 }}>
          Test Authentication
        </Button>
        <Button variant="contained" onClick={testUpload} sx={{ mr: 2 }}>
          Test Upload
        </Button>
        <Button variant="outlined" onClick={logout}>
          Logout
        </Button>
      </Box>

      {status && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {status}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        <strong>Instructions:</strong>
        <br />
        1. Choose access mode (Direct or Gateway)
        <br />
        2. Login using the credentials above (testuser/testpass)
        <br />
        3. Test authentication to verify your token is working
        <br />
        4. Test upload to verify file upload functionality
        <br />
        5. If everything works, try uploading files through the normal interface
        <br />
        <br />
        <strong>Debugging:</strong>
        <br />
        • If Gateway fails but Direct works: API Gateway issue
        <br />
        • If both fail: Authentication or backend issue
        <br />
        • If both work: Frontend integration issue
      </Typography>
    </Box>
  );
};

export default DataUploadDebug; 