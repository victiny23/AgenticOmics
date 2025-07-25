import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Grid,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Analytics,
  BarChart,
  ScatterPlot,
  Timeline,
  PieChart,
  ShowChart,
  AutoAwesome,
  Insights,
} from '@mui/icons-material'

const EDAPage: React.FC = () => {
  const analysisTypes = [
    {
      icon: <BarChart sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Distribution Analysis',
      description: 'Explore data distributions, histograms, and summary statistics',
    },
    {
      icon: <ScatterPlot sx={{ fontSize: 40, color: '#9c27b0' }} />,
      title: 'Correlation Analysis',
      description: 'Identify relationships and correlations between variables',
    },
    {
      icon: <Timeline sx={{ fontSize: 40, color: '#f57c00' }} />,
      title: 'Time Series Analysis',
      description: 'Analyze temporal patterns and trends in your data',
    },
    {
      icon: <PieChart sx={{ fontSize: 40, color: '#388e3c' }} />,
      title: 'Categorical Analysis',
      description: 'Examine categorical variables and their distributions',
    },
  ]

  const quickInsights = [
    'Dataset contains 15,432 genes across 48 samples',
    'Missing values detected in 3.2% of measurements',
    'Strong correlation found between samples from same condition',
    'Potential batch effects identified in samples 12-24',
    'Top 500 most variable genes show clear clustering',
  ]

  const visualizationOptions = [
    'Principal Component Analysis (PCA)',
    'Hierarchical Clustering Heatmap',
    'Volcano Plot',
    'Box Plots by Group',
    'Density Plots',
    'Correlation Matrix',
  ]

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
          Exploratory Data Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Discover patterns, relationships, and insights in your omics data through interactive visualizations and statistical analysis.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Analysis Area */}
        <Grid item xs={12} md={8}>
          {/* Dataset Overview */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Dataset Overview
              </Typography>
              
              {/* Placeholder for data visualization */}
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Analytics sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Interactive Visualization Area
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload data to see interactive plots and analysis results here
                </Typography>
                <Button variant="contained" sx={{ borderRadius: 2 }}>
                  Load Sample Data
                </Button>
              </Paper>
            </CardContent>
          </Card>

          {/* Analysis Types */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Analysis Options
              </Typography>
              <Grid container spacing={3}>
                {analysisTypes.map((analysis, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        {analysis.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {analysis.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* AI Insights */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle', color: '#9c27b0' }} />
                AI Insights
              </Typography>
              <List dense>
                {quickInsights.map((insight, index) => (
                  <ListItem key={index} sx={{ py: 1, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Insights sx={{ fontSize: 16, color: '#1976d2' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={insight}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" size="small" fullWidth>
                  Generate More Insights
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Visualization Options */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                Quick Visualizations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {visualizationOptions.map((option, index) => (
                  <Chip
                    key={index}
                    label={option}
                    variant="outlined"
                    clickable
                    sx={{ justifyContent: 'flex-start' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Export Results
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth>
                  Export Plots (PNG/SVG)
                </Button>
                <Button variant="outlined" fullWidth>
                  Export Data (CSV)
                </Button>
                <Button variant="outlined" fullWidth>
                  Generate Report (PDF)
                </Button>
                <Button variant="outlined" fullWidth>
                  Save Analysis Session
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default EDAPage