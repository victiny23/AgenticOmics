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
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material'
import {
  AccountTree as AccountTreeIcon,
  PlayArrow as PlayArrowIcon,
  Build as BuildIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'

const PipelinePage: React.FC = () => {
  const pipelineTemplates = [
    {
      title: 'RNA-seq Analysis',
      description: 'Complete RNA sequencing analysis pipeline from raw reads to differential expression',
      steps: ['Quality Control', 'Alignment', 'Quantification', 'Differential Expression'],
      duration: '2-4 hours',
      complexity: 'Intermediate',
    },
    {
      title: 'Variant Calling',
      description: 'Identify genetic variants from whole genome or exome sequencing data',
      steps: ['Read Processing', 'Alignment', 'Variant Calling', 'Annotation'],
      duration: '3-6 hours',
      complexity: 'Advanced',
    },
    {
      title: 'Proteomics Analysis',
      description: 'Mass spectrometry data analysis for protein identification and quantification',
      steps: ['Data Import', 'Peak Detection', 'Protein ID', 'Quantification'],
      duration: '1-2 hours',
      complexity: 'Beginner',
    },
    {
      title: 'Metabolomics Workflow',
      description: 'Comprehensive metabolite analysis and pathway enrichment',
      steps: ['Data Preprocessing', 'Peak Alignment', 'Identification', 'Pathway Analysis'],
      duration: '2-3 hours',
      complexity: 'Intermediate',
    },
  ]

  const activePipelines = [
    { name: 'Sample_001_RNAseq', status: 'Running', progress: 65, step: 'Differential Expression' },
    { name: 'Cohort_A_Variants', status: 'Completed', progress: 100, step: 'Annotation' },
    { name: 'Proteome_Study_1', status: 'Queued', progress: 0, step: 'Waiting' },
  ]



  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Pipeline Management
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Create, execute, and monitor bioinformatics pipelines with drag-and-drop interface and pre-built templates.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Pipeline Builder
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Build custom analysis pipelines using our visual drag-and-drop interface.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<BuildIcon />} size="large">
            Create New Pipeline
          </Button>
          <Button variant="outlined" startIcon={<VisibilityIcon />} size="large">
            View Templates
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Active Pipelines
        </Typography>
        <Grid container spacing={2}>
          {activePipelines.map((pipeline, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {pipeline.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={pipeline.status} 
                      size="small" 
                      color={pipeline.status === 'Completed' ? 'success' : pipeline.status === 'Running' ? 'primary' : 'default'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Step: {pipeline.step}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Progress: {pipeline.progress}%
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                  {pipeline.status === 'Running' && (
                    <Button size="small" color="error">Stop</Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Pipeline Templates
      </Typography>

      <Grid container spacing={3}>
        {pipelineTemplates.map((template, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountTreeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2">
                    {template.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pipeline Steps:
                  </Typography>
                  <Stepper orientation="vertical" sx={{ pl: 2 }}>
                    {template.steps.map((step, stepIndex) => (
                      <Step key={stepIndex} active={true}>
                        <StepLabel>
                          <Typography variant="body2">{step}</Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip label={`${template.duration}`} size="small" />
                  <Chip 
                    label={template.complexity} 
                    size="small" 
                    color={template.complexity === 'Beginner' ? 'success' : template.complexity === 'Intermediate' ? 'warning' : 'error'}
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button variant="contained" startIcon={<PlayArrowIcon />} size="small">
                  Run Pipeline
                </Button>
                <Button variant="outlined" size="small">
                  Customize
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default PipelinePage