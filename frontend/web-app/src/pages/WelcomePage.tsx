import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Avatar,
  Stack,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { 
  Science, 
  Login,
  PersonAdd,
  AutoAwesome
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, username, photoUrl } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/login', { state: { showRegister: true } });
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.14) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0, 255, 136, 0.10) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(0, 153, 255, 0.10) 0%, transparent 50%),
          linear-gradient(135deg, #0f172a 0%, #1f2937 100%)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none'
        }
      }}
    >
        {/* Top App Bar with right-side avatar/login */}
        <AppBar position="absolute" elevation={0} sx={{ background: 'transparent', boxShadow: 'none', top: 0 }}>
          <Toolbar sx={{ minHeight: 56 }}>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={() => navigate(isAuthenticated ? '/settings' : '/login')} sx={{ color: '#ffffff' }}>
              {isAuthenticated ? (
                <Avatar
                  sx={{ width: 32, height: 32 }}
                  src={photoUrl ? (photoUrl.startsWith('http') ? photoUrl : `http://localhost:12001${photoUrl}`) : undefined}
                >
                  {!photoUrl && (username ? username.charAt(0) : 'U')}
                </Avatar>
              ) : (
                <Login sx={{ color: '#ffffff' }} />
              )}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Paper
          sx={{
            p: 8,
            borderRadius: 6,
            background: 'rgba(12,12,12,0.9)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 32px 96px rgba(0,0,0,0.6), 0 8px 32px rgba(0, 212, 255, 0.15)',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            maxWidth: 1400,
            mx: 'auto',
            width: '95%',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #00d4ff, #00ff88, #0099ff, #00d4ff)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s linear infinite'
            }
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 8 }}>
            <Box
              sx={{
                width: 280,
                height: 280,
                margin: '0 auto 4rem',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 16px 48px rgba(0, 212, 255, 0.4))',
                animation: 'float 6s ease-in-out infinite'
              }}
            >
              {/* Try to load the uploaded logo first */}
              <img 
                src="/agenticomics-logo.png" 
                alt="AgenticOmics Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 24px rgba(0, 212, 255, 0.3))'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.altTried) {
                    target.dataset.altTried = '1';
                    target.src = '/logo%20new.png';
                    return;
                  }
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback Logo with gradient matching your brand */}
              <Avatar
                sx={{
                  width: 280,
                  height: 280,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 50%, #0099ff 100%)',
                  fontSize: '6rem',
                  display: 'none',
                  boxShadow: '0 20px 60px rgba(0, 212, 255, 0.6)',
                  animation: 'pulse 3s ease-in-out infinite'
                }}
              >
                <Science sx={{ fontSize: 120, color: 'white' }} />
              </Avatar>
            </Box>
          </Box>

          {/* Title */}
          <Typography 
            variant="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              letterSpacing: '0.5px',
              mb: 2,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Box component="span" sx={{ color: '#00d4ff' }}>Agentic</Box>
            <Box component="span" sx={{ color: '#00ff88' }}>Omics</Box>
          </Typography>

          <Typography 
            variant="h3" 
            sx={{ 
              mb: 4,
              color: '#e5e7eb',
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem', lg: '2.5rem' },
              letterSpacing: '0.02em',
              lineHeight: 1.3,
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
              opacity: 0.95
            }}
          >
            AI-Powered Omics Analysis Platform
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255,255,255,0.78)',
              mb: 6,
              fontSize: '1.1rem',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Transform your experimental data into meaningful insights with our intuitive, 
            AI-powered platform designed for researchers, graduate students, and lab technicians.
          </Typography>

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            sx={{ mb: 4 }}
          >
                                    <Button
                          variant="contained"
                          size="large"
                          startIcon={<Login />}
                          onClick={handleLogin}
                          sx={{
                            background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 50%, #0099ff 100%)',
                            color: 'white',
                            py: 2.5,
                            px: 5,
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            borderRadius: 4,
                            minWidth: 220,
                            boxShadow: '0 8px 32px rgba(0, 212, 255, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #00ff88 0%, #0099ff 50%, #00d4ff 100%)',
                              boxShadow: '0 12px 40px rgba(0, 212, 255, 0.6)',
                              transform: 'translateY(-3px)'
                            }
                          }}
                        >
                          Sign In
                        </Button>

                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={<PersonAdd />}
                          onClick={handleRegister}
                          sx={{
                            borderColor: '#00d4ff',
                            borderWidth: 2,
                            color: '#00d4ff',
                            py: 2.5,
                            px: 5,
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            borderRadius: 4,
                            minWidth: 220,
                            backgroundColor: 'rgba(0, 212, 255, 0.05)',
                            '&:hover': {
                              borderColor: '#00ff88',
                              backgroundColor: 'rgba(0, 255, 136, 0.1)',
                              transform: 'translateY(-3px)',
                              boxShadow: '0 8px 24px rgba(0, 255, 136, 0.3)'
                            }
                          }}
                        >
                          Create Account
                        </Button>
          </Stack>

          {/* Quick Features */}
          <Box sx={{ mt: 6 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                mb: 3,
                fontWeight: 600
              }}
            >
              Why Choose AgenticOmics?
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
              sx={{ flexWrap: 'wrap', maxWidth: 900, mx: 'auto' }}
            >
                                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 3,
                            py: 1.5,
                            borderRadius: 3,
                            backgroundColor: 'rgba(0, 212, 255, 0.15)',
                            color: '#00d4ff',
                            boxShadow: '0 2px 8px rgba(0, 212, 255, 0.2)'
                          }}>
                            <AutoAwesome sx={{ fontSize: 22 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              AI-Powered Analysis
                            </Typography>
                          </Box>

                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 3,
                            py: 1.5,
                            borderRadius: 3,
                            backgroundColor: 'rgba(0, 255, 136, 0.15)',
                            color: '#00ff88',
                            boxShadow: '0 2px 8px rgba(0, 255, 136, 0.2)'
                          }}>
                            <Science sx={{ fontSize: 22 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Multi-Omics Support
                            </Typography>
                          </Box>

                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 3,
                            py: 1.5,
                            borderRadius: 3,
                            backgroundColor: 'rgba(0, 153, 255, 0.15)',
                            color: '#0099ff',
                            boxShadow: '0 2px 8px rgba(0, 153, 255, 0.2)'
                          }}>
                            <AutoAwesome sx={{ fontSize: 22 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              No Coding Required
                            </Typography>
                          </Box>
            </Stack>
          </Box>
                  </Paper>
        </Box>
  );
};

export default WelcomePage;