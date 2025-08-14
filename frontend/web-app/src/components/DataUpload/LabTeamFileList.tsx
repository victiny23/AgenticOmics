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

  useEffect(() => {
    loadFiles();
  }, [username, refreshTrigger]);

  const loadFiles = async () => {
    if (!username) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:12001/api/data/files/lab-team-statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Flatten the files from all contexts
        const allFiles = data.contextStats.flatMap((context: any) => context.files);
        setFiles(allFiles);
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

  // Group files by lab/team context
  const groupedFiles = files.reduce((acc, file) => {
    const contextKey = file.uploadContext === 'LAB' 
      ? `LAB_${file.labId}_${file.labName}`
      : `TEAM_${file.teamId}_${file.teamName}`;
    
    if (!acc[contextKey]) {
      acc[contextKey] = {
        type: file.uploadContext,
        id: file.uploadContext === 'LAB' ? file.labId : file.teamId,
        name: file.uploadContext === 'LAB' ? file.labName : file.teamName,
        files: [],
        totalSize: 0,
        fileCount: 0,
      };
    }
    
    acc[contextKey].files.push(file);
    acc[contextKey].totalSize += file.fileSize;
    acc[contextKey].fileCount += 1;
    
    return acc;
  }, {} as Record<string, any>);

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

  if (Object.keys(groupedFiles).length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Storage sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No files uploaded yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload files to see them organized by lab/team context
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Storage />
        Files by Lab/Team Context
      </Typography>
      
      {Object.values(groupedFiles).map((context: any, index) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {getContextIcon(context.type)}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {context.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {context.fileCount} file{context.fileCount !== 1 ? 's' : ''} • {formatFileSize(context.totalSize)}
                </Typography>
              </Box>
              <Chip 
                label={context.type} 
                size="small" 
                color={context.type === 'LAB' ? 'primary' : 'secondary'}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {context.files.map((file: FileData, fileIndex: number) => (
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
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                  {fileIndex < context.files.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default LabTeamFileList; 