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
  ListItemText,
} from '@mui/material';
import {
  CloudUpload,
  Analytics,
  AccountTree,
  Assessment,
  AutoAwesome,
  Speed,
  CheckCircle,
  TrendingUp,
  Psychology,
  Biotech,
  Security,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
              const { username, role } = useAuth();

  const features = [
    {
      icon: <CloudUpload sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Smart Data Upload',
      description: 'Drag and drop your omics data files with automatic format detection and validation.',
      action: () => navigate('/data'),
      buttonText: 'Upload Data',
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#9c27b0' }} />,
      title: 'Exploratory Analysis',
      description: 'Interactive visualizations and statistical analysis to understand your data.',
      action: () => navigate('/eda'),
      buttonText: 'Explore Data',
    },
    {
      icon: <AccountTree sx={{ fontSize: 40, color: '#f57c00' }} />,
      title: 'AI Pipeline Builder',
      description: 'Create analysis workflows with drag-and-drop interface and AI recommendations.',
      action: () => navigate('/pipeline'),
      buttonText: 'Build Pipeline',
    },
    {
      icon: <Assessment sx={{ fontSize: 40, color: '#388e3c' }} />,
      title: 'Results & Insights',
      description: 'View, interpret, and export your analysis results with AI-generated insights.',
      action: () => navigate('/result'),
      buttonText: 'View Results',
    },
  ];

  const capabilities = [
    'Multi-omics data support (Genomics, Transcriptomics, Proteomics)',
    'Standard file formats (FASTQ, BAM, VCF, CSV, H5AD)',
    'AI-powered analysis recommendations',
    'Interactive data visualizations',
    'Automated quality control',
    'Reproducible analysis workflows',
  ];

  const recentActivity = [
    { action: 'Data uploaded', file: 'RNA_seq_sample_01.fastq', time: '2 hours ago' },
    { action: 'Pipeline completed', name: 'Differential Expression Analysis', time: '1 day ago' },
    { action: 'Results exported', format: 'PDF Report', time: '2 days ago' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6 }}>
        <Paper
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
                                        <Typography variant="h2" gutterBottom sx={{ fontWeight: 600 }}>
                            Welcome back, {username}! 👋
                          </Typography>
                          <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                            {role}
                          </Typography>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Ready to continue your omics analysis journey?
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

      {/* Quick Actions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Get Started
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={feature.action}
                    sx={{ borderRadius: 2 }}
                  >
                    {feature.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Platform Capabilities and Recent Activity */}
      <Grid container spacing={4}>
        {/* Platform Capabilities */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Platform Capabilities
              </Typography>
              <List>
                {capabilities.map((capability, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={capability}
                      primaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <ListItem key={index} sx={{ py: 1, px: 0 }}>
                    <ListItemIcon>
                      <TrendingUp sx={{ color: '#1976d2' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.file || activity.name || activity.format} • ${activity.time}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="outlined" size="small">
                  View All Activity
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
            💡 Quick Tips
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

export default DashboardPage; 