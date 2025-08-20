import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  Grid,
  Paper,
} from '@mui/material';
import {
  FilePresent,
  CheckCircle,
  Error,
  Schedule,
  Delete,
  Edit,
  Visibility,
  Download,
  Search,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import FileViewer from './FileViewer';


interface DataFile {
  id: number;
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  fileExtension: string;
  contentType: string;
  uploadedBy: string;
  uploadedAt: string;
  description: string;
  tags: string;
  isPublic: boolean;
  status: string;
  validationStatus: string;
  validationMessage: string;
  metadata: string;
  checksum: string;
}

interface DataFileListProps {
  refreshTrigger?: number;
}

const DataFileList: React.FC<DataFileListProps> = ({ refreshTrigger = 0 }) => {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DataFile | null>(null);
  const [editForm, setEditForm] = useState({
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
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    file: DataFile | null;
  }>({
    open: false,
    file: null,
  });
  const [viewerDialog, setViewerDialog] = useState<{
    open: boolean;
    file: DataFile | null;
  }>({
    open: false,
    file: null,
  });


  const { username } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      console.log('Fetching files...');
      const token = localStorage.getItem('jwtToken');
      console.log('File list - Token:', token ? 'Present' : 'Missing');
      
      const response = await axios.get('http://localhost:12001/api/data/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Files response:', response.data);
      setFiles(response.data);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load files: ' + (error.response?.data?.error || error.message),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    const fileToDelete = files.find(f => f.id === fileId);
    if (fileToDelete) {
      setDeleteDialog({ open: true, file: fileToDelete });
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.file) return;

    try {
      await axios.delete(`http://localhost:12001/api/data/files/${deleteDialog.file.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });

      setFiles(prev => prev.filter(f => f.id !== deleteDialog.file!.id));
      setSnackbar({
        open: true,
        message: `File "${deleteDialog.file.originalFilename}" deleted successfully`,
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Error deleting file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete file: ' + (error.response?.data?.error || error.message),
        severity: 'error',
      });
    } finally {
      setDeleteDialog({ open: false, file: null });
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, file: null });
  };

  const handleEdit = (file: DataFile) => {
    setSelectedFile(file);
    setEditForm({
      description: file.description || '',
      tags: file.tags || '',
      isPublic: file.isPublic,
      metadata: file.metadata || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedFile) return;

    try {
      const response = await axios.put(
        `http://localhost:12001/api/data/files/${selectedFile.id}`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      );

      setFiles(prev => prev.map(f => f.id === selectedFile.id ? response.data : f));
      setShowEditDialog(false);
      setSnackbar({
        open: true,
        message: 'File updated successfully',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Error updating file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update file: ' + (error.response?.data?.error || error.message),
        severity: 'error',
      });
    }
  };

  const handleDownload = async (fileId: number) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:12001/api/data/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSnackbar({
          open: true,
          message: 'File downloaded successfully',
          severity: 'success',
        });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: 'Failed to download file: ' + (errorData.error || 'Unknown error'),
          severity: 'error',
        });
      }
    } catch (error: any) {
      console.error('Error downloading file:', error);
      setSnackbar({
        open: true,
        message: 'Error downloading file. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleView = (file: DataFile) => {
    setViewerDialog({ open: true, file });
  };

  const closeViewer = () => {
    setViewerDialog({ open: false, file: null });
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'PROCESSING':
        return <Schedule sx={{ color: '#ff9800' }} />;
      case 'ERROR':
        return <Error sx={{ color: '#f44336' }} />;
      default:
        return <FilePresent sx={{ color: '#757575' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return 'success';
      case 'PROCESSING':
        return 'warning';
      case 'ERROR':
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (file.tags && file.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || file.status === statusFilter;
    const matchesType = typeFilter === 'all' || file.fileType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'SEQUENCE':
        return '🧬';
      case 'ALIGNMENT':
        return '📊';
      case 'VARIANT':
        return '🔬';
      case 'ANNOTATION':
        return '📝';
      case 'TABULAR':
        return '📋';
      case 'SPREADSHEET':
        return '📈';
      case 'STRUCTURED':
        return '📄';
      case 'ARCHIVE':
        return '📦';
      default:
        return '📁';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          My Data Files ({files.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchFiles}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="UPLOADED">Uploaded</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
                <MenuItem value="PROCESSED">Processed</MenuItem>
                <MenuItem value="ERROR">Error</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>File Type</InputLabel>
              <Select
                value={typeFilter}
                label="File Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="SEQUENCE">Sequence</MenuItem>
                <MenuItem value="ALIGNMENT">Alignment</MenuItem>
                <MenuItem value="VARIANT">Variant</MenuItem>
                <MenuItem value="ANNOTATION">Annotation</MenuItem>
                <MenuItem value="TABULAR">Tabular</MenuItem>
                <MenuItem value="SPREADSHEET">Spreadsheet</MenuItem>
                <MenuItem value="STRUCTURED">Structured</MenuItem>
                <MenuItem value="ARCHIVE">Archive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* File List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading files...</Typography>
        </Box>
      ) : filteredFiles.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'No files match your filters' 
              : 'No files uploaded yet'}
          </Typography>
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List>
              {filteredFiles.map((file) => (
                <ListItem
                  key={file.id}
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <ListItemIcon>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {getFileTypeIcon(file.fileType)}
                      </span>
                      {getStatusIcon(file.status)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {file.originalFilename}
                        </Typography>
                        {file.isPublic && (
                          <Chip label="Public" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(file.fileSize)} • {file.fileType} • {formatDate(file.uploadedAt)}
                        </Typography>
                        {file.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {file.description}
                          </Typography>
                        )}
                        {file.tags && (
                          <Box sx={{ mt: 0.5 }}>
                            {file.tags.split(',').map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag.trim()}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={file.status}
                      color={getStatusColor(file.status) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                    <Tooltip title="View Online">
                      <IconButton size="small" onClick={() => handleView(file)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton size="small" onClick={() => handleDownload(file.id)}>
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(file)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(file.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit File</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={editForm.tags}
            onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Additional Metadata (JSON)"
            value={editForm.metadata}
            onChange={(e) => setEditForm(prev => ({ ...prev, metadata: e.target.value }))}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={cancelDelete} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Delete sx={{ color: '#f44336' }} />
            <Typography variant="h6">
              Confirm File Deletion
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to delete the file{' '}
            <strong>"{deleteDialog.file?.originalFilename}"</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>This action cannot be undone.</strong> The file will be permanently removed from the system, including:
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>All file data and metadata</li>
              <li>Associated analysis results</li>
              <li>Processing history</li>
            </ul>
            <Typography variant="body2">
              If you need this file later, you'll need to upload it again.
            </Typography>
          </Alert>
          {deleteDialog.file && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>File Details:</strong><br />
                Size: {formatFileSize(deleteDialog.file.fileSize)}<br />
                Type: {deleteDialog.file.fileType}<br />
                Uploaded: {formatDate(deleteDialog.file.uploadedAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Delete File
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

      {/* File Viewer Dialog */}
      <FileViewer
        open={viewerDialog.open}
        onClose={closeViewer}
        file={viewerDialog.file}
        onDownload={handleDownload}
      />

    </Box>
  );
};

export default DataFileList; 