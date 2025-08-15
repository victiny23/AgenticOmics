import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Business,
  Group,
  CloudDownload,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  Science,
  School,
  Folder,
  Description,
  Tag,
  CalendarToday,
  Storage,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import LabTeamContextSelector from '../LabTeamContext/LabTeamContextSelector';

interface DataFile {
  id: number;
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  fileExtension: string;
  uploadedBy: string;
  uploadedAt: string;
  description: string;
  tags: string;
  isPublic: boolean;
  status: string;
  validationStatus: string;
  metadata: string;
  labId?: number;
  labName?: string;
  teamId?: number;
  teamName?: string;
  uploadContext?: string;
}

interface DataManagementPanelProps {
  onFileSelect?: (file: DataFile) => void;
}

const DataManagementPanel: React.FC<DataManagementPanelProps> = ({ onFileSelect }) => {
  const { username, role } = useAuth();
  const [files, setFiles] = useState<DataFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentContext, setCurrentContext] = useState<{
    type: 'LAB' | 'TEAM';
    id: number;
    name: string;
    code: string;
    role: string;
  } | null>(null);
  const [viewContext, setViewContext] = useState<{
    type: 'LAB' | 'TEAM';
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [availableContexts, setAvailableContexts] = useState<Array<{
    type: 'LAB' | 'TEAM';
    id: number;
    name: string;
    code: string;
  }>>([]);
  const [selectedFile, setSelectedFile] = useState<DataFile | null>(null);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    description: '',
    tags: '',
    isPublic: false,
  });
  const [filePermissions, setFilePermissions] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    if (currentContext) {
      loadAvailableContexts();
    }
  }, [currentContext]);

  useEffect(() => {
    if (viewContext) {
      loadFiles();
    }
  }, [viewContext, activeTab]);

  const loadAvailableContexts = async () => {
    if (!username) return;

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:12001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        const contexts: Array<{type: 'LAB' | 'TEAM', id: number, name: string, code: string}> = [];
        
        // Add lab contexts
        if (profile.labMemberships) {
          profile.labMemberships.forEach((lab: any) => {
            contexts.push({
              type: 'LAB',
              id: lab.labId,
              name: lab.labName,
              code: lab.labCode
            });
          });
        }
        
        // Add team contexts
        if (profile.teamMemberships) {
          profile.teamMemberships.forEach((team: any) => {
            contexts.push({
              type: 'TEAM',
              id: team.teamId,
              name: team.teamName,
              code: team.teamCode
            });
          });
        }
        
        setAvailableContexts(contexts);
        
        // Set the first context as default view context
        if (contexts.length > 0 && !viewContext) {
          setViewContext(contexts[0]);
        }
      }
    } catch (err) {
      console.error('Error loading available contexts:', err);
    }
  };

  const loadFiles = async () => {
    if (!username || !viewContext) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('jwtToken');
      let endpoint = '';

      switch (activeTab) {
        case 0: // My Files
          if (viewContext.type === 'LAB') {
            endpoint = `http://localhost:12001/api/data/files/lab/${viewContext.id}`;
          } else {
            endpoint = `http://localhost:12001/api/data/files/team/${viewContext.id}`;
          }
          break;
        case 1: // All Files in Context
          if (viewContext.type === 'LAB') {
            endpoint = `http://localhost:12001/api/data/files/lab/${viewContext.id}`;
          } else {
            endpoint = `http://localhost:12001/api/data/files/team/${viewContext.id}`;
          }
          break;
        case 2: // Subordinate Files (for supervisors)
          endpoint = 'http://localhost:12001/api/data/files/subordinates';
          break;
        case 3: // Public Files
          endpoint = 'http://localhost:12001/api/data/files/public';
          break;
        default:
          endpoint = 'http://localhost:12001/api/data/files';
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        // Load permissions for all files
        await loadFilePermissions();
      } else {
        setError('Failed to load files');
      }
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileEdit = (file: DataFile) => {
    setSelectedFile(file);
    setEditData({
      description: file.description || '',
      tags: file.tags || '',
      isPublic: file.isPublic || false,
    });
    setEditMode(true);
    setShowFileDialog(true);
  };

  const handleFileView = (file: DataFile) => {
    setSelectedFile(file);
    setEditMode(false);
    setShowFileDialog(true);
  };

  const checkFileDeletionPermission = async (file: DataFile) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:12001/api/auth/check-file-deletion-permission', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUploadedBy: file.uploadedBy,
          uploadContext: file.uploadContext,
          labId: file.labId,
          teamId: file.teamId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.canDelete;
      }
    } catch (err) {
      console.error('Error checking file deletion permission:', err);
    }
    
    // Fallback: user can only delete their own files
    return file.uploadedBy === username;
  };

  const loadFilePermissions = async () => {
    const permissions = new Map<number, boolean>();
    
    for (const file of files) {
      const canDelete = await checkFileDeletionPermission(file);
      permissions.set(file.id, canDelete);
    }
    
    setFilePermissions(permissions);
  };

  const handleFileDelete = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:12001/api/data/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
        },
      });

      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
        // Remove permission from map
        const newPermissions = new Map(filePermissions);
        newPermissions.delete(fileId);
        setFilePermissions(newPermissions);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete file');
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  const handleFileUpdate = async () => {
    if (!selectedFile) return;

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:12001/api/data/files/${selectedFile.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedFile = await response.json();
        setFiles(files.map(f => f.id === selectedFile.id ? updatedFile : f));
        setShowFileDialog(false);
      } else {
        setError('Failed to update file');
      }
    } catch (err) {
      console.error('Error updating file:', err);
      setError('Failed to update file');
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
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'SEQUENCE':
        return <Science color="primary" />;
      case 'ALIGNMENT':
        return <Storage color="secondary" />;
      case 'VARIANT':
        return <Description color="error" />;
      case 'ANNOTATION':
        return <Tag color="info" />;
      case 'TABULAR':
        return <Description color="success" />;
      default:
        return <Folder />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED':
        return 'success';
      case 'PROCESSING':
        return 'warning';
      case 'PROCESSED':
        return 'info';
      case 'ERROR':
        return 'error';
      default:
        return 'default';
    }
  };

  const isSupervisor = role === 'Lab PI' || role === 'Team Leader';

  return (
    <Box>
      {/* Debug message */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Debug: DataManagementPanel is rendering. Current context: {currentContext?.name || 'None'}, View context: {viewContext?.name || 'None'}
      </Alert>

      {/* Lab/Team Context Selector */}
      <LabTeamContextSelector
        onContextChange={setCurrentContext}
        currentContext={currentContext}
      />

      {currentContext && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" />
            Data Management - {currentContext.name} ({currentContext.code})
            {viewContext && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                • Viewing: {viewContext.name} ({viewContext.code})
              </Typography>
            )}
          </Typography>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="My Files" />
            <Tab label="All Files in Context" />
            {isSupervisor && <Tab label="Subordinate Files" />}
            <Tab label="Public Files" />
          </Tabs>

          {/* Context Selection Dropdown for Viewing Files - Only show in "All Files in Context" tab */}
          {activeTab === 1 && (
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>View Files in Context</InputLabel>
                <Select
                  value={viewContext ? `${viewContext.type}_${viewContext.id}` : ''}
                  onChange={(e) => {
                    const [type, id] = e.target.value.split('_');
                    const context = availableContexts.find(c => c.type === type && c.id === parseInt(id));
                    if (context) {
                      setViewContext(context);
                    }
                  }}
                  label="View Files in Context"
                >
                  {availableContexts.map((context) => (
                    <MenuItem key={`${context.type}_${context.id}`} value={`${context.type}_${context.id}`}>
                      {context.type === 'LAB' ? <Business sx={{ mr: 1 }} /> : <Group sx={{ mr: 1 }} />}
                      {context.name} ({context.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {files.map((file) => (
                <ListItem
                  key={file.id}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <ListItemIcon>
                    {getFileTypeIcon(file.fileType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {file.originalFilename}
                        </Typography>
                        <Chip
                          label={file.status}
                          color={getStatusColor(file.status) as any}
                          size="small"
                        />
                        {file.isPublic && (
                          <Chip label="Public" color="primary" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {file.description || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Storage fontSize="small" />
                            {formatFileSize(file.fileSize)}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday fontSize="small" />
                            {formatDate(file.uploadedAt)}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Description fontSize="small" />
                            {file.uploadedBy}
                          </Typography>
                          {file.labName && (
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Business fontSize="small" />
                              {file.labName}
                            </Typography>
                          )}
                          {file.teamName && (
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Group fontSize="small" />
                              {file.teamName}
                            </Typography>
                          )}
                        </Box>
                        {file.tags && (
                          <Box sx={{ mt: 1 }}>
                            {file.tags.split(',').map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag.trim()}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleFileView(file)}
                        title="View details"
                      >
                        <Visibility />
                      </IconButton>
                      {file.uploadedBy === username && (
                        <IconButton
                          size="small"
                          onClick={() => handleFileEdit(file)}
                          title="Edit file"
                        >
                          <Edit />
                        </IconButton>
                      )}
                      {filePermissions.get(file.id) && (
                        <IconButton
                          size="small"
                          onClick={() => handleFileDelete(file.id)}
                          title="Delete file"
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {files.length === 0 && !loading && (
            <Box textAlign="center" p={3}>
              <Typography variant="body1" color="text.secondary">
                No files found in {viewContext?.name} ({viewContext?.code}).
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* File Details Dialog */}
      <Dialog open={showFileDialog} onClose={() => setShowFileDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit File' : 'File Details'}
        </DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedFile.originalFilename}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>File Size:</strong> {formatFileSize(selectedFile.fileSize)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>File Type:</strong> {selectedFile.fileType}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Uploaded By:</strong> {selectedFile.uploadedBy}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Upload Date:</strong> {formatDate(selectedFile.uploadedAt)}
                </Typography>
              </Grid>
              
              {selectedFile.labName && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Lab:</strong> {selectedFile.labName}
                  </Typography>
                </Grid>
              )}
              
              {selectedFile.teamName && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Team:</strong> {selectedFile.teamName}
                  </Typography>
                </Grid>
              )}
              
              {editMode ? (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tags (comma-separated)"
                      value={editData.tags}
                      onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Visibility</InputLabel>
                      <Select
                        value={editData.isPublic.toString()}
                        onChange={(e) => setEditData(prev => ({ ...prev, isPublic: e.target.value === 'true' }))}
                        label="Visibility"
                      >
                        <MenuItem value="false">Private</MenuItem>
                        <MenuItem value="true">Public</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Description:</strong> {selectedFile.description || 'No description'}
                    </Typography>
                  </Grid>
                  
                  {selectedFile.tags && (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Tags:</strong> {selectedFile.tags}
                      </Typography>
                    </Grid>
                  )}
                  
                  {selectedFile.metadata && (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Metadata:</strong> {selectedFile.metadata}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFileDialog(false)}>
            {editMode ? 'Cancel' : 'Close'}
          </Button>
          {editMode && (
            <Button onClick={handleFileUpdate} variant="contained">
              Update
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataManagementPanel; 