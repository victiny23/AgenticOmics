import React from 'react'
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
} from '@mui/material'
import {
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
} from '@mui/icons-material'

const ModelPage: React.FC = () => {
  const modelCategories = [
    {
      title: 'Predictive Models',
      description: 'Build models to predict biological outcomes and phenotypes',
      icon: <TrendingUpIcon fontSize="large" />,
      models: ['Classification', 'Regression', 'Survival Analysis'],
      action: 'Build Model',
    },
    {
      title: 'AI-Powered Analysis',
      description: 'Leverage large language models for biological interpretation',
      icon: <PsychologyIcon fontSize="large" />,
      models: ['GPT-4 Bio', 'Claude Scientific', 'Custom LLMs'],
      action: 'Configure AI',
    },
    {
      title: 'AutoML Solutions',
      description: 'Automated machine learning for omics data analysis',
      icon: <AutoAwesomeIcon fontSize="large" />,
      models: ['AutoML Pipeline', 'Feature Selection', 'Hyperparameter Tuning'],
      action: 'Start AutoML',
    },
    {
      title: 'Specialized Models',
      description: 'Domain-specific models for different omics types',
      icon: <ScienceIcon fontSize="large" />,
      models: ['Genomics', 'Transcriptomics', 'Proteomics', 'Metabolomics'],
      action: 'Select Model',
    },
  ]

  const recentModels = [
    { name: 'RNA-seq Classifier', type: 'Classification', accuracy: '94.2%', status: 'Trained' },
    { name: 'Protein Expression Predictor', type: 'Regression', accuracy: '87.8%', status: 'Training' },
    { name: 'Metabolite Pathway Analysis', type: 'Clustering', accuracy: '91.5%', status: 'Deployed' },
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Model Development & AI Analysis
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Build, train, and deploy machine learning models for omics data analysis with AI-powered insights.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Models
        </Typography>
        <Grid container spacing={2}>
          {recentModels.map((model, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {model.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip label={model.type} size="small" />
                    <Chip 
                      label={model.status} 
                      size="small" 
                      color={model.status === 'Deployed' ? 'success' : model.status === 'Training' ? 'warning' : 'default'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Accuracy: {model.accuracy}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                  <Button size="small">Deploy</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Model Categories
      </Typography>

      <Grid container spacing={3}>
        {modelCategories.map((category, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {category.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {category.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Available Models:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {category.models.map((model, modelIndex) => (
                    <Chip key={modelIndex} label={model} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button variant="contained" size="small">
                  {category.action}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          AI Chat Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Get help with model selection, parameter tuning, and result interpretation through our AI assistant.
        </Typography>
        <Button variant="outlined" size="large">
          Start AI Chat
        </Button>
      </Paper>
    </Container>
  )
}

export default ModelPage