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
  Tab,
  Tabs,
} from '@mui/material'
import {
  Assessment,
  Download,
  Share,
  Visibility,
  PictureAsPdf,
  TableChart,
  BarChart,
  TrendingUp,
  Insights,
  AutoAwesome,
  CheckCircle,
  Schedule,
} from '@mui/icons-material'

const ResultPage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0)

  const analysisResults = [
    {
      name: 'RNA-seq Differential Expression',
      type: 'Transcriptomics',
      date: '2024-01-15',
      status: 'completed',
      samples: 48,
      genes: 15432,
      significant: 1247,
    },
    {
      name: 'Proteomics Identification',
      type: 'Proteomics',
      date: '2024-01-14',
      status: 'completed',
      samples: 24,
      proteins: 3456,
      significant: 234,
    },
    {
      name: 'Single Cell Clustering',
      type: 'Single Cell',
      date: '2024-01-13',
      status: 'processing',
      samples: 12,
      cells: 8934,
      clusters: 8,
    },
  ]

  const keyFindings = [
    'Identified 1,247 differentially expressed genes (FDR < 0.05)',
    'Strong upregulation in immune response pathways',
    'Significant enrichment in metabolic processes',
    'Clear separation between treatment groups in PCA',
    'High correlation between biological replicates (r > 0.95)',
  ]

  const exportOptions = [
    { label: 'PDF Report', icon: <PictureAsPdf />, description: 'Complete analysis report with figures' },
    { label: 'Excel Tables', icon: <TableChart />, description: 'Statistical results and gene lists' },
    { label: 'High-res Figures', icon: <BarChart />, description: 'Publication-ready plots (PNG/SVG)' },
    { label: 'Raw Data', icon: <Download />, description: 'Processed data matrices' },
  ]

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#4caf50' }} />
      case 'processing':
        return <Schedule sx={{ color: '#ff9800' }} />
      default:
        return <Assessment />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
          Analysis Results
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          View, interpret, and export your analysis results with AI-generated insights and publication-ready visualizations.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Results Area */}
        <Grid item xs={12} md={8}>
          {/* Results Overview */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Recent Analysis Results
              </Typography>
              
              <List>
                {analysisResults.map((result, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 2,
                      backgroundColor: '#fafafa',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(result.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {result.name}
                          </Typography>
                          <Chip
                            label={result.type}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Completed: {result.date} • {result.samples} samples
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            {result.genes && (
                              <Typography variant="caption">
                                {result.genes.toLocaleString()} genes
                              </Typography>
                            )}
                            {result.proteins && (
                              <Typography variant="caption">
                                {result.proteins.toLocaleString()} proteins
                              </Typography>
                            )}
                            {result.cells && (
                              <Typography variant="caption">
                                {result.cells.toLocaleString()} cells
                              </Typography>
                            )}
                            {result.significant && (
                              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>
                                {result.significant} significant
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip
                        label={result.status}
                        color={getStatusColor(result.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Button size="small" startIcon={<Visibility />}>
                        View Details
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Detailed Results View */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Summary" />
                  <Tab label="Visualizations" />
                  <Tab label="Statistical Results" />
                  <Tab label="Gene Lists" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ minHeight: 400 }}>
                {tabValue === 0 && (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Analysis Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Select an analysis result to view detailed summary and statistics
                    </Typography>
                  </Paper>
                )}
                
                {tabValue === 1 && (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <BarChart sx={{ fontSize: 64, color: '#9c27b0', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Interactive Visualizations
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Explore your results through interactive plots and charts
                    </Typography>
                  </Paper>
                )}

                {tabValue === 2 && (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <TableChart sx={{ fontSize: 64, color: '#f57c00', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Statistical Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Detailed statistical analysis results and significance tests
                    </Typography>
                  </Paper>
                )}

                {tabValue === 3 && (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Assessment sx={{ fontSize: 64, color: '#388e3c', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Gene/Protein Lists
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Browse and filter significant genes, proteins, or other features
                    </Typography>
                  </Paper>
                )}
              </Box>
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
                Key Findings
              </Typography>
              <List dense>
                {keyFindings.map((finding, index) => (
                  <ListItem key={index} sx={{ py: 1, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Insights sx={{ fontSize: 16, color: '#1976d2' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={finding}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" size="small" fullWidth>
                  Generate AI Report
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                <Download sx={{ mr: 1, verticalAlign: 'middle' }} />
                Export Results
              </Typography>
              <List dense>
                {exportOptions.map((option, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {option.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={option.label}
                      secondary={option.description}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth startIcon={<Share />}>
                  Share Results
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Assessment />}>
                  Compare Analyses
                </Button>
                <Button variant="outlined" fullWidth startIcon={<TrendingUp />}>
                  Pathway Analysis
                </Button>
                <Divider sx={{ my: 1 }} />
                <Button variant="contained" fullWidth startIcon={<Download />}>
                  Download All
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ResultPage