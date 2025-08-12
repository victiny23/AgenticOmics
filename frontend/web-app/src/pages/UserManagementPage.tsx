import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { 
  Block,
  CheckCircle,
  Visibility,
  AdminPanelSettings,
  Person,
  Email,
  Phone,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  telephone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const UserManagementPage: React.FC = () => {
  const { username } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
    action: 'activate' | 'deactivate' | null;
  }>({ open: false, user: null, action: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showDeactivated) {
      setUsers(allUsers);
    } else {
      setUsers(allUsers.filter(user => user.isActive));
    }
  }, [showDeactivated, allUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:12001/api/auth/admin/users/my-lab-members', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch users');
      }

      const data = await response.json();
      setAllUsers(data.users || []);
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate') => {
    try {
      const token = localStorage.getItem('jwtToken');
      const endpoint = action === 'activate' ? 'activate' : 'deactivate';
      
      const response = await fetch(`http://localhost:12001/api/auth/admin/users/${userId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Failed to ${action} user`);
      }

      setSuccessMessage(`User ${action}d successfully`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const openConfirmDialog = (user: User, action: 'activate' | 'deactivate') => {
    setConfirmDialog({ open: true, user, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, user: null, action: null });
  };

  const confirmAction = () => {
    if (confirmDialog.user && confirmDialog.action) {
      handleUserAction(confirmDialog.user.id, confirmDialog.action);
      closeConfirmDialog();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Lab PI': return 'primary';
      case 'PhD student': return 'secondary';
      case 'Master student': return 'info';
      case 'Data Analyst': return 'success';
      case 'Technician': return 'warning';
      case 'Professor': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading users...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2,
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <AdminPanelSettings sx={{ fontSize: 40, color: '#1976d2' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            User Management
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Manage user accounts and permissions. Only Lab PI users can access this page.
        </Typography>
        
        {/* Filter Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant={showDeactivated ? "contained" : "outlined"}
            onClick={() => setShowDeactivated(!showDeactivated)}
            startIcon={<Visibility />}
            size="small"
          >
            {showDeactivated ? "Hide Deactivated" : "Show Deactivated"}
          </Button>
          <Typography variant="body2" color="text.secondary">
            {showDeactivated ? "Showing all users" : "Showing active users only"}
          </Typography>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 2, mr: 0, width: '100%' }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Person sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {allUsers.length}
                  </Typography>
                  <Typography variant="body2">
                    Total Users
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CheckCircle sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {allUsers.filter(u => u.isActive).length}
                  </Typography>
                  <Typography variant="body2">
                    Active Users
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Block sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {allUsers.filter(u => !u.isActive).length}
                  </Typography>
                  <Typography variant="body2">
                    Deactivated Users
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Users Table */}
      <Paper sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow sx={{ background: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Last Login</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: user.isActive ? '#4caf50' : '#f44336' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Stack>
                      {user.telephone && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{user.telephone}</Typography>
                        </Stack>
                      )}
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={getRoleColor(user.role) as any}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={user.isActive ? 'Active' : 'Deactivated'} 
                      color={getStatusColor(user.isActive) as any}
                      variant={user.isActive ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    <Typography variant="body2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    <Typography variant="body2">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {user.isActive ? (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Block />}
                          onClick={() => openConfirmDialog(user, 'deactivate')}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => openConfirmDialog(user, 'activate')}
                        >
                          Activate
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Warning sx={{ color: '#ff9800' }} />
            <Typography variant="h6">
              Confirm {confirmDialog.action === 'activate' ? 'Activation' : 'Deactivation'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action} the account for user{' '}
            <strong>{confirmDialog.user?.username}</strong>?
          </Typography>
          {confirmDialog.action === 'deactivate' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This user will have restricted access to platform features until reactivated. They can still log in but will be limited to basic information only.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button 
            onClick={confirmAction}
            variant="contained"
            color={confirmDialog.action === 'activate' ? 'success' : 'error'}
          >
            {confirmDialog.action === 'activate' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementPage; 