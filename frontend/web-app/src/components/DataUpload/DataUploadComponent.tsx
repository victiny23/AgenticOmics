import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload,
  FilePresent,
  CheckCircle,
  Error,
  Delete,
  Info,
  Upload,
  Cancel,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LabTeamContextSelector from '../LabTeamContext/LabTeamContextSelector';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  response?: any;
}

interface DataUploadComponentProps {
  onUploadComplete?: (file: UploadFile) => void;
}

const DataUploadComponent: React.FC<DataUploadComponentProps> = ({ onUploadComplete }) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    description: '',
    tags: '',
    isPublic: false,
    metadata: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const { username } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Lab/Team context state
  const [currentContext, setCurrentContext] = useState<{
    type: 'LAB' | 'TEAM';
    id: number;
    name: string;
    code: string;
    role: string;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check if context is selected
    if (!currentContext) {
      setSnackbar({
        open: true,
        message: 'Please select a lab/team context before adding files',
        severity: 'error',
      });
      return;
    }

    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending',
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
    
    // Show success message
    setSnackbar({
      open: true,
      message: `${acceptedFiles.length} file(s) added to upload queue for ${currentContext.name}`,
      severity: 'success',
    });
  }, [currentContext]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // Omics Data Formats
      'application/fastq': ['.fastq', '.fq'],
      'application/fasta': ['.fasta', '.fa'],
      'application/bam': ['.bam'],
      'application/sam': ['.sam'],
      'application/vcf': ['.vcf'],
      'application/bed': ['.bed'],
      'application/gtf': ['.gtf'],
      'application/gff': ['.gff'],
      
      // Data & Analysis Formats
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      
      // Document Formats
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      
      // Text & Web Formats
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/html': ['.html', '.htm'],
      'text/css': ['.css'],
      'application/javascript': ['.js'],
      
      // Media Formats
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/ogg': ['.ogg'],
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
      
      // Archive Formats
      'application/zip': ['.zip'],
      'application/x-gzip': ['.tar.gz'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true,
  });

  const handleUpload = async (uploadFile: UploadFile) => {
    if (!username) {
      setSnackbar({
        open: true,
        message: 'You must be logged in to upload files',
        severity: 'error',
      });
      return;
    }

    if (!currentContext) {
      setSnackbar({
        open: true,
        message: 'Please select a lab/team context before uploading files',
        severity: 'error',
      });
      return;
    }

    // Show context confirmation
    setSnackbar({
      open: true,
      message: `File will be uploaded to ${currentContext.name} (${currentContext.type})`,
      severity: 'info',
    });

    setSelectedFile(uploadFile);
    setShowUploadDialog(true);
  };

  const confirmUpload = async () => {
    if (!selectedFile || !username) return;

    setUploading(true);
    setShowUploadDialog(false);

    // Update file status to uploading
    setUploadFiles(prev =>
      prev.map(f =>
        f.id === selectedFile.id ? { ...f, status: 'uploading' } : f
      )
    );

    const formData = new FormData();
    formData.append('file', selectedFile.file);
    formData.append('description', uploadMetadata.description);
    formData.append('tags', uploadMetadata.tags);
    formData.append('isPublic', uploadMetadata.isPublic.toString());
    formData.append('metadata', uploadMetadata.metadata);
    
    // Add lab/team context
    if (currentContext) {
      formData.append('uploadContext', currentContext.type);
      if (currentContext.type === 'LAB') {
        formData.append('labId', currentContext.id.toString());
        formData.append('labName', currentContext.name);
      } else {
        formData.append('teamId', currentContext.id.toString());
        formData.append('teamName', currentContext.name);
      }
    }

    // Create abort controller for this upload
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Upload attempt - Token:', token ? 'Present' : 'Missing');
      console.log('Upload attempt - Username:', localStorage.getItem('username'));
      
      const response = await axios.post(
        'http://localhost:12001/api/data/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          signal: abortControllerRef.current.signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadFiles(prev =>
                prev.map(f =>
                  f.id === selectedFile.id ? { ...f, progress } : f
                )
              );
            }
          },
        }
      );
      
      console.log('Upload response:', response.data);

      // Update file status to completed
      const updatedFile = {
        ...selectedFile,
        status: 'completed' as const,
        progress: 100,
        response: response.data,
      };

      setUploadFiles(prev =>
        prev.map(f =>
          f.id === selectedFile.id ? updatedFile : f
        )
      );

      setSnackbar({
        open: true,
        message: `File "${selectedFile.file.name}" uploaded successfully!`,
        severity: 'success',
      });

      onUploadComplete?.(updatedFile);

    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      if (error.name === 'AbortError') {
        setSnackbar({
          open: true,
          message: 'Upload cancelled',
          severity: 'info',
        });
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
        
        setUploadFiles(prev =>
          prev.map(f =>
            f.id === selectedFile.id
              ? { ...f, status: 'error' as const, error: errorMessage }
              : f
          )
        );

        setSnackbar({
          open: true,
          message: `Upload failed: ${errorMessage}`,
          severity: 'error',
        });
      }
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setUploadMetadata({
        description: '',
        tags: '',
        isPublic: false,
        metadata: '',
      });
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setShowUploadDialog(false);
    setSelectedFile(null);
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'uploading':
        return <Upload sx={{ color: '#1976d2' }} />;
      case 'error':
        return <Error sx={{ color: '#f44336' }} />;
      default:
        return <FilePresent sx={{ color: '#757575' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'uploading':
        return 'primary';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Lab/Team Context Selector */}
      <LabTeamContextSelector
        onContextChange={setCurrentContext}
        currentContext={currentContext}
      />
      
      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: currentContext ? (isDragActive ? '#1976d2' : '#ccc') : '#ff6b6b',
          borderRadius: 2,
          backgroundColor: currentContext ? (isDragActive ? '#f0f7ff' : '#fafafa') : '#fff5f5',
          cursor: currentContext ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          mb: 3,
          opacity: currentContext ? 1 : 0.7,
        }}
      >
        <input {...getInputProps()} disabled={!currentContext} />
        <CloudUpload sx={{ 
          fontSize: 64, 
          color: currentContext ? '#1976d2' : '#ff6b6b', 
          mb: 2 
        }} />
        
        {currentContext ? (
          <>
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag and drop your files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or click to browse and select files
            </Typography>
            <Typography variant="body2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
              📁 Uploading to: {currentContext.name} ({currentContext.type})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: Omics (FASTQ, FASTA, BAM/SAM, VCF, BED, GTF/GFF), Data (CSV/TSV, Excel, JSON, XML), Documents (PDF, Word, PowerPoint), Media (Images, Videos, Audio), Archives (ZIP, TAR)
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Maximum file size: 100MB per file
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom color="error">
              ⚠️ Lab/Team Context Required
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please select a lab or team context above before uploading files
            </Typography>
            <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
              Files cannot be uploaded without a context
            </Typography>
          </>
        )}
      </Paper>

      {/* Context Warning */}
      {uploadFiles.length > 0 && !currentContext && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>⚠️ Context Required:</strong> You have {uploadFiles.length} file(s) in the upload queue, 
            but no lab/team context is selected. Please select a context above to proceed with uploads.
          </Typography>
        </Alert>
      )}

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Files to Upload ({uploadFiles.length})
            {currentContext && (
              <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
                → {currentContext.name} ({currentContext.type})
              </Typography>
            )}
          </Typography>
          <List>
            {uploadFiles.map((uploadFile) => (
              <ListItem
                key={uploadFile.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: '#fafafa',
                }}
              >
                <ListItemIcon>
                  {getStatusIcon(uploadFile.status)}
                </ListItemIcon>
                <ListItemText
                  primary={uploadFile.file.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(uploadFile.file.size)}
                      </Typography>
                      {uploadFile.status === 'uploading' && (
                        <LinearProgress
                          variant="determinate"
                          value={uploadFile.progress}
                          sx={{ mt: 1 }}
                        />
                      )}
                      {uploadFile.error && (
                        <Typography variant="body2" color="error">
                          {uploadFile.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={uploadFile.status}
                    color={getStatusColor(uploadFile.status) as any}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleUpload(uploadFile)}
                      disabled={uploading || !currentContext}
                      title={!currentContext ? "Please select a lab/team context first" : ""}
                    >
                      Upload
                    </Button>
                  )}
                  {uploadFile.status !== 'uploading' && (
                    <IconButton
                      size="small"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploading}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={cancelUpload} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              File: {selectedFile?.file.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Size: {selectedFile ? formatFileSize(selectedFile.file.size) : ''}
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Description"
            value={uploadMetadata.description}
            onChange={(e) => setUploadMetadata(prev => ({ ...prev, description: e.target.value }))}
            margin="normal"
            multiline
            rows={2}
          />
          
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={uploadMetadata.tags}
            onChange={(e) => setUploadMetadata(prev => ({ ...prev, tags: e.target.value }))}
            margin="normal"
            placeholder="e.g., RNA-seq, cancer, transcriptome"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={uploadMetadata.isPublic}
                onChange={(e) => setUploadMetadata(prev => ({ ...prev, isPublic: e.target.checked }))}
              />
            }
            label="Make this file public"
            sx={{ mt: 1 }}
          />
          
          <TextField
            fullWidth
            label="Additional Metadata (JSON)"
            value={uploadMetadata.metadata}
            onChange={(e) => setUploadMetadata(prev => ({ ...prev, metadata: e.target.value }))}
            margin="normal"
            multiline
            rows={3}
            placeholder='{"experiment_type": "RNA-seq", "organism": "Homo sapiens"}'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelUpload}>Cancel</Button>
          <Button
            onClick={confirmUpload}
            variant="contained"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataUploadComponent; 