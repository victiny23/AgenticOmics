import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Science as ScienceIcon,
  Groups as GroupsIcon,
  Dashboard as DashboardIcon,
  ExpandMore as ExpandMoreIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      id={`system-admin-tabpanel-${index}`}
      aria-labelledby={`system-admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SystemAdministrationPage: React.FC = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemOverview, setSystemOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const { isAuthenticated, username } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    checkSuperAdminStatus();
  }, [isAuthenticated, navigate, username]);

  const checkSuperAdminStatus = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }
      
      if (!username) {
        setError('No username found. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('Checking Super Admin status for:', username);
      console.log('Token exists:', !!token);
      
      const response = await fetch('/api/auth/admin/system/check-super-admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username,
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Super Admin check response:', data);
        setIsSuperAdmin(data.isSuperAdmin);
        
        if (!data.isSuperAdmin) {
          setError('Access denied: Super Admin privileges required');
          setLoading(false);
          return;
        }
        
        // Load all data
        await Promise.all([
          loadSystemOverview(),
          loadUsers(),
          loadLabs(),
          loadTeams(),
        ]);
      } else {
        const errorText = await response.text();
        console.error('Super Admin check failed:', response.status, errorText);
        setError(`Failed to verify Super Admin status: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error checking Super Admin status:', error);
      setError(`Error checking Super Admin status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const loadSystemOverview = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/auth/admin/system/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemOverview(data);
      }
    } catch (error) {
      console.error('Error loading system overview:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:12001/api/auth/admin/system/users/all-with-organizations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data);
      } else {
        console.error('Failed to load users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadLabs = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/auth/admin/system/labs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLabs(data);
      }
    } catch (error) {
      console.error('Error loading labs:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/auth/admin/system/teams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  // ==================== DELETE FUNCTIONS ====================
  
  const deleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`/api/auth/admin/system/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
        },
      });
      
      if (response.ok) {
        alert('User deleted successfully');
        loadUsers(); // Reload the users list
      } else {
        const errorText = await response.text();
        alert(`Failed to delete user: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };
  
  const deleteLab = async (labId: number) => {
    if (!window.confirm('Are you sure you want to delete this lab? This will also delete all teams in this lab and remove all memberships. This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`/api/auth/admin/system/labs/${labId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
        },
      });
      
      if (response.ok) {
        alert('Lab deleted successfully');
        loadLabs(); // Reload the labs list
        loadTeams(); // Reload teams as some might have been deleted
      } else {
        const errorText = await response.text();
        alert(`Failed to delete lab: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting lab:', error);
      alert('Error deleting lab');
    }
  };
  
  const deleteTeam = async (teamId: number) => {
    if (!window.confirm('Are you sure you want to delete this team? This will remove all team memberships. This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`/api/auth/admin/system/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
        },
      });
      
      if (response.ok) {
        alert('Team deleted successfully');
        loadTeams(); // Reload the teams list
      } else {
        const errorText = await response.text();
        alert(`Failed to delete team: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team');
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          You don't have Super Admin privileges. Redirecting...
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AdminIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            System Administration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all users, labs, and teams across the platform
          </Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="system administration tabs">
          <Tab icon={<DashboardIcon />} label="System Overview" />
          <Tab icon={<PeopleIcon />} label="All Users" />
          <Tab icon={<ScienceIcon />} label="All Labs" />
          <Tab icon={<GroupsIcon />} label="All Teams" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <SystemOverviewTab data={systemOverview} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <AllUsersTab users={users} onDeleteUser={deleteUser} onLoadUsers={loadUsers} />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <AllLabsTab labs={labs} onDeleteLab={deleteLab} />
      </TabPanel>

      <TabPanel value={value} index={3}>
        <AllTeamsTab teams={teams} onDeleteTeam={deleteTeam} />
      </TabPanel>
    </Box>
  );
};

// System Overview Tab Component
const SystemOverviewTab: React.FC<{ data: any }> = ({ data }) => {
  if (!data || data.length === 0) {
    return <Typography>No system data available</Typography>;
  }

  const userStats = data[0];
  const labStats = data[1];
  const teamStats = data[2];

  return (
    <Grid container spacing={3}>
      {/* User Statistics */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <PeopleIcon color="primary" />
              <Typography variant="h6">User Statistics</Typography>
            </Box>
            <Typography variant="h3" color="primary" gutterBottom>
              {userStats.totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
            <Box mt={2}>
              <Typography variant="body2">
                Active: <Chip size="small" label={userStats.activeUsers} color="success" />
              </Typography>
              <Typography variant="body2">
                Inactive: <Chip size="small" label={userStats.inactiveUsers} color="warning" />
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Role Distribution:</Typography>
            {userStats.roleDistribution && Object.entries(userStats.roleDistribution).map(([role, count]: [string, any]) => (
              <Box key={role} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{role}:</Typography>
                <Chip size="small" label={count} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Lab Statistics */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <ScienceIcon color="primary" />
              <Typography variant="h6">Lab Statistics</Typography>
            </Box>
            <Typography variant="h3" color="primary" gutterBottom>
              {labStats.totalLabs}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Labs
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Lab Details:</Typography>
            {labStats.labDetails && labStats.labDetails.map((lab: any) => (
              <Box key={lab.id} mb={1}>
                <Typography variant="body2" fontWeight="bold">{lab.labName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Members: {lab.memberCount}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Team Statistics */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <GroupsIcon color="primary" />
              <Typography variant="h6">Team Statistics</Typography>
            </Box>
            <Typography variant="h3" color="primary" gutterBottom>
              {teamStats.totalTeams}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Teams
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Team Details:</Typography>
            {teamStats.teamDetails && teamStats.teamDetails.map((team: any) => (
              <Box key={team.id} mb={1}>
                <Typography variant="body2" fontWeight="bold">{team.teamName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Members: {team.memberCount}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// All Users Tab Component
const AllUsersTab: React.FC<{ users: any[]; onDeleteUser: (userId: number) => void; onLoadUsers: () => void }> = ({ users, onDeleteUser, onLoadUsers }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleBulkAction = async (action: 'deactivate-all' | 'deactivate-all-non-super-admin' | 'activate-all') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwtToken');
      const username = localStorage.getItem('username');
      
      const response = await fetch(`http://localhost:12001/api/auth/admin/system/users/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Username': username || '',
        },
      });
      
      if (response.ok) {
        const result = await response.text();
        setMessage({ type: 'success', text: result });
        // Refresh the user list without reloading the page
        onLoadUsers();
      } else {
        const errorText = await response.text();
        setMessage({ type: 'error', text: `Failed: ${errorText}` });
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setMessage({ type: 'error', text: `Error performing ${action}` });
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualAction = async (userId: number, action: 'activate' | 'deactivate') => {
    // Find the user to get their username for the confirmation message
    const user = users.find(u => u.id === userId);
    if (!user) {
      setMessage({ type: 'error', text: 'User not found' });
      return;
    }

    // Show confirmation dialog
    const actionText = action === 'activate' ? 'activate' : 'deactivate';
    const confirmMessage = `Are you sure you want to ${actionText} user "${user.username}" (${user.email})?`;
    
    if (!window.confirm(confirmMessage)) {
      return; // User cancelled the action
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('jwtToken');
      const username = localStorage.getItem('username');
      
      const response = await fetch(`http://localhost:12001/api/auth/admin/system/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Username': username || '',
        },
      });
      
      if (response.ok) {
        const result = await response.text();
        setMessage({ type: 'success', text: result });
        // Refresh the user list without reloading the page
        onLoadUsers();
      } else {
        const errorText = await response.text();
        setMessage({ type: 'error', text: `Failed: ${errorText}` });
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setMessage({ type: 'error', text: `Error performing ${action}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Bulk Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="warning"
          onClick={() => handleBulkAction('deactivate-all')}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          {loading ? 'Processing...' : 'Deactivate All Users'}
        </Button>
        
        <Button
          variant="contained"
          color="warning"
          onClick={() => handleBulkAction('deactivate-all-non-super-admin')}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          {loading ? 'Processing...' : 'Deactivate All Non-Super Admin'}
        </Button>
        
        <Button
          variant="contained"
          color="success"
          onClick={() => handleBulkAction('activate-all')}
          disabled={loading}
          startIcon={<CheckCircleIcon />}
        >
          {loading ? 'Processing...' : 'Activate All Users'}
        </Button>
      </Box>

      {/* Message Display */}
      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Lab Memberships</TableCell>
              <TableCell>Team Memberships</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" fontWeight="bold">
                    {user.username}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip 
                  label={user.role} 
                  color={user.role === 'Super Admin' ? 'error' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleIndividualAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                  disabled={loading}
                  startIcon={user.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                  color={user.isActive ? 'success' : 'error'}
                  sx={{
                    minWidth: 'auto',
                    textTransform: 'none',
                    borderColor: user.isActive ? 'success.main' : 'error.main',
                    color: user.isActive ? 'success.main' : 'error.main',
                    '&:hover': {
                      backgroundColor: user.isActive ? 'success.light' : 'error.light',
                      borderColor: user.isActive ? 'success.dark' : 'error.dark',
                    }
                  }}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </Button>
              </TableCell>
              <TableCell>
                {user.labMemberships && user.labMemberships.length > 0 ? (
                  <Box>
                    {user.labMemberships.map((lab: any, index: number) => (
                      <Chip 
                        key={index}
                        label={`${lab.labName} (${lab.roleInLab})`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">None</Typography>
                )}
              </TableCell>
              <TableCell>
                {user.teamMemberships && user.teamMemberships.length > 0 ? (
                  <Box>
                    {user.teamMemberships.map((team: any, index: number) => (
                      <Chip 
                        key={index}
                        label={`${team.teamName} (${team.roleInTeam})`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">None</Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                {user.role !== 'Super Admin' && (
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => onDeleteUser(user.id)}
                    title="Delete User"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  );
};

// All Labs Tab Component
const AllLabsTab: React.FC<{ labs: any[]; onDeleteLab: (labId: number) => void }> = ({ labs, onDeleteLab }) => {
  return (
    <Grid container spacing={2}>
      {labs.map((lab) => (
        <Grid item xs={12} md={6} key={lab.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {lab.labName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lab.labId}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Badge badgeContent={lab.memberCount} color="primary">
                    <PeopleIcon />
                  </Badge>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => onDeleteLab(lab.id)}
                    title="Delete Lab"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Typography variant="body2" gutterBottom>
                <strong>Institution:</strong> {lab.institution || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Department:</strong> {lab.department || 'N/A'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Members ({lab.members.length}):
              </Typography>
              
              <List dense>
                {lab.members.map((member: any, index: number) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {member.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.username}
                      secondary={`${member.roleInLab} • ${member.role}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// All Teams Tab Component
const AllTeamsTab: React.FC<{ teams: any[]; onDeleteTeam: (teamId: number) => void }> = ({ teams, onDeleteTeam }) => {
  return (
    <Grid container spacing={2}>
      {teams.map((team) => (
        <Grid item xs={12} md={6} key={team.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {team.teamName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {team.teamId}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Badge badgeContent={team.memberCount} color="primary">
                    <PeopleIcon />
                  </Badge>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => onDeleteTeam(team.id)}
                    title="Delete Team"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Typography variant="body2" gutterBottom>
                {team.description || 'No description available'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Members ({team.members.length}):
              </Typography>
              
              <List dense>
                {team.members.map((member: any, index: number) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {member.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.username}
                      secondary={`${member.roleInTeam} • ${member.role}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SystemAdministrationPage; 