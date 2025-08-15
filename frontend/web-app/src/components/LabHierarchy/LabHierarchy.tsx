import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
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
} from '@mui/material';
import {
  SupervisorAccount,
  Person,
  School,
  Science,
  Build,
  AccountTree,
  ExpandMore,
  ExpandLess,
  Business,
  Group,
  Star,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import axios from 'axios';

interface LabHierarchyProps {
  username: string;
}

interface UserLabMembershipDto {
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

interface UserTeamMembershipDto {
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

interface UserProfile {
  userId?: number;
  username: string;
  role: string;
  email: string;
  telephone: string;
  birthday: string;
  photoUrl: string;
  isActive: boolean;
  supervisorName?: string;
  supervisorRole?: string;
  subordinateNames?: string[];
  labMemberships?: UserLabMembershipDto[];
  primaryLab?: UserLabMembershipDto;
  teamMemberships?: UserTeamMembershipDto[];
  primaryTeam?: UserTeamMembershipDto;
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
      id={`organization-tabpanel-${index}`}
      aria-labelledby={`organization-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LabHierarchy: React.FC<LabHierarchyProps> = ({ username }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'lab' | 'team'>('lab');
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    id: '',
  });
  const [nextLabId, setNextLabId] = useState<string>('');
  const [nextTeamId, setNextTeamId] = useState<string>('');
  const [loadingNextId, setLoadingNextId] = useState(false);
  const [labMembers, setLabMembers] = useState<{[key: number]: any[]}>({});
  const [teamMembers, setTeamMembers] = useState<{[key: number]: any[]}>({});
  const [loadingMembers, setLoadingMembers] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (createDialogOpen) {
      if (createType === 'lab') {
        fetchNextLabId();
      } else if (createType === 'team') {
        fetchNextTeamId();
      }
    }
  }, [createDialogOpen, createType]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get('http://localhost:12001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextLabId = async () => {
    try {
      setLoadingNextId(true);
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get('http://localhost:12001/api/auth/admin/labs/next-id', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setNextLabId(response.data.nextLabId);
      setCreateForm(prev => ({ ...prev, id: response.data.nextLabId }));
    } catch (err: any) {
      console.error('Failed to fetch next lab ID:', err);
      setNextLabId('LAB001'); // Fallback
      setCreateForm(prev => ({ ...prev, id: 'LAB001' }));
    } finally {
      setLoadingNextId(false);
    }
  };

  const fetchNextTeamId = async () => {
    try {
      setLoadingNextId(true);
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get('http://localhost:12001/api/auth/admin/teams/next-id', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setNextTeamId(response.data.nextTeamId);
      setCreateForm(prev => ({ ...prev, id: response.data.nextTeamId }));
    } catch (err: any) {
      console.error('Failed to fetch next team ID:', err);
      setNextTeamId('TEAM001'); // Fallback
      setCreateForm(prev => ({ ...prev, id: 'TEAM001' }));
    } finally {
      setLoadingNextId(false);
    }
  };

  const fetchLabMembers = async (labId: number) => {
    try {
      setLoadingMembers(prev => ({ ...prev, [`lab-${labId}`]: true }));
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`http://localhost:12001/api/auth/admin/labs/${labId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setLabMembers(prev => ({ ...prev, [labId]: response.data }));
    } catch (err: any) {
      console.error('Failed to fetch lab members:', err);
      setLabMembers(prev => ({ ...prev, [labId]: [] }));
    } finally {
      setLoadingMembers(prev => ({ ...prev, [`lab-${labId}`]: false }));
    }
  };

  const fetchTeamMembers = async (teamId: number) => {
    try {
      setLoadingMembers(prev => ({ ...prev, [`team-${teamId}`]: true }));
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`http://localhost:12001/api/auth/admin/teams/${teamId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setTeamMembers(prev => ({ ...prev, [teamId]: response.data }));
    } catch (err: any) {
      console.error('Failed to fetch team members:', err);
      setTeamMembers(prev => ({ ...prev, [teamId]: [] }));
    } finally {
      setLoadingMembers(prev => ({ ...prev, [`team-${teamId}`]: false }));
    }
  };

  const handleCreateOrganization = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (createType === 'lab') {
        // Use auto-generated ID for labs
        await axios.post('http://localhost:12001/api/auth/admin/labs/auto-id', {
          labName: createForm.name,
          labDescription: createForm.description,
          institution: 'University of Science',
          department: 'Research Department'
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Use auto-generated ID for teams
        await axios.post('http://localhost:12001/api/auth/admin/teams/auto-id', {
          teamName: createForm.name,
          teamDescription: createForm.description,
          labId: 1 // Default lab ID - should be selectable in a real app
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setCreateDialogOpen(false);
      setCreateForm({ name: '', description: '', id: '' });
      setNextLabId('');
      setNextTeamId('');
      fetchProfile(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create organization');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Lab PI':
        return <SupervisorAccount color="primary" />;
      case 'PhD Student':
        return <School color="secondary" />;
      case 'Master Student':
        return <School color="info" />;
      case 'Data Analyst':
        return <Science color="success" />;
      case 'Technician':
        return <Build color="warning" />;
      case 'Team Leader':
        return <SupervisorAccount color="primary" />;
      case 'Senior Member':
        return <Person color="secondary" />;
      case 'Junior Member':
        return <Person color="info" />;
      default:
        return <Person color="info" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Lab PI':
      case 'Team Leader':
        return 'primary';
      case 'PhD Student':
      case 'Senior Member':
        return 'secondary';
      case 'Master Student':
      case 'Junior Member':
        return 'info';
      case 'Data Analyst':
        return 'success';
      case 'Technician':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Role-based access control functions
  const canCreateLab = (userRole: string): boolean => {
    return userRole === 'Lab PI';
  };

  const canCreateTeam = (userRole: string): boolean => {
    return ['Lab PI', 'PhD Student', 'Master Student', 'Team Leader', 'Senior Member'].includes(userRole);
  };

  const getUserHighestRole = (): string => {
    if (!profile) return '';
    
    // Check lab memberships for highest role
    const labRoles = profile.labMemberships?.map(m => m.roleInLab) || [];
    const teamRoles = profile.teamMemberships?.map(m => m.roleInTeam) || [];
    
    const allRoles = [...labRoles, ...teamRoles, profile.role];
    
    // Priority order: Lab PI > Team Leader > PhD Student > Master Student > others
    if (allRoles.includes('Lab PI')) return 'Lab PI';
    if (allRoles.includes('Team Leader')) return 'Team Leader';
    if (allRoles.includes('PhD Student')) return 'PhD Student';
    if (allRoles.includes('Master Student')) return 'Master Student';
    
    return profile.role || '';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading organization information...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Failed to load organization information</Typography>
        </CardContent>
      </Card>
    );
  }

  const totalOrganizations = (profile.labMemberships?.length || 0) + (profile.teamMemberships?.length || 0);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountTree sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            My Organizations ({totalOrganizations})
          </Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ ml: 'auto' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Current User */}
        <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.dark' }}>
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.username} style={{ width: '100%', height: '100%' }} />
              ) : (
                getRoleIcon(profile.role)
              )}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {profile.username} (You)
              </Typography>
              <Chip
                label={profile.role}
                color={getRoleColor(profile.role) as any}
                size="small"
                sx={{ mr: 1 }}
              />
              {profile.primaryLab && (
                <Chip
                  label={`${profile.primaryLab.labName} (${profile.primaryLab.labCode})`}
                  variant="outlined"
                  size="small"
                  icon={<Star />}
                  sx={{ mr: 1 }}
                />
              )}
              {profile.primaryTeam && (
                <Chip
                  label={`${profile.primaryTeam.teamName} (${profile.primaryTeam.teamIdCode})`}
                  variant="outlined"
                  size="small"
                  icon={<Star />}
                  sx={{ mr: 1 }}
                />
              )}
            </Box>
          </Box>
        </Paper>

        {expanded && (
          <>
            {/* Organization Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab 
                  label={`Labs (${profile.labMemberships?.length || 0})`} 
                  icon={<Business />} 
                  iconPosition="start"
                />
                <Tab 
                  label={`Teams (${profile.teamMemberships?.length || 0})`} 
                  icon={<Group />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* User Role and Permissions Display */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Your Role & Permissions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip 
                  label={`Role: ${getUserHighestRole()}`}
                  color="primary"
                  size="small"
                />
                <Chip 
                  label={`Create Lab: ${canCreateLab(getUserHighestRole()) ? '✅' : '❌'}`}
                  color={canCreateLab(getUserHighestRole()) ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label={`Create Team: ${canCreateTeam(getUserHighestRole()) ? '✅' : '❌'}`}
                  color={canCreateTeam(getUserHighestRole()) ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>

            {/* Create Organization Buttons - Role-based Access Control */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(() => {
                const userRole = getUserHighestRole();
                const canCreateLabPermission = canCreateLab(userRole);
                const canCreateTeamPermission = canCreateTeam(userRole);
                
                return (
                  <>
                    {canCreateLabPermission && (
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => {
                          setCreateType('lab');
                          setCreateDialogOpen(true);
                        }}
                        size="small"
                        color="primary"
                      >
                        Create New Lab
                      </Button>
                    )}
                    {canCreateTeamPermission && (
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => {
                          setCreateType('team');
                          setCreateDialogOpen(true);
                        }}
                        size="small"
                        color="secondary"
                      >
                        Create New Team
                      </Button>
                    )}
                    {!canCreateLabPermission && !canCreateTeamPermission && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        You don't have permission to create labs or teams.
                      </Typography>
                    )}
                  </>
                );
              })()}
            </Box>

            {/* Labs Tab */}
            <TabPanel value={tabValue} index={0}>
              {profile.labMemberships && profile.labMemberships.length > 0 ? (
                profile.labMemberships.map((membership, index) => (
                  <Accordion key={membership.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar sx={{ mr: 2, bgcolor: membership.isPrimaryLab ? 'primary.main' : 'grey.300' }}>
                          {membership.isPrimaryLab ? <Star /> : <Business />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {membership.labName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {membership.labCode} • {membership.roleInLab}
                            {membership.memberId && ` • ID: ${membership.memberId}`}
                            {membership.isPrimaryLab && ' • Primary Lab'}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Lab:</strong> {membership.labName} ({membership.labCode})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Role:</strong> {membership.roleInLab}
                          </Typography>
                          {membership.memberId && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Member ID:</strong> {membership.memberId}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {membership.supervisorUsername && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Supervisor:</strong> {membership.supervisorUsername}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            <strong>Joined:</strong> {new Date(membership.joinedAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Status:</strong> {membership.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Grid>
                        
                        {/* Lab Members Section */}
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ mr: 1 }}>
                              Lab Members
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => fetchLabMembers(membership.labId)}
                              disabled={loadingMembers[`lab-${membership.labId}`]}
                              startIcon={loadingMembers[`lab-${membership.labId}`] ? <CircularProgress size={16} /> : <Group />}
                            >
                              {labMembers[membership.labId] ? 'Refresh Members' : 'View Members'}
                            </Button>
                          </Box>
                          
                          {loadingMembers[`lab-${membership.labId}`] ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                              <CircularProgress size={24} />
                            </Box>
                          ) : labMembers[membership.labId] ? (
                            <List dense>
                              {labMembers[membership.labId].map((member: any, memberIndex: number) => (
                                <ListItem key={memberIndex} sx={{ pl: 0 }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: member.isPrimaryLab ? 'primary.main' : 'grey.300' }}>
                                      {member.isPrimaryLab ? <Star /> : <Person />}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={member.username}
                                    secondary={
                                      <Box>
                                        <Typography variant="caption" display="block">
                                          Role: {member.roleInLab}
                                          {member.memberId && ` • ID: ${member.memberId}`}
                                          {member.isPrimaryLab && ' • Primary Lab'}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                          Joined: {new Date(member.joinedAt).toLocaleDateString()}
                                          {member.supervisorUsername && ` • Supervisor: ${member.supervisorUsername}`}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                              Click "View Members" to see lab members
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                  No lab memberships found.
                </Typography>
              )}
            </TabPanel>

            {/* Teams Tab */}
            <TabPanel value={tabValue} index={1}>
              {profile.teamMemberships && profile.teamMemberships.length > 0 ? (
                profile.teamMemberships.map((membership, index) => (
                  <Accordion key={membership.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar sx={{ mr: 2, bgcolor: membership.isPrimaryTeam ? 'secondary.main' : 'grey.300' }}>
                          {membership.isPrimaryTeam ? <Star /> : <Group />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {membership.teamName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {membership.teamIdCode} • {membership.roleInTeam}
                            {membership.memberId && ` • ID: ${membership.memberId}`}
                            {membership.isPrimaryTeam && ' • Primary Team'}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Team:</strong> {membership.teamName} ({membership.teamIdCode})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Role:</strong> {membership.roleInTeam}
                          </Typography>
                          {membership.memberId && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Member ID:</strong> {membership.memberId}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {membership.supervisorUsername && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Supervisor:</strong> {membership.supervisorUsername}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            <strong>Joined:</strong> {new Date(membership.joinedAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Status:</strong> {membership.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Grid>
                        
                        {/* Team Members Section */}
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ mr: 1 }}>
                              Team Members
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => fetchTeamMembers(membership.teamId)}
                              disabled={loadingMembers[`team-${membership.teamId}`]}
                              startIcon={loadingMembers[`team-${membership.teamId}`] ? <CircularProgress size={16} /> : <Group />}
                            >
                              {teamMembers[membership.teamId] ? 'Refresh Members' : 'View Members'}
                            </Button>
                          </Box>
                          
                          {loadingMembers[`team-${membership.teamId}`] ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                              <CircularProgress size={24} />
                            </Box>
                          ) : teamMembers[membership.teamId] ? (
                            <List dense>
                              {teamMembers[membership.teamId].map((member: any, memberIndex: number) => (
                                <ListItem key={memberIndex} sx={{ pl: 0 }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: member.isPrimaryTeam ? 'secondary.main' : 'grey.300' }}>
                                      {member.isPrimaryTeam ? <Star /> : <Person />}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={member.username}
                                    secondary={
                                      <Box>
                                        <Typography variant="caption" display="block">
                                          Role: {member.roleInTeam}
                                          {member.memberId && ` • ID: ${member.memberId}`}
                                          {member.isPrimaryTeam && ' • Primary Team'}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                          Joined: {new Date(member.joinedAt).toLocaleDateString()}
                                          {member.supervisorUsername && ` • Supervisor: ${member.supervisorUsername}`}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                              Click "View Members" to see team members
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                  No team memberships found.
                </Typography>
              )}
            </TabPanel>
          </>
        )}

        {/* Summary */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Role: {profile.role}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Organizations: {totalOrganizations}
              </Typography>
            </Grid>
            {profile.primaryLab && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Primary Lab: {profile.primaryLab.labName} ({profile.primaryLab.labCode})
                </Typography>
              </Grid>
            )}
            {profile.primaryTeam && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Primary Team: {profile.primaryTeam.teamName} ({profile.primaryTeam.teamIdCode})
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Create Organization Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          {createDialogOpen && (
            <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1 }}>
              {loadingNextId ? (
                <CircularProgress size={20} />
              ) : (
                <Button
                  size="small"
                  onClick={createType === 'lab' ? fetchNextLabId : fetchNextTeamId}
                  disabled={loadingNextId}
                >
                  Refresh ID
                </Button>
              )}
            </Box>
          )}
          <DialogTitle>
            Create New {createType === 'lab' ? 'Lab' : 'Team'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Organization Type</InputLabel>
                <Select
                  value={createType}
                  label="Organization Type"
                  onChange={(e) => setCreateType(e.target.value as 'lab' | 'team')}
                >
                  <MenuItem value="lab">Lab</MenuItem>
                  <MenuItem value="team">Team</MenuItem>
                </Select>
              </FormControl>
              {createType === 'lab' ? (
                <TextField
                  fullWidth
                  label="Lab ID (Auto-generated)"
                  value={nextLabId || 'Loading...'}
                  sx={{ mb: 2 }}
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="This ID is automatically generated and cannot be changed"
                />
              ) : (
                <TextField
                  fullWidth
                  label="Team ID (Auto-generated)"
                  value={nextTeamId || 'Loading...'}
                  sx={{ mb: 2 }}
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="This ID is automatically generated and cannot be changed"
                />
              )}
              <TextField
                fullWidth
                label={`${createType === 'lab' ? 'Lab' : 'Team'} Name`}
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                sx={{ mb: 2 }}
                placeholder={createType === 'lab' ? 'e.g., Omics Research Lab' : 'e.g., Alpha Team'}
              />
              <TextField
                fullWidth
                label="Description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                multiline
                rows={3}
                placeholder="Brief description of the organization..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateOrganization} 
              variant="contained"
              disabled={!createForm.name}
            >
              Create {createType === 'lab' ? 'Lab' : 'Team'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LabHierarchy; 