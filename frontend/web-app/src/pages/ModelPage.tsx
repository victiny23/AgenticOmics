import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Psychology as ModelIcon,
  TrendingUp as PerformanceIcon,
  Settings as ConfigIcon,
  PlayArrow as TrainIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Assessment as MetricsIcon,
} from '@mui/icons-material'

const ModelPage: React.FC = () => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Model Development
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Build, train, and optimize machine learning models for your omics data analysis.
        </Typography>
      </Box>

      {/* Model Training Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrainIcon color="primary" />
                Model Training
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure and train machine learning models on your preprocessed omics data.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Training Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="body2">Random Forest Classifier</Typography>
                  <Chip label="Training" color="warning" size="small" />
                </Box>
                <LinearProgress variant="determinate" value={67} sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Epoch 67/100 - ETA: 5 minutes
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" startIcon={<TrainIcon />}>
                  Start Training
                </Button>
                <Button variant="outlined" startIcon={<StopIcon />}>
                  Stop Training
                </Button>
                <Button variant="outlined" startIcon={<ConfigIcon />}>
                  Configure Model
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MetricsIcon color="primary" />
                Training Metrics
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Accuracy" 
                    secondary="0.847"
                    secondaryTypographyProps={{ sx: { fontWeight: 600, color: 'success.main' } }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Loss" 
                    secondary="0.234"
                    secondaryTypographyProps={{ sx: { fontWeight: 600, color: 'warning.main' } }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="F1-Score" 
                    secondary="0.823"
                    secondaryTypographyProps={{ sx: { fontWeight: 600, color: 'info.main' } }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Training Time" 
                    secondary="12m 34s"
                    secondaryTypographyProps={{ sx: { fontWeight: 600 } }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Model Types */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Available Model Types
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ModelIcon color="primary" />
                <Typography variant="h6">Classification Models</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Predict categorical outcomes from your omics data
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Supported Algorithms:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label="Random Forest" size="small" />
                <Chip label="SVM" size="small" />
                <Chip label="Neural Networks" size="small" />
                <Chip label="XGBoost" size="small" />
              </Box>
              <Button variant="outlined" fullWidth>
                Create Classifier
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PerformanceIcon color="primary" />
                <Typography variant="h6">Regression Models</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Predict continuous values and quantitative traits
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Supported Algorithms:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label="Linear Regression" size="small" />
                <Chip label="Ridge/Lasso" size="small" />
                <Chip label="Random Forest" size="small" />
                <Chip label="Deep Learning" size="small" />
              </Box>
              <Button variant="outlined" fullWidth>
                Create Regressor
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ConfigIcon color="primary" />
                <Typography variant="h6">Clustering Models</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Discover hidden patterns and group similar samples
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Supported Algorithms:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label="K-Means" size="small" />
                <Chip label="Hierarchical" size="small" />
                <Chip label="DBSCAN" size="small" />
                <Chip label="Gaussian Mixture" size="small" />
              </Box>
              <Button variant="outlined" fullWidth>
                Create Clustering
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Model Management */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SaveIcon color="primary" />
            Model Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Save, load, and manage your trained models for future use and deployment.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<SaveIcon />}>
              Save Current Model
            </Button>
            <Button variant="outlined" startIcon={<UploadIcon />}>
              Load Saved Model
            </Button>
            <Button variant="outlined" startIcon={<ConfigIcon />}>
              Model Settings
            </Button>
            <Button variant="outlined" startIcon={<MetricsIcon />}>
              View All Models
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ModelPage