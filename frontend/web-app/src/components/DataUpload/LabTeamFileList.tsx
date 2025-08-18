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
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Business,
  Group,
  FilePresent,
  ExpandMore,
  Download,
  Visibility,
  Delete,
  Science,
  School,
  Storage,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface FileData {
  id: number;
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  description: string;
  tags: string;
  isPublic: boolean;
  status: string;
  validationStatus: string;
  labId: number | null;
  labName: string | null;
  teamId: number | null;
  teamName: string | null;
  uploadContext: string;
}

interface LabTeamFileListProps {
  refreshTrigger?: number;
}

const LabTeamFileList: React.FC<LabTeamFileListProps> = ({ refreshTrigger = 0 }) => {
  const { username } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableContexts, setAvailableContexts] = useState<Array<{
    type: 'LAB' | 'TEAM';
    id: number;
    name: string;
    code: string;
  }>>([]);
  const [selectedContext, setSelectedContext] = useState<string>('');

  useEffect(() => {
    loadAvailableContexts();
  }, [username]);

  useEffect(() => {
    if (availableContexts.length > 0 && !selectedContext) {
      setSelectedContext(`${availableContexts[0].type}_${availableContexts[0].id}`);
    }
  }, [availableContexts, selectedContext]);

  useEffect(() => {
    if (selectedContext) {
      loadFiles();
    }
  }, [username, refreshTrigger, selectedContext]);

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
              code: team.teamIdCode
            });
          });
        }

        setAvailableContexts(contexts);
      }
    } catch (err) {
      console.error('Error loading available contexts:', err);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!username) return;

    const fileToDelete = files.find(file => file.id === fileId);
    if (!fileToDelete) return;

    const confirmMessage = `Confirm deletion of file "${fileToDelete.originalFilename}" uploaded by ${fileToDelete.uploadedBy}`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:12001/api/data/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username,
        },
      });

      if (response.ok) {
        // Remove the file from the local state
        setFiles(files.filter(file => file.id !== fileId));
        console.log('File deleted successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to delete file:', errorData);
        alert(`Failed to delete file: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Error deleting file. Please try again.');
    }
  };

  const loadFiles = async () => {
    if (!username || !selectedContext) return;

    try {
      setLoading(true);
      setError(null);

      const [type, id] = selectedContext.split('_');
      const token = localStorage.getItem('jwtToken');
      
      let endpoint = '';
      if (type === 'LAB') {
        endpoint = `http://localhost:12001/api/data/files/lab/${id}`;
      } else {
        endpoint = `http://localhost:12001/api/data/files/team/${id}`;
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getContextIcon = (type: string) => {
    return type === 'LAB' ? <Business color="primary" /> : <Group color="secondary" />;
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('PI') || role.includes('Leader')) {
      return <Science color="primary" />;
    }
    if (role.includes('Student')) {
      return <School color="secondary" />;
    }
    return <Group color="info" />;
  };

  // Get the selected context info
  const selectedContextInfo = availableContexts.find(context => 
    `${context.type}_${context.id}` === selectedContext
  );

  // Calculate total size for selected context
  const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body2" ml={2}>
          Loading files by lab/team context...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // Don't show the "no files" message here - we'll handle it in the main UI structure

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Storage />
        Files by Lab/Team Context
      </Typography>

      {/* Context Selection Dropdown */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Select Lab/Team Context</InputLabel>
          <Select
            value={selectedContext}
            onChange={(e) => setSelectedContext(e.target.value)}
            label="Select Lab/Team Context"
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
      
      {/* Context Header */}
      {selectedContextInfo && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getContextIcon(selectedContextInfo.type)}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="medium">
                  {selectedContextInfo.name} ({selectedContextInfo.code})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {files.length} file{files.length !== 1 ? 's' : ''} • {formatFileSize(totalSize)}
                </Typography>
              </Box>
              <Chip 
                label={selectedContextInfo.type} 
                size="small" 
                color={selectedContextInfo.type === 'LAB' ? 'primary' : 'secondary'}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Files List */}
      {files.length > 0 ? (
        <List dense>
          {files.map((file: FileData, fileIndex: number) => (
            <React.Fragment key={file.id}>
              <ListItem>
                <ListItemIcon>
                  <FilePresent color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {file.originalFilename}
                      </Typography>
                      <Chip 
                        label={file.status} 
                        size="small" 
                        color={getStatusColor(file.status) as any}
                      />
                      {file.isPublic && (
                        <Chip label="Public" size="small" color="info" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.fileSize)} • {file.fileType} • Uploaded {formatDate(file.uploadedAt)}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        By: {file.uploadedBy}
                      </Typography>
                      {file.description && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {file.description}
                        </Typography>
                      )}
                      {file.tags && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Tags: {file.tags}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View file">
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download file">
                    <IconButton size="small">
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete file">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
              {fileIndex < files.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Storage sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No files found in {selectedContextInfo?.name || 'selected context'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload files to this context to see them here
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default LabTeamFileList; 