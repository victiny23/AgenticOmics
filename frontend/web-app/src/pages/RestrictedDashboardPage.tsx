import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Avatar,
  Stack,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider
} from '@mui/material';
import { 
  Science, 
  Info,
  Warning,
  Person,
  Email,
  Phone,
  AccessTime
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const RestrictedDashboardPage: React.FC = () => {
  const { username, role } = useAuth();

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, rgba(255, 193, 7, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 152, 0, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto',
        p: 2
      }}
    >
      <Paper
        sx={{
          p: 6,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          maxWidth: 1000,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ff9800, #ffc107, #ff9800)',
            borderRadius: '4px 4px 0 0'
          }
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
              borderRadius: '50%',
              boxShadow: '0 8px 24px rgba(255, 152, 0, 0.3)'
            }}
          >
            <Warning sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 2,
              color: '#d32f2f',
              fontWeight: 700
            }}
          >
            Account Restricted
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              mb: 3,
              fontWeight: 400
            }}
          >
            Your account has been deactivated by the Lab PI
          </Typography>
          
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                fontSize: '1rem'
              }
            }}
          >
            You can still log in but have restricted access to platform features. You can view basic information but cannot access core lab data or analysis tools. Please contact your Lab PI to restore full access.
          </Alert>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* User Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, color: '#333', fontWeight: 600 }}>
            Your Account Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'rgba(255, 152, 0, 0.05)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Person sx={{ color: '#ff9800', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Profile Details
                    </Typography>
                  </Stack>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Username
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {username}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Role
                      </Typography>
                      <Chip 
                        label={role} 
                        color="warning" 
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Account Status
                      </Typography>
                      <Chip 
                        label="Deactivated" 
                        color="error" 
                        variant="filled"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'rgba(255, 193, 7, 0.05)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Info sx={{ color: '#ffc107', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Access Information
                    </Typography>
                  </Stack>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Current Access Level
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#d32f2f' }}>
                        Restricted (Read-Only)
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Available Features
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#666' }}>
                        Basic information only
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date().toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* What You Can Do */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, color: '#333', fontWeight: 600 }}>
            What You Can Do
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <Email sx={{ fontSize: 40, color: '#ff9800', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Contact Lab PI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reach out to your Lab PI to request account reactivation
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <AccessTime sx={{ fontSize: 40, color: '#ffc107', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Wait for Review
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your request will be reviewed and processed accordingly
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <Science sx={{ fontSize: 40, color: '#ff9800', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Stay Updated
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check back regularly for status updates
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            If you believe this is an error, please contact your Lab PI immediately.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            © 2024 AgenticOmics Platform - Restricted Access Mode
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RestrictedDashboardPage; 