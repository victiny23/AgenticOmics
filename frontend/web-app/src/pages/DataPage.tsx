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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material'
import {
  CloudUpload,
  Storage,
  FilePresent,
  CheckCircle,
  Schedule,
  Error,
} from '@mui/icons-material'

const DataPage: React.FC = () => {
  const supportedFormats = [
    'FASTQ (.fastq, .fq)',
    'BAM/SAM (.bam, .sam)',
    'VCF (.vcf)',
    'CSV/TSV (.csv, .tsv)',
    'Excel (.xlsx)',
    'HDF5 (.h5, .h5ad)',
  ]

  const recentUploads = [
    { name: 'RNA_seq_sample_01.fastq', size: '2.3 GB', status: 'completed', time: '2 hours ago' },
    { name: 'proteomics_data.csv', size: '45 MB', status: 'processing', time: '1 hour ago' },
    { name: 'metadata.xlsx', size: '1.2 MB', status: 'completed', time: '30 minutes ago' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#4caf50' }} />
      case 'processing':
        return <Schedule sx={{ color: '#ff9800' }} />
      case 'error':
        return <Error sx={{ color: '#f44336' }} />
      default:
        return <FilePresent />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
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
          Data Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Upload, organize, and manage your omics data files with automatic validation and quality checks.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Upload Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Upload Data
              </Typography>
              
              {/* Drag and Drop Area */}
              <Paper
                sx={{
                  p: 6,
                  textAlign: 'center',
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: '#f0f7ff',
                  },
                }}
              >
                <CloudUpload sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drag and drop your files here
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  or click to browse and select files
                </Typography>
                <Button variant="contained" size="large" sx={{ borderRadius: 2 }}>
                  Choose Files
                </Button>
              </Paper>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Maximum file size: 10GB per file • Multiple files supported
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Recent Uploads
              </Typography>
              <List>
                {recentUploads.map((file, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(file.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${file.size} • ${file.time}`}
                    />
                    <Chip
                      label={file.status}
                      color={getStatusColor(file.status) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="outlined">View All Files</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Supported Formats */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
                Supported Formats
              </Typography>
              <List dense>
                {supportedFormats.map((format, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={format}
                      primaryTypographyProps={{ variant: 'body2' }}
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
                <Button variant="outlined" fullWidth>
                  Create Dataset
                </Button>
                <Button variant="outlined" fullWidth>
                  Import from URL
                </Button>
                <Button variant="outlined" fullWidth>
                  Connect Cloud Storage
                </Button>
                <Button variant="outlined" fullWidth>
                  View Data Catalog
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DataPage