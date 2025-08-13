import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  CloudUpload,
  Storage,
  FilePresent,
  CheckCircle,
  Schedule,
  Error,
  Upload,
  Folder,
  Analytics,
} from '@mui/icons-material';
import DataUploadComponent from '../components/DataUpload/DataUploadComponent';
import DataFileList from '../components/DataUpload/DataFileList';
import DataUploadDebug from '../components/DataUpload/DataUploadDebug';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`data-tabpanel-${index}`}
      aria-labelledby={`data-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const DataPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [fileListRefreshTrigger, setFileListRefreshTrigger] = useState(0);

  const supportedFormats = [
    'FASTQ (.fastq, .fq)',
    'FASTA (.fasta, .fa)',
    'BAM/SAM (.bam, .sam)',
    'VCF (.vcf)',
    'CSV/TSV (.csv, .tsv)',
    'Excel (.xlsx, .xls)',
    'BED (.bed)',
    'GTF/GFF (.gtf, .gff)',
    'JSON (.json)',
    'XML (.xml)',
    'ZIP (.zip, .tar.gz)',
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUploadComplete = () => {
    setUploadComplete(true);
    // Refresh the file list
    setFileListRefreshTrigger(prev => prev + 1);
    // Switch to the files tab after upload
    setTimeout(() => {
      setTabValue(1);
      setUploadComplete(false);
    }, 2000);
  };

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

      {/* Success Alert */}
      {uploadComplete && (
        <Alert severity="success" sx={{ mb: 3 }}>
          File uploaded successfully! Switching to files view...
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="data management tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Upload />}
            label="Upload Data"
            id="data-tab-0"
            aria-controls="data-tabpanel-0"
          />
          <Tab
            icon={<Folder />}
            label="My Files"
            id="data-tab-1"
            aria-controls="data-tabpanel-1"
          />
          <Tab
            icon={<Analytics />}
            label="Debug"
            id="data-tab-2"
            aria-controls="data-tabpanel-2"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          {/* Upload Section */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Upload Data Files
                </Typography>
                
                <DataUploadComponent onUploadComplete={handleUploadComplete} />
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

            {/* Upload Guidelines */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Upload Guidelines
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Maximum file size: 100MB"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Multiple files supported"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Automatic file validation"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="MD5 checksum verification"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <DataFileList refreshTrigger={fileListRefreshTrigger} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Debug Tools
                </Typography>
                <DataUploadDebug />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default DataPage;