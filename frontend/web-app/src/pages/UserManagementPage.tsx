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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Block,
  CheckCircle,
  Visibility,
  AdminPanelSettings,
  Person,
  Email,
  Phone,
  Warning,
  ExpandMore,
  Business,
  Group,
  Assignment,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LabApplicationForm from '../components/LabHierarchy/LabApplicationForm';
import LabApplicationsPanel from '../components/LabHierarchy/LabApplicationsPanel';
import LeaveLabDialog from '../components/LabHierarchy/LeaveLabDialog';
import axios from 'axios';

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

interface UserLabMembership {
  id: number;
  userId: number;
  username: string;
  labId: number;
  labName: string;
  labCode: string;
  roleInLab: string;
  memberId: string;
  supervisorId?: number;
  supervisorUsername?: string;
  isPrimaryLab: boolean;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserTeamMembership {
  id: number;
  userId: number;
  username: string;
  teamId: number;
  teamName: string;
  teamIdCode: string;
  roleInTeam: string;
  memberId: string;
  supervisorId?: number;
  supervisorUsername?: string;
  isPrimaryTeam: boolean;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Lab {
  id: number;
  labId: string;
  labName: string;
  isActive: boolean;
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
      id={`user-management-tabpanel-${index}`}
      aria-labelledby={`user-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const UserManagementPage: React.FC = () => {
  const { username, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
    action: 'activate' | 'deactivate' | null;
  }>({ open: false, user: null, action: null });

  // Application and leave functionality
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [applicationsPanelOpen, setApplicationsPanelOpen] = useState(false);
  const [leaveLabDialogOpen, setLeaveLabDialogOpen] = useState(false);
  const [selectedLabForLeave, setSelectedLabForLeave] = useState<{id: number, name: string, role: string} | null>(null);
  const [availableLabs, setAvailableLabs] = useState<Lab[]>([]);
  const [userMemberships, setUserMemberships] = useState<{
    labMemberships: UserLabMembership[];
    teamMemberships: UserTeamMembership[];
  }>({ labMemberships: [], teamMemberships: [] });
  const [isPIOrTeamLeader, setIsPIOrTeamLeader] = useState(false);
  const [allUsersWithOrganizations, setAllUsersWithOrganizations] = useState<any[]>([]);
  const [accessChecking, setAccessChecking] = useState(true);

  // Access control check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user has any lab or team memberships
    const hasMemberships = userMemberships.labMemberships.length > 0 || userMemberships.teamMemberships.length > 0;
    
    // If user has no memberships at all, redirect to welcome page
    if (hasMemberships === false && userMemberships.labMemberships.length === 0 && userMemberships.teamMemberships.length === 0) {
      // Wait a bit for memberships to load, then check again
      const timer = setTimeout(() => {
        if (userMemberships.labMemberships.length === 0 && userMemberships.teamMemberships.length === 0) {
          navigate('/welcome');
        } else {
          setAccessChecking(false);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setAccessChecking(false);
    }
  }, [isAuthenticated, navigate, userMemberships]);

  useEffect(() => {
    fetchUserMemberships();
    fetchAvailableLabs();
  }, []);

  useEffect(() => {
    if (userMemberships.labMemberships.length > 0 || userMemberships.teamMemberships.length > 0) {
      fetchUsers();
    }
  }, [userMemberships]);

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
      const currentUsername = localStorage.getItem('username');
      
      // First, check if user is a PI or Team Leader
      const isPI = userMemberships.labMemberships.some(m => 
        m.roleInLab === 'Lab PI' && m.isActive
      );
      const isTeamLeader = userMemberships.teamMemberships.some(m => 
        m.roleInTeam === 'Team Leader' && m.isActive
      );
      const isPIOrLeader = isPI || isTeamLeader;
      setIsPIOrTeamLeader(isPIOrLeader);

      if (isPIOrLeader) {
        // For PIs and Team Leaders: fetch all users with organization info
        let response = await fetch('http://localhost:12001/api/auth/admin/users/all-with-organizations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Username': currentUsername || ''
          }
        });

        if (!response.ok) {
          // Fallback to regular admin endpoint
          response = await fetch('http://localhost:12001/api/auth/admin/users', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'X-Username': currentUsername || ''
            }
          });
        }

        if (response.ok) {
          const data = await response.json();
          const userList = data.users || data;
          setAllUsers(userList);
          setAllUsersWithOrganizations(userList);
        } else {
          throw new Error('Failed to fetch users');
        }
      } else {
        // For regular members: fetch only users in their labs/teams
        let response = await fetch('http://localhost:12001/api/auth/labs/my-lab-members', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Username': currentUsername || ''
          }
        });

        if (response.ok) {
          const data = await response.json();
          const userList = data.users || data;
          setAllUsers(userList);
        } else {
          throw new Error('Failed to fetch lab members');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMemberships = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get('http://localhost:12001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username
        }
      });

      if (response.data) {
        setUserMemberships({
          labMemberships: response.data.labMemberships || [],
          teamMemberships: response.data.teamMemberships || []
        });
      }
    } catch (err: any) {
      console.error('Error fetching user memberships:', err);
    }
  };

  const fetchAvailableLabs = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get('http://localhost:12001/api/auth/admin/labs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username
        }
      });
      setAvailableLabs(response.data);
    } catch (err: any) {
      console.error('Error fetching available labs:', err);
    }
  };

  const handleApplicationSuccess = () => {
    fetchUserMemberships(); // Refresh memberships
    setSuccessMessage('Application submitted successfully!');
  };

  const handleLeaveLab = (labId: number, labName: string, role: string) => {
    setSelectedLabForLeave({ id: labId, name: labName, role });
    setLeaveLabDialogOpen(true);
  };

  const handleLeaveLabSuccess = () => {
    fetchUserMemberships(); // Refresh memberships
    setSuccessMessage('Successfully left the lab!');
  };

  const isLabPI = (labId: number): boolean => {
    return userMemberships.labMemberships.some(m => m.labId === labId && m.roleInLab === 'Lab PI' && m.isActive);
  };

  const handleUserAction = async (user: User, action: 'activate' | 'deactivate') => {
    try {
      const token = localStorage.getItem('jwtToken');
      const currentUsername = localStorage.getItem('username');
      
             const response = await fetch(`http://localhost:12001/api/auth/admin/users/${user.id}/${action}`, {
         method: 'PUT',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
           'X-Username': currentUsername || ''
         }
       });

      if (response.ok) {
        setSuccessMessage(`User ${action}d successfully`);
        fetchUsers(); // Refresh the user list
      } else {
        throw new Error(`Failed to ${action} user`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    }
    setConfirmDialog({ open: false, user: null, action: null });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Lab PI':
        return 'primary';
      case 'Team Leader':
        return 'secondary';
      case 'PhD Student':
        return 'success';
      case 'Master Student':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Lab PI':
        return <AdminPanelSettings />;
      case 'Team Leader':
        return <AdminPanelSettings />;
      case 'PhD Student':
      case 'Master Student':
        return <Person />;
      default:
        return <Person />;
    }
  };

  if (loading || accessChecking) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading user management...</Typography>
      </Box>
    );
  }

  // Check if user has any memberships
  const hasMemberships = userMemberships.labMemberships.length > 0 || userMemberships.teamMemberships.length > 0;
  
  if (!hasMemberships) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need to be a member of a lab or team to access user management.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/welcome')}>
          Go to Welcome Page
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<Assignment />}
          onClick={() => {
            fetchAvailableLabs();
            setApplicationFormOpen(true);
          }}
        >
          Apply to Join Lab
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Assignment />}
          onClick={() => setApplicationsPanelOpen(true)}
        >
          My Applications
        </Button>

        <Button
          variant={showDeactivated ? "contained" : "outlined"}
          onClick={() => setShowDeactivated(!showDeactivated)}
        >
          {showDeactivated ? "Hide Deactivated" : "Show Deactivated"}
        </Button>
      </Box>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Users" />
          <Tab label="By Organization" />
          <Tab label="My Memberships" />
        </Tabs>
      </Box>

      {/* All Users Tab */}
      <TabPanel value={tabValue} index={0}>
        {isPIOrTeamLeader ? (
          // For PIs and Team Leaders: Show users organized by organizations
          <Box>
            {allUsersWithOrganizations.length > 0 ? (
              allUsersWithOrganizations.map((user: any) => (
                <Paper key={user.id} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {getRoleIcon(user.role)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email} • {user.role}
                      </Typography>
                    </Box>
                    <Chip
                      label={user.isActive ? "Active" : "Inactive"}
                      color={user.isActive ? "success" : "error"}
                      size="small"
                      icon={user.isActive ? <CheckCircle /> : <Block />}
                    />
                  </Box>
                  
                  {/* Lab Memberships */}
                  {user.labMemberships && user.labMemberships.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                        <Business sx={{ fontSize: 16, mr: 0.5 }} />
                        Lab Memberships
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {user.labMemberships.map((lab: any, index: number) => (
                          <Chip
                            key={index}
                            label={`${lab.labName} (${lab.labCode}) - ${lab.roleInLab}${lab.isPrimaryLab ? ' (Primary)' : ''}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Team Memberships */}
                  {user.teamMemberships && user.teamMemberships.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="secondary" sx={{ mb: 1 }}>
                        <Group sx={{ fontSize: 16, mr: 0.5 }} />
                        Team Memberships
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {user.teamMemberships.map((team: any, index: number) => (
                          <Chip
                            key={index}
                            label={`${team.teamName} (${team.teamIdCode}) - ${team.roleInTeam}${team.isPrimaryTeam ? ' (Primary)' : ''}`}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                                         {user.isActive ? (
                       <IconButton
                         size="small"
                         color="warning"
                         title="Deactivate User"
                         onClick={() => setConfirmDialog({ open: true, user, action: 'deactivate' })}
                       >
                         <Block />
                       </IconButton>
                     ) : (
                       <IconButton
                         size="small"
                         color="success"
                         title="Activate User"
                         onClick={() => setConfirmDialog({ open: true, user, action: 'activate' })}
                       >
                         <CheckCircle />
                       </IconButton>
                     )}
                   </Box>
                 </Paper>
               ))
             ) : (
               <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                 No users found
               </Typography>
             )}
           </Box>
         ) : (
           // For regular members: Show simple table of lab members
           <Paper>
             <TableContainer>
               <Table>
                 <TableHead>
                   <TableRow>
                     <TableCell>User</TableCell>
                     <TableCell>Email</TableCell>
                     <TableCell>Role</TableCell>
                     <TableCell>Status</TableCell>
                     <TableCell>Actions</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {users.map((user) => (
                     <TableRow key={user.id}>
                       <TableCell>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Avatar sx={{ width: 32, height: 32 }}>
                             {getRoleIcon(user.role)}
                           </Avatar>
                           <Box>
                             <Typography variant="body2" fontWeight="bold">
                               {user.username}
                             </Typography>
                             {user.telephone && (
                               <Typography variant="caption" color="text.secondary">
                                 <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                                 {user.telephone}
                               </Typography>
                             )}
                           </Box>
                         </Box>
                       </TableCell>
                       <TableCell>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Email sx={{ fontSize: 16 }} />
                           {user.email}
                         </Box>
                       </TableCell>
                       <TableCell>
                         <Chip
                           label={user.role}
                           color={getRoleColor(user.role) as any}
                           size="small"
                           icon={getRoleIcon(user.role)}
                         />
                       </TableCell>
                       <TableCell>
                         <Chip
                           label={user.isActive ? "Active" : "Inactive"}
                           color={user.isActive ? "success" : "error"}
                           size="small"
                           icon={user.isActive ? <CheckCircle /> : <Block />}
                         />
                       </TableCell>
                       <TableCell>
                         <Stack direction="row" spacing={1}>
                           <IconButton
                             size="small"
                             color="primary"
                             title="View Details"
                           >
                             <Visibility />
                           </IconButton>
                         </Stack>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </TableContainer>
           </Paper>
         )}
       </TabPanel>

      {/* By Organization Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={2}>
          {/* Lab Memberships */}
          {userMemberships.labMemberships.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business />
                    Lab Memberships
                  </Typography>
                  {userMemberships.labMemberships.map((membership) => (
                    <Accordion key={membership.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Avatar sx={{ mr: 2, bgcolor: membership.isPrimaryLab ? 'primary.main' : 'grey.300' }}>
                            <Business />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {membership.labName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {membership.labCode} • {membership.roleInLab}
                              {membership.isPrimaryLab && ' • Primary Lab'}
                            </Typography>
                          </Box>
                          <Chip
                            label={membership.isActive ? "Active" : "Inactive"}
                            color={membership.isActive ? "success" : "error"}
                            size="small"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Role:</strong> {membership.roleInLab}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Joined:</strong> {new Date(membership.joinedAt).toLocaleDateString()}
                          </Typography>
                          {membership.supervisorUsername && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Supervisor:</strong> {membership.supervisorUsername}
                            </Typography>
                          )}
                          
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            {/* PI can view applications */}
                            {isLabPI(membership.labId) && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                onClick={() => setApplicationsPanelOpen(true)}
                                startIcon={<Assignment />}
                              >
                                View Applications
                              </Button>
                            )}
                            
                            {/* Non-PI can leave lab */}
                            {membership.roleInLab !== 'Lab PI' && membership.isActive && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleLeaveLab(membership.labId, membership.labName, membership.roleInLab)}
                                startIcon={<ExitToApp />}
                              >
                                Leave Lab
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Team Memberships */}
          {userMemberships.teamMemberships.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Group />
                    Team Memberships
                  </Typography>
                  {userMemberships.teamMemberships.map((membership) => (
                    <Accordion key={membership.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Avatar sx={{ mr: 2, bgcolor: membership.isPrimaryTeam ? 'secondary.main' : 'grey.300' }}>
                            <Group />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {membership.teamName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {membership.teamIdCode} • {membership.roleInTeam}
                              {membership.isPrimaryTeam && ' • Primary Team'}
                            </Typography>
                          </Box>
                          <Chip
                            label={membership.isActive ? "Active" : "Inactive"}
                            color={membership.isActive ? "success" : "error"}
                            size="small"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Role:</strong> {membership.roleInTeam}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Joined:</strong> {new Date(membership.joinedAt).toLocaleDateString()}
                          </Typography>
                          {membership.supervisorUsername && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Supervisor:</strong> {membership.supervisorUsername}
                            </Typography>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* My Memberships Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Organization Memberships
            </Typography>
            
            {userMemberships.labMemberships.length === 0 && userMemberships.teamMemberships.length === 0 ? (
              <Typography color="text.secondary">
                You are not a member of any organizations yet.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {/* Lab Memberships Summary */}
                {userMemberships.labMemberships.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Lab Memberships ({userMemberships.labMemberships.length})
                    </Typography>
                    {userMemberships.labMemberships.map((membership) => (
                      <Box key={membership.id} sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {membership.labName} ({membership.labCode})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Role: {membership.roleInLab} • {membership.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}

                {/* Team Memberships Summary */}
                {userMemberships.teamMemberships.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Team Memberships ({userMemberships.teamMemberships.length})
                    </Typography>
                    {userMemberships.teamMemberships.map((membership) => (
                      <Box key={membership.id} sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {membership.teamName} ({membership.teamIdCode})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Role: {membership.roleInTeam} • {membership.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}
              </Grid>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, user: null, action: null })}>
        <DialogTitle>
          {confirmDialog.action === 'activate' ? 'Activate User' : 'Deactivate User'}
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
            onClick={() => confirmDialog.user && confirmDialog.action && handleUserAction(confirmDialog.user, confirmDialog.action)}
            variant="contained"
            color={confirmDialog.action === 'activate' ? 'success' : 'error'}
          >
            {confirmDialog.action === 'activate' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lab Application Form Dialog */}
      <LabApplicationForm
        open={applicationFormOpen}
        onClose={() => setApplicationFormOpen(false)}
        onSuccess={handleApplicationSuccess}
        availableLabs={availableLabs}
      />

      {/* Lab Applications Panel Dialog */}
      <Dialog 
        open={applicationsPanelOpen} 
        onClose={() => setApplicationsPanelOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Lab Applications</DialogTitle>
        <DialogContent>
          <LabApplicationsPanel
            labId={userMemberships.labMemberships.find(m => isLabPI(m.labId))?.labId}
            isPI={userMemberships.labMemberships.some(m => isLabPI(m.labId))}
            onApplicationUpdate={handleApplicationSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Leave Lab Dialog */}
      {selectedLabForLeave && (
        <LeaveLabDialog
          open={leaveLabDialogOpen}
          onClose={() => setLeaveLabDialogOpen(false)}
          onSuccess={handleLeaveLabSuccess}
          labId={selectedLabForLeave.id}
          labName={selectedLabForLeave.name}
          userRole={selectedLabForLeave.role}
        />
      )}
    </Box>
  );
};

export default UserManagementPage; 