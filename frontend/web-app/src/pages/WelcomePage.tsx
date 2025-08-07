import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Science, 
  Psychology, 
  Analytics, 
  Security,
  Login,
  PersonAdd,
  Biotech,
  Speed,
  CheckCircle,
  AutoAwesome
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/login', { state: { showRegister: true } });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6 }}>
        <Paper
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              {/* Logo and Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    marginRight: 3,
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
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
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
                <Box>
                  <Typography variant="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    AgenticOmics
                  </Typography>
                  <Typography variant="h5" sx={{ opacity: 0.9 }}>
                    AI-Powered Omics Analysis Platform
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Welcome to the Future of Biological Data Analysis
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', opacity: 0.8 }}>
                Transform your experimental data into meaningful insights with our intuitive, 
                AI-powered platform designed for researchers, graduate students, and lab technicians.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<Psychology />}
                  label="AI-Powered"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<Biotech />}
                  label="Multi-Omics"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<Speed />}
                  label="No Coding Required"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 200,
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '4rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  🧬
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Platform Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Platform Features
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Analytics sx={{ fontSize: 40, color: '#1976d2' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Advanced Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Leverage cutting-edge AI algorithms for comprehensive omics data analysis, 
                  pattern recognition, and predictive modeling.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Psychology sx={{ fontSize: 40, color: '#9c27b0' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Intelligent Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discover hidden patterns and correlations in your biological data 
                  through sophisticated machine learning and statistical analysis.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Security sx={{ fontSize: 40, color: '#f57c00' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Secure & Reliable
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enterprise-grade security with encrypted data transmission, 
                  secure authentication, and comprehensive audit trails.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Speed sx={{ fontSize: 40, color: '#388e3c' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Fast & Efficient
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Optimized performance with parallel processing and cloud-native 
                  architecture for lightning-fast analysis results.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Platform Capabilities */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Platform Capabilities
              </Typography>
              <List>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Multi-omics data support (Genomics, Transcriptomics, Proteomics)"
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Standard file formats (FASTQ, BAM, VCF, CSV, H5AD)"
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="AI-powered analysis recommendations"
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Interactive data visualizations"
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Automated quality control"
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Reproducible analysis workflows"
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Call to Action */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Get Started Today
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Join thousands of researchers who are already using AgenticOmics to accelerate 
                their discoveries and unlock new insights.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Login />}
                  onClick={handleLogin}
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 100%)',
                    color: 'white',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #9c27b0 30%, #1976d2 100%)',
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
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#9c27b0',
                      backgroundColor: 'rgba(156, 39, 176, 0.04)',
                    }
                  }}
                >
                  Create Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Tips */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            💡 Why Choose AgenticOmics?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security sx={{ fontSize: 16, color: '#1976d2' }} />
                Your data is securely stored and processed
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome sx={{ fontSize: 16, color: '#9c27b0' }} />
                AI suggests optimal analysis workflows
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed sx={{ fontSize: 16, color: '#f57c00' }} />
                No coding experience required
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default WelcomePage;