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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material'
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material'

const ResultPage: React.FC = () => {
  const analysisResults = [
    {
      title: 'Differential Gene Expression',
      description: 'RNA-seq analysis identifying significantly expressed genes',
      icon: <TrendingUpIcon fontSize="large" />,
      status: 'Completed',
      date: '2024-01-15',
      type: 'Transcriptomics',
    },
    {
      title: 'Protein Pathway Analysis',
      description: 'Functional enrichment and pathway mapping results',
      icon: <ScienceIcon fontSize="large" />,
      status: 'Completed',
      date: '2024-01-14',
      type: 'Proteomics',
    },
    {
      title: 'Metabolite Classification',
      description: 'Machine learning model predictions for metabolite classes',
      icon: <AnalyticsIcon fontSize="large" />,
      status: 'Running',
      date: '2024-01-16',
      type: 'Metabolomics',
    },
  ]

  const recentResults = [
    { name: 'DEG_analysis_results.xlsx', analysis: 'Differential Expression', size: '2.1 MB', downloads: 45 },
    { name: 'pathway_enrichment.pdf', analysis: 'Pathway Analysis', size: '856 KB', downloads: 23 },
    { name: 'model_predictions.csv', analysis: 'ML Classification', size: '145 KB', downloads: 12 },
    { name: 'quality_control_report.html', analysis: 'QC Analysis', size: '3.2 MB', downloads: 67 },
  ]

  const summaryStats = [
    { label: 'Total Analyses', value: '127', change: '+12%' },
    { label: 'Completed Jobs', value: '98', change: '+8%' },
    { label: 'Active Projects', value: '15', change: '+3%' },
    { label: 'Data Processed', value: '2.4 TB', change: '+25%' },
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Analysis Results
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          View, download, and share results from your omics data analyses and machine learning models.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="caption" color="success.main">
                  {stat.change} from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Analysis Results
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>Analysis Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Downloads</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentResults.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.name}</TableCell>
                  <TableCell>{result.analysis}</TableCell>
                  <TableCell>{result.size}</TableCell>
                  <TableCell>{result.downloads}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<ViewIcon />}>
                        View
                      </Button>
                      <Button size="small" startIcon={<DownloadIcon />}>
                        Download
                      </Button>
                      <Button size="small" startIcon={<ShareIcon />}>
                        Share
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Analysis Categories
      </Typography>

      <Grid container spacing={3}>
        {analysisResults.map((analysis, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {analysis.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {analysis.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {analysis.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={analysis.status} 
                    size="small" 
                    color={analysis.status === 'Completed' ? 'success' : 'warning'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {analysis.date}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Type: {analysis.type}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button variant="contained" size="small" startIcon={<ViewIcon />}>
                  View Results
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Export & Collaboration
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Generate comprehensive reports, export results in multiple formats, and collaborate with your team.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" size="large" startIcon={<AssessmentIcon />}>
            Generate Report
          </Button>
          <Button variant="outlined" size="large" startIcon={<DownloadIcon />}>
            Bulk Export
          </Button>
          <Button variant="outlined" size="large" startIcon={<ShareIcon />}>
            Share Project
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default ResultPage