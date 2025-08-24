import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Lab {
  id: number;
  labId: string;
  labName: string;
  labDescription: string;
}

interface Team {
  id: number;
  teamId: string;
  teamName: string;
  teamDescription: string;
  labId: string;
  labName: string;
}

interface LabMembership {
  id: number;
  labId: number;
  labName: string;
  roleInLab: string;
  isActive: boolean;
  joinedAt: string;
}

interface TeamMembership {
  id: number;
  teamId: number;
  teamName: string;
  labName: string;
  roleInTeam: string;
  isActive: boolean;
  joinedAt: string;
}

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
      id={`unified-management-tabpanel-${index}`}
      aria-labelledby={`unified-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const UnifiedManagementPage: React.FC = () => {
  const { username, role, token } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // User management states
  const [users, setUsers] = useState<User[]>([]);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
    action: 'activate' | 'deactivate' | null;
  }>({ open: false, user: null, action: null });
  
  // Membership management states
  const [managedLabs, setManagedLabs] = useState<Lab[]>([]);
  const [managedTeams, setManagedTeams] = useState<Team[]>([]);
  const [labMembers, setLabMembers] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Remove member states
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [removeMemberType, setRemoveMemberType] = useState<'lab' | 'team'>('lab');
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<any>(null);
  const [removeMemberForm, setRemoveMemberForm] = useState({
    username: '',
    labName: '',
    teamName: ''
  });

  // Load user profile
  const loadUserProfile = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/auth/profile', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Load all users
  const loadUsers = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/auth/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      setError('Failed to load users');
    }
  };

  // Load managed labs and teams
  const loadManagedLabsAndTeams = async () => {
    if (!token) return;
    
    try {
      // Load labs where user is PI
      const managedLabsRes = await fetch('/api/auth/labs', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (managedLabsRes.ok) {
        const allLabs = await managedLabsRes.json();
        setManagedLabs(allLabs.filter((lab: Lab) => 
          userProfile?.labMemberships?.some((membership: any) => 
            membership.labId === lab.id && membership.roleInLab === 'Lab PI' && membership.isActive
          )
        ));
      }
      
      // Load teams where user is leader
      const managedTeamsRes = await fetch('/api/auth/teams', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (managedTeamsRes.ok) {
        const allTeams = await managedTeamsRes.json();
        setManagedTeams(allTeams.filter((team: Team) => 
          userProfile?.teamMemberships?.some((membership: any) => 
            membership.teamId === team.id && membership.roleInTeam === 'Team Leader' && membership.isActive
          )
        ));
      }
    } catch (error) {
      console.error('Error loading managed labs and teams:', error);
    }
  };

  // Load lab members for management
  const loadLabMembersForManagement = async (labId: number) => {
    if (!token) return;
    
    try {
      const [labResponse, usersResponse] = await Promise.all([
        fetch(`/api/auth/labs/${labId}/members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/public/users/basic')
      ]);
      
      if (labResponse.ok && usersResponse.ok) {
        const labData = await labResponse.json();
        const usersData = await usersResponse.json();
        
        const mappedMembers = labData
          .filter((member: any) => member.username !== username)
          .map((member: any) => {
            const userInfo = usersData.find((user: any) => user.username === member.username);
            return {
              username: member.username,
              email: userInfo ? userInfo.email : member.username + '@test.com',
              roleInLab: member.roleInLab,
              labName: member.labName || 'Unknown Lab'
            };
          });
        
        setLabMembers(mappedMembers);
      }
    } catch (error) {
      console.error('Error loading lab members:', error);
    }
  };

  // Load team members for management
  const loadTeamMembersForManagement = async (teamId: number) => {
    if (!token) return;
    
    try {
      const [teamResponse, usersResponse] = await Promise.all([
        fetch(`/api/auth/teams/${teamId}/members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/public/users/basic')
      ]);
      
      if (teamResponse.ok && usersResponse.ok) {
        const teamData = await teamResponse.json();
        const usersData = await usersResponse.json();
        
        const mappedMembers = teamData
          .filter((member: any) => member.username !== username)
          .map((member: any) => {
            const userInfo = usersData.find((user: any) => user.username === member.username);
            return {
              username: member.username,
              email: userInfo ? userInfo.email : member.username + '@test.com',
              roleInTeam: member.roleInTeam,
              teamName: member.teamName || 'Unknown Team',
              labName: member.labName || 'Unknown Lab'
            };
          });
        
        setTeamMembers(mappedMembers);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  // Remove member functions
  const openRemoveMemberDialog = (type: 'lab' | 'team', member: any) => {
    setRemoveMemberType(type);
    setSelectedMemberToRemove(member);
    setRemoveMemberForm({
      username: member.username,
      labName: type === 'lab' ? member.labName : member.labName,
      teamName: type === 'team' ? member.teamName : ''
    });
    setRemoveMemberDialogOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!token || !selectedMemberToRemove) return;
    
    try {
      const endpoint = removeMemberType === 'lab' 
        ? '/api/auth/admin/lab-memberships'
        : '/api/auth/admin/team-memberships';
      
      const body = removeMemberType === 'lab'
        ? {
            username: removeMemberForm.username,
            labName: removeMemberForm.labName
          }
        : {
            username: removeMemberForm.username,
            teamName: removeMemberForm.teamName
          };
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Username': username || ''
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        setSuccess(`Successfully removed ${removeMemberForm.username} from ${removeMemberType === 'lab' ? removeMemberForm.labName : removeMemberForm.teamName}`);
        setRemoveMemberDialogOpen(false);
        setRemoveMemberForm({ username: '', labName: '', teamName: '' });
        setSelectedMemberToRemove(null);
        
        // Refresh the member lists
        if (removeMemberType === 'lab') {
          // Find the lab that was just updated and refresh its members
          const updatedLab = managedLabs.find(lab => lab.labName === removeMemberForm.labName);
          if (updatedLab) {
            loadLabMembersForManagement(updatedLab.id);
          }
        } else {
          // Find the team that was just updated and refresh its members
          const updatedTeam = managedTeams.find(team => team.teamName === removeMemberForm.teamName);
          if (updatedTeam) {
            loadTeamMembersForManagement(updatedTeam.id);
          }
        }
        
        loadManagedLabsAndTeams();
      } else {
        const errorText = await response.text();
        setError(`Failed to remove member: ${errorText}`);
      }
    } catch (error) {
      setError('Failed to remove member');
    }
  };

  // User activation/deactivation
  const handleUserAction = async (user: User, action: 'activate' | 'deactivate') => {
    if (!token) return;
    
    try {
      const endpoint = action === 'activate' 
        ? '/api/auth/admin/users/activate'
        : '/api/auth/admin/users/deactivate';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Username': username || ''
        },
        body: JSON.stringify({ username: user.username })
      });
      
      if (response.ok) {
        setSuccess(`User ${user.username} ${action}d successfully`);
        loadUsers();
      } else {
        const errorText = await response.text();
        setError(`Failed to ${action} user: ${errorText}`);
      }
    } catch (error) {
      setError(`Failed to ${action} user`);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadUserProfile();
      await loadUsers();
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Load managed labs and teams when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      loadManagedLabsAndTeams();
    }
  }, [userProfile]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Unified Management</Typography>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Unified Management</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="User Management" />
        <Tab label="Lab Members" />
        <Tab label="Team Members" />
      </Tabs>

      {/* User Management Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">User Management</Typography>
          <Button 
            variant="outlined" 
            onClick={() => setShowDeactivated(!showDeactivated)}
          >
            {showDeactivated ? 'Hide' : 'Show'} Deactivated Users
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .filter(user => showDeactivated || user.isActive)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Inactive'} 
                        color={user.isActive ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => setConfirmDialog({ open: true, user, action: 'deactivate' })}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button 
                          variant="outlined" 
                          color="success" 
                          size="small"
                          onClick={() => setConfirmDialog({ open: true, user, action: 'activate' })}
                        >
                          Activate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Lab Members Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>Lab Members Management</Typography>
        {managedLabs.length === 0 ? (
          <Alert severity="info">
            You are not a Lab PI of any labs. Only Lab PIs can manage lab members.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {managedLabs.map((lab) => (
              <Grid item xs={12} md={6} key={lab.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{lab.labName}</Typography>
                    <Typography color="textSecondary">Lab ID: {lab.labId}</Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => loadLabMembersForManagement(lab.id)}
                      sx={{ mt: 1 }}
                    >
                      View Members
                    </Button>
                    {labMembers.length > 0 && (
                      <List sx={{ mt: 2 }}>
                        {labMembers.map((member) => (
                          <ListItem key={member.username} divider>
                            <ListItemText
                              primary={member.username}
                              secondary={`${member.email} - ${member.roleInLab}`}
                            />
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small"
                              onClick={() => openRemoveMemberDialog('lab', member)}
                            >
                              Remove
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Team Members Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>Team Members Management</Typography>
        {managedTeams.length === 0 ? (
          <Alert severity="info">
            You are not a Team Leader of any teams. Only Team Leaders can manage team members.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {managedTeams.map((team) => (
              <Grid item xs={12} md={6} key={team.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{team.teamName}</Typography>
                    <Typography color="textSecondary">Team ID: {team.teamId}</Typography>
                    <Typography color="textSecondary">Lab: {team.labName}</Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => loadTeamMembersForManagement(team.id)}
                      sx={{ mt: 1 }}
                    >
                      View Members
                    </Button>
                    {teamMembers.length > 0 && (
                      <List sx={{ mt: 2 }}>
                        {teamMembers.map((member) => (
                          <ListItem key={member.username} divider>
                            <ListItemText
                              primary={member.username}
                              secondary={`${member.email} - ${member.roleInTeam}`}
                            />
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small"
                              onClick={() => openRemoveMemberDialog('team', member)}
                            >
                              Remove
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Confirmation Dialog for User Actions */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, user: null, action: null })}>
        <DialogTitle>
          {confirmDialog.action === 'activate' ? 'Activate' : 'Deactivate'} User
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action} user "{confirmDialog.user?.username}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, user: null, action: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (confirmDialog.user && confirmDialog.action) {
                handleUserAction(confirmDialog.user, confirmDialog.action);
                setConfirmDialog({ open: false, user: null, action: null });
              }
            }} 
            variant="contained"
            color={confirmDialog.action === 'activate' ? 'success' : 'error'}
          >
            {confirmDialog.action === 'activate' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={removeMemberDialogOpen} onClose={() => {
        setRemoveMemberDialogOpen(false);
        setRemoveMemberForm({ username: '', labName: '', teamName: '' });
        setSelectedMemberToRemove(null);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          Remove Member from {removeMemberType === 'lab' ? 'Lab' : 'Team'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to remove <strong>{removeMemberForm.username}</strong> from{' '}
            <strong>{removeMemberType === 'lab' ? removeMemberForm.labName : removeMemberForm.teamName}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            This action cannot be undone. The user will lose access to all resources associated with this {removeMemberType}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRemoveMemberDialogOpen(false);
            setRemoveMemberForm({ username: '', labName: '', teamName: '' });
            setSelectedMemberToRemove(null);
          }}>Cancel</Button>
          <Button 
            onClick={handleRemoveMember} 
            variant="contained" 
            color="error"
          >
            Remove Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnifiedManagementPage;
