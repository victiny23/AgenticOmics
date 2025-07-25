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
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  ScatterPlot as ScatterPlotIcon,
  Timeline as TimelineIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material'

const EDAPage: React.FC = () => {
  const analysisOptions = [
    {
      title: 'Data Summary',
      description: 'Get basic statistics and overview of your dataset',
      icon: <TableChartIcon fontSize="large" />,
      action: 'Generate Summary',
    },
    {
      title: 'Distribution Analysis',
      description: 'Visualize data distributions and identify patterns',
      icon: <BarChartIcon fontSize="large" />,
      action: 'Create Charts',
    },
    {
      title: 'Correlation Analysis',
      description: 'Explore relationships between variables',
      icon: <ScatterPlotIcon fontSize="large" />,
      action: 'Analyze Correlations',
    },
    {
      title: 'Time Series Analysis',
      description: 'Analyze temporal patterns in your data',
      icon: <TimelineIcon fontSize="large" />,
      action: 'View Trends',
    },
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Exploratory Data Analysis (EDA)
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Discover insights and patterns in your omics data through interactive visualizations and statistical analysis.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Data Upload
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload your omics data files (FASTQ, BAM, VCF, CSV, H5AD) to begin analysis.
        </Typography>
        <Button variant="contained" size="large">
          Upload Data
        </Button>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Analysis Options
      </Typography>

      <Grid container spacing={3}>
        {analysisOptions.map((option, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2, color: 'primary.main' }}>
                  {option.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button size="small" variant="outlined">
                  {option.action}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default EDAPage