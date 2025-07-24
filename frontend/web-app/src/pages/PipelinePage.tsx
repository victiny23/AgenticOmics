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
  Avatar,
  Divider,
} from '@mui/material'
import {
  AccountTree,
  Add,
  PlayArrow,
  Pause,
  Stop,
  Settings,
  AutoAwesome,
  Schedule,
  CheckCircle,
  Error,
  Biotech,
  Psychology,
  Speed,
} from '@mui/icons-material'

const PipelinePage: React.FC = () => {
  const pipelineTemplates = [
    {
      name: 'RNA-seq Analysis',
      description: 'Complete RNA sequencing analysis from raw reads to differential expression',
      steps: 5,
      duration: '2-4 hours',
      icon: '🧬',
      category: 'Transcriptomics',
    },
    {
      name: 'Proteomics Workflow',
      description: 'Mass spectrometry data processing and protein identification',
      steps: 4,
      duration: '1-2 hours',
      icon: '🔬',
      category: 'Proteomics',
    },
    {
      name: 'Single Cell Analysis',
      description: 'Single-cell RNA-seq analysis with clustering and cell type identification',
      steps: 6,
      duration: '3-5 hours',
      icon: '🔬',
      category: 'Single Cell',
    },
    {
      name: 'Variant Calling',
      description: 'Genomic variant detection and annotation from sequencing data',
      steps: 4,
      duration: '2-3 hours',
      icon: '🧬',
      category: 'Genomics',
    },
  ]

  const runningPipelines = [
    {
      name: 'RNA-seq Analysis - Sample_01',
      progress: 75,
      status: 'running',
      step: 'Differential Expression Analysis',
      timeRemaining: '25 minutes',
    },
    {
      name: 'Proteomics Workflow - Batch_A',
      progress: 100,
      status: 'completed',
      step: 'Report Generation',
      timeRemaining: 'Completed',
    },
    {
      name: 'Single Cell Analysis - Dataset_X',
      progress: 45,
      status: 'running',
      step: 'Cell Clustering',
      timeRemaining: '1.5 hours',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayArrow sx={{ color: '#1976d2' }} />
      case 'completed':
        return <CheckCircle sx={{ color: '#4caf50' }} />
      case 'paused':
        return <Pause sx={{ color: '#ff9800' }} />
      case 'error':
        return <Error sx={{ color: '#f44336' }} />
      default:
        return <Schedule />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'primary'
      case 'completed':
        return 'success'
      case 'paused':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
          Pipeline Builder
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Create, customize, and run analysis pipelines with drag-and-drop interface and AI recommendations.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Pipeline Area */}
        <Grid item xs={12} md={8}>
          {/* Pipeline Builder */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Pipeline Builder
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesome />}
                    sx={{ borderRadius: 2 }}
                  >
                    AI Suggest
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{ borderRadius: 2 }}
                  >
                    New Pipeline
                  </Button>
                </Box>
              </Box>
              
              {/* Drag and Drop Canvas */}
              <Paper
                sx={{
                  p: 6,
                  textAlign: 'center',
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <AccountTree sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drag and Drop Pipeline Components
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start by selecting a template or drag components from the sidebar to build your custom pipeline
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip
                    icon={<Psychology />}
                    label="AI-Powered"
                    sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
                  />
                  <Chip
                    icon={<Biotech />}
                    label="Omics Ready"
                    sx={{ backgroundColor: 'rgba(156, 39, 176, 0.1)' }}
                  />
                  <Chip
                    icon={<Speed />}
                    label="No Code"
                    sx={{ backgroundColor: 'rgba(245, 124, 0, 0.1)' }}
                  />
                </Box>
              </Paper>
            </CardContent>
          </Card>

          {/* Running Pipelines */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Active Pipelines
              </Typography>
              <List>
                {runningPipelines.map((pipeline, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        mb: 2,
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <ListItemIcon>
                        {getStatusIcon(pipeline.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={pipeline.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Current step: {pipeline.step}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Box
                                sx={{
                                  width: 200,
                                  height: 6,
                                  backgroundColor: '#e0e0e0',
                                  borderRadius: 3,
                                  overflow: 'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${pipeline.progress}%`,
                                    height: '100%',
                                    backgroundColor: pipeline.status === 'completed' ? '#4caf50' : '#1976d2',
                                    transition: 'width 0.3s ease',
                                  }}
                                />
                              </Box>
                              <Typography variant="caption">
                                {pipeline.progress}%
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={pipeline.status}
                          color={getStatusColor(pipeline.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {pipeline.timeRemaining}
                        </Typography>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Pipeline Templates */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Pipeline Templates
              </Typography>
              <List dense>
                {pipelineTemplates.map((template, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '1rem' }}>
                        {template.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={template.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {template.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip
                              label={`${template.steps} steps`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={template.duration}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Pipeline Components */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Components
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip label="Data Input" variant="outlined" draggable />
                <Chip label="Quality Control" variant="outlined" draggable />
                <Chip label="Preprocessing" variant="outlined" draggable />
                <Chip label="Alignment" variant="outlined" draggable />
                <Chip label="Quantification" variant="outlined" draggable />
                <Chip label="Statistical Analysis" variant="outlined" draggable />
                <Chip label="Visualization" variant="outlined" draggable />
                <Chip label="Export Results" variant="outlined" draggable />
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth startIcon={<Settings />}>
                  Pipeline Settings
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Schedule />}>
                  Schedule Pipeline
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Stop />}>
                  Stop All Pipelines
                </Button>
                <Divider sx={{ my: 1 }} />
                <Button variant="contained" fullWidth startIcon={<PlayArrow />}>
                  Run Pipeline
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default PipelinePage