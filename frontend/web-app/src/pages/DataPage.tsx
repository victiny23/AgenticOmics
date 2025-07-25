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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Storage as StorageIcon,
  DataObject as DataIcon,
  Assessment as AnalysisIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'

const DataPage: React.FC = () => {
  const dataTypes = [
    {
      title: 'Genomics Data',
      description: 'DNA sequencing, SNPs, CNVs, and structural variants',
      icon: <DataIcon fontSize="large" />,
      formats: ['FASTQ', 'BAM', 'VCF', 'BED'],
      action: 'Upload Genomics',
    },
    {
      title: 'Transcriptomics',
      description: 'RNA-seq, microarray, and gene expression data',
      icon: <AnalysisIcon fontSize="large" />,
      formats: ['FASTQ', 'GTF', 'TSV', 'CSV'],
      action: 'Upload RNA Data',
    },
    {
      title: 'Proteomics',
      description: 'Mass spectrometry and protein abundance data',
      icon: <StorageIcon fontSize="large" />,
      formats: ['mzML', 'RAW', 'MGF', 'TSV'],
      action: 'Upload Proteins',
    },
    {
      title: 'Metabolomics',
      description: 'Small molecule and metabolite profiling data',
      icon: <UploadIcon fontSize="large" />,
      formats: ['mzML', 'CDF', 'CSV', 'JSON'],
      action: 'Upload Metabolites',
    },
  ]

  const recentUploads = [
    { name: 'RNA_seq_samples_batch1.fastq', type: 'Transcriptomics', size: '2.4 GB', status: 'Processed' },
    { name: 'proteomics_LC_MS_data.mzML', type: 'Proteomics', size: '856 MB', status: 'Processing' },
    { name: 'metabolomics_profiles.csv', type: 'Metabolomics', size: '45 MB', status: 'Uploaded' },
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Data Management
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Upload, manage, and organize your omics datasets for analysis and modeling.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Uploads
        </Typography>
        <List>
          {recentUploads.map((upload, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  {upload.status === 'Processed' ? (
                    <CheckIcon color="success" />
                  ) : upload.status === 'Processing' ? (
                    <ScheduleIcon color="warning" />
                  ) : (
                    <UploadIcon color="primary" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={upload.name}
                  secondary={`${upload.type} • ${upload.size}`}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={upload.status} 
                    size="small" 
                    color={upload.status === 'Processed' ? 'success' : upload.status === 'Processing' ? 'warning' : 'default'}
                  />
                  <Button size="small">View</Button>
                </Box>
              </ListItem>
              {index < recentUploads.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Data Types
      </Typography>

      <Grid container spacing={3}>
        {dataTypes.map((dataType, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {dataType.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {dataType.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {dataType.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Supported Formats:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {dataType.formats.map((format, formatIndex) => (
                    <Chip key={formatIndex} label={format} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button variant="contained" size="small">
                  {dataType.action}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Bulk Data Upload
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload multiple files at once or connect to external data sources like cloud storage, databases, or APIs.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" size="large">
            Bulk Upload
          </Button>
          <Button variant="outlined" size="large">
            Connect Data Source
          </Button>
          <Button variant="outlined" size="large">
            Import from URL
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default DataPage