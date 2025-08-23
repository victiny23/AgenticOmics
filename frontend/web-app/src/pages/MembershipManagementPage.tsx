import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface LabMembershipRequest {
  id: number;
  username: string;
  userEmail: string;
  labName: string;
  labId: string;
  requestedRole: string;
  requestMessage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedByUsername?: string;
  reviewMessage?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface TeamMembershipRequest {
  id: number;
  username: string;
  userEmail: string;
  teamName: string;
  teamId: string;
  labName: string;
  labId: string;
  requestedRole: string;
  requestMessage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedByUsername?: string;
  reviewMessage?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface LabInvitation {
  id: number;
  invitedUsername: string;
  invitedUserEmail: string;
  labName: string;
  labId: string;
  invitedByUsername: string;
  invitedRole: string;
  invitationMessage: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  respondedAt?: string;
  expiresAt: string;
  createdAt: string;
}

interface TeamInvitation {
  id: number;
  invitedUsername: string;
  invitedUserEmail: string;
  teamName: string;
  teamId: string;
  labName: string;
  labId: string;
  invitedByUsername: string;
  invitedRole: string;
  invitationMessage: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  respondedAt?: string;
  expiresAt: string;
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

const MembershipManagementPage: React.FC = () => {
  const { username, role, token } = useAuth();
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  
  // Leave lab/team states
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<'lab' | 'team'>('lab');
  const [selectedLabToLeave, setSelectedLabToLeave] = useState<Lab | null>(null);
  const [selectedTeamToLeave, setSelectedTeamToLeave] = useState<Team | null>(null);
  const [newPiUsername, setNewPiUsername] = useState('');
  const [newLeaderUsername, setNewLeaderUsername] = useState('');
  const [availableMembers, setAvailableMembers] = useState<Array<{username: string, email: string}>>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [applicationTabValue, setApplicationTabValue] = useState(0);
  const [invitationTabValue, setInvitationTabValue] = useState(0);
  const [membershipTabValue, setMembershipTabValue] = useState(0);
  const [labRequests, setLabRequests] = useState<LabMembershipRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamMembershipRequest[]>([]);
  const [labInvitations, setLabInvitations] = useState<LabInvitation[]>([]);
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [pendingLabApprovals, setPendingLabApprovals] = useState<LabInvitation[]>([]);
  const [pendingTeamApprovals, setPendingTeamApprovals] = useState<TeamInvitation[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userLabs, setUserLabs] = useState<Lab[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<{ username: string; email: string }[]>([]);
  const [availableUsers, setAvailableUsers] = useState<{ username: string; email: string }[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Dialog states
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  
  // Form states
  const [requestForm, setRequestForm] = useState({
    labId: '',
    teamId: '',
    requestedRole: '',
    requestMessage: ''
  });
  
  const [invitationForm, setInvitationForm] = useState({
    invitedUsername: '',
    labId: '',
    teamId: '',
    invitedRole: '',
    invitationMessage: ''
  });
  
  const [reviewForm, setReviewForm] = useState({
    status: 'APPROVED',
    reviewMessage: ''
  });

  // Effect for invitation dialog
  useEffect(() => {
    if (invitationDialogOpen) {
      // Reset form when dialog opens
      setInvitationForm({ invitedUsername: '', labId: '', teamId: '', invitedRole: '', invitationMessage: '' });
      loadData();
      loadAllUsers();
    }
  }, [invitationDialogOpen]);



  // Debug effect for users state changes - removed to prevent infinite re-renders
  
  const [responseForm, setResponseForm] = useState({
    response: 'ACCEPTED'
  });
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

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

  useEffect(() => {
    loadData();
    loadUserProfile();
  }, []);

  // Handle URL parameter for tab selection
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabIndex = parseInt(tabParam);
      if (tabIndex >= 0 && tabIndex <= 4) {
        setTabValue(tabIndex);
      }
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      // Load user's requests
      const [labRequestsRes, teamRequestsRes, labInvitationsRes, teamInvitationsRes] = await Promise.all([
        fetch('/api/auth/lab-membership-requests/my-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/team-membership-requests/my-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/lab-invitations/my-invitations', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/team-invitations/my-invitations', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (labRequestsRes.ok) {
        const data = await labRequestsRes.json();
        setLabRequests(data);
      }
      
      if (teamRequestsRes.ok) {
        const data = await teamRequestsRes.json();
        setTeamRequests(data);
      }
      
      if (labInvitationsRes.ok) {
        const data = await labInvitationsRes.json();
        setLabInvitations(data);
      }
      
      if (teamInvitationsRes.ok) {
        const data = await teamInvitationsRes.json();
        setTeamInvitations(data);
      }

      // Load labs and teams for forms
      const [labsRes, teamsRes, userLabsRes, userTeamsRes] = await Promise.all([
        fetch('/api/auth/labs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/teams', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/my-labs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/my-teams', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      if (labsRes.ok) {
        const data = await labsRes.json();
        setLabs(data);
      } else {
        console.error('Failed to load labs:', labsRes.status, labsRes.statusText);
      }
      
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data);
      } else {
        console.error('Failed to load teams:', teamsRes.status, teamsRes.statusText);
      }
      
      if (userLabsRes.ok) {
        const data = await userLabsRes.json();
        setUserLabs(data);
      } else {
        console.error('Failed to load user labs:', userLabsRes.status, userLabsRes.statusText);
      }
      
      if (userTeamsRes.ok) {
        const data = await userTeamsRes.json();
        setUserTeams(data);
      } else {
        console.error('Failed to load user teams:', userTeamsRes.status, userTeamsRes.statusText);
      }

      // Load pending approvals for PIs and Team Leaders
      if (role === 'Lab PI' || role === 'Super Admin') {
        const pendingLabApprovalsRes = await fetch('/api/auth/lab-invitations/pending-approvals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pendingLabApprovalsRes.ok) {
          const data = await pendingLabApprovalsRes.json();
          setPendingLabApprovals(data);
        }
      }

      if (role === 'Team Leader' || role === 'Super Admin') {
        const pendingTeamApprovalsRes = await fetch('/api/auth/team-invitations/pending-approvals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pendingTeamApprovalsRes.ok) {
          const data = await pendingTeamApprovalsRes.json();
          setPendingTeamApprovals(data);
        }
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      setError('Failed to load data');
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch('/api/auth/public/users/basic');
      if (response.ok) {
        const data = await response.json();
        const mappedUsers = data
          .filter((u: any) => u.username !== username) // Filter out current user
          .map((u: any) => ({ username: u.username, email: u.email }));
        setAvailableUsers(mappedUsers);
      } else {
        console.error('Failed to load all users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading all users:', error);
    }
  };

  const loadUsersNotInLab = async (labId: number) => {
    try {
      const response = await fetch(`/api/auth/public/users/not-in-lab/${labId}`);
      
      if (response.ok) {
        const data = await response.json();
        const mappedUsers = data
          .filter((u: any) => u.username !== username) // Filter out current user
          .map((u: any) => ({ username: u.username, email: u.email }));
        setAvailableUsers(mappedUsers);
      } else {
        console.error('Failed to load users not in lab:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading users not in lab:', error);
    }
  };
  
  const loadLabMembers = async (labId: number) => {
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
        
        // Map lab members with their emails from the public users endpoint
        // Exclude the current user from the list
        const mappedMembers = labData
          .filter((member: any) => member.username !== username) // Exclude current user
          .map((member: any) => {
            const userInfo = usersData.find((user: any) => user.username === member.username);
            return {
              username: member.username,
              email: userInfo ? userInfo.email : member.username + '@test.com'
            };
          });
        
        setAvailableMembers(mappedMembers);
      } else {
        console.error('Failed to load lab members or users:', labResponse.status, usersResponse.status);
      }
    } catch (error) {
      console.error('Error loading lab members:', error);
    }
  };
  
  const loadTeamMembers = async (teamId: number) => {
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
        
        // Map team members with their emails from the public users endpoint
        // Exclude the current user from the list
        const mappedMembers = teamData
          .filter((member: any) => member.username !== username) // Exclude current user
          .map((member: any) => {
            const userInfo = usersData.find((user: any) => user.username === member.username);
            return {
              username: member.username,
              email: userInfo ? userInfo.email : member.username + '@test.com'
            };
          });
        
        setAvailableMembers(mappedMembers);
      } else {
        console.error('Failed to load team members or users:', teamResponse.status, usersResponse.status);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };
  
  const getCurrentUserRoleInLab = async (labId: number) => {
    try {
      const response = await fetch(`/api/auth/labs/${labId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const currentUser = data.find((m: any) => m.username === username);
        if (currentUser) {
          setCurrentUserRole(currentUser.roleInLab);
        }
      }
    } catch (error) {
      console.error('Error getting user role in lab:', error);
    }
  };
  
  const getCurrentUserRoleInTeam = async (teamId: number) => {
    try {
      const response = await fetch(`/api/auth/teams/${teamId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const currentUser = data.find((m: any) => m.username === username);
        if (currentUser) {
          setCurrentUserRole(currentUser.roleInTeam);
        }
      }
    } catch (error) {
      console.error('Error getting user role in team:', error);
    }
  };
  
  const handleLeaveLab = async () => {
    if (!selectedLabToLeave) return;
    
    try {
      const response = await fetch('/api/auth/leave-lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          labId: selectedLabToLeave.id,
          newPiUsername: newPiUsername || null
        })
      });
      
      if (response.ok) {
        setSuccess('Successfully left the lab');
        setLeaveDialogOpen(false);
        setSelectedLabToLeave(null);
        setNewPiUsername('');
        setCurrentUserRole('');
        loadData(); // Refresh data
      } else {
        const errorData = await response.text();
        setError('Failed to leave lab: ' + errorData);
      }
    } catch (error) {
      setError('Error leaving lab: ' + error);
    }
  };
  
  const handleLeaveTeam = async () => {
    if (!selectedTeamToLeave) return;
    
    try {
      const response = await fetch('/api/auth/leave-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: selectedTeamToLeave.id,
          newLeaderUsername: currentUserRole === 'Team Leader' ? (newLeaderUsername || null) : null
        })
      });
      
      if (response.ok) {
        setSuccess('Successfully left the team');
        setLeaveDialogOpen(false);
        setSelectedTeamToLeave(null);
        setNewLeaderUsername('');
        setCurrentUserRole('');
        loadData(); // Refresh data
      } else {
        const errorData = await response.text();
        setError('Failed to leave team: ' + errorData);
      }
    } catch (error) {
      setError('Error leaving team: ' + error);
    }
  };
  
  const openLeaveDialog = (type: 'lab' | 'team', lab?: Lab, team?: Team) => {
    setLeaveType(type);
    if (type === 'lab' && lab) {
      setSelectedLabToLeave(lab);
      setSelectedTeamToLeave(null);
      loadLabMembers(lab.id);
      // Get current user's role in this lab
      getCurrentUserRoleInLab(lab.id);
    } else if (type === 'team' && team) {
      setSelectedTeamToLeave(team);
      setSelectedLabToLeave(null);
      loadTeamMembers(team.id);
      // Get current user's role in this team
      getCurrentUserRoleInTeam(team.id);
    }
    setLeaveDialogOpen(true);
  };

  const handleRequestSubmit = async () => {
    try {
      const endpoint = tabValue === 0 ? '/api/auth/lab-membership-requests' : '/api/auth/team-membership-requests';
      const body = tabValue === 0 
        ? { labId: parseInt(requestForm.labId), requestedRole: requestForm.requestedRole, requestMessage: requestForm.requestMessage }
        : { teamId: parseInt(requestForm.teamId), requestedRole: requestForm.requestedRole, requestMessage: requestForm.requestMessage };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSuccess('Request submitted successfully');
        setRequestDialogOpen(false);
        setRequestForm({ labId: '', teamId: '', requestedRole: '', requestMessage: '' });
        loadData();
      } else {
        const error = await response.text();
        setError(error);
      }
    } catch (error) {
      setError('Failed to submit request');
    }
  };

  const handleInvitationSubmit = async () => {
    try {
      const endpoint = invitationTabValue === 0 ? '/api/auth/lab-invitations' : '/api/auth/team-invitations';
      const body = invitationTabValue === 0 
        ? { invitedUsername: invitationForm.invitedUsername, labId: parseInt(invitationForm.labId), invitedRole: invitationForm.invitedRole, invitationMessage: invitationForm.invitationMessage }
        : { invitedUsername: invitationForm.invitedUsername, teamId: parseInt(invitationForm.teamId), invitedRole: invitationForm.invitedRole, invitationMessage: invitationForm.invitationMessage };



      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSuccess('Invitation sent successfully');
        setInvitationDialogOpen(false);
        setInvitationForm({ invitedUsername: '', labId: '', teamId: '', invitedRole: '', invitationMessage: '' });
        loadData();
      } else {
        const error = await response.text();
        setError(error);
        // Don't reset form on error so user can fix and retry
      }
    } catch (error) {
      setError('Failed to send invitation');
      // Don't reset form on error so user can fix and retry
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const endpoint = tabValue === 0 
        ? `/api/auth/lab-membership-requests/${selectedRequest.id}/review`
        : `/api/auth/team-membership-requests/${selectedRequest.id}/review`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: reviewForm.status,
          reviewMessage: reviewForm.reviewMessage
        })
      });

      if (response.ok) {
        setSuccess('Request reviewed successfully');
        setReviewDialogOpen(false);
        setSelectedRequest(null);
        setReviewForm({ status: 'APPROVED', reviewMessage: '' });
        loadData();
      } else {
        const error = await response.text();
        setError(error);
      }
    } catch (error) {
      setError('Failed to review request');
    }
  };

  const handleResponseSubmit = async () => {
    try {
      const endpoint = invitationTabValue === 0 
        ? `/api/auth/lab-invitations/${selectedInvitation.id}/respond`
        : `/api/auth/team-invitations/${selectedInvitation.id}/respond`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          response: responseForm.response
        })
      });

      if (response.ok) {
        setSuccess('Response submitted successfully');
        setResponseDialogOpen(false);
        setSelectedInvitation(null);
        setResponseForm({ response: 'ACCEPTED' });
        loadData();
      } else {
        const error = await response.text();
        setError(error);
      }
    } catch (error) {
      setError('Failed to submit response');
    }
  };

  const handleApprovalSubmit = async (invitationId: number, status: string, type: 'lab' | 'team') => {
    try {
      const endpoint = type === 'lab' 
        ? `/api/auth/lab-invitations/${invitationId}/approve`
        : `/api/auth/team-invitations/${invitationId}/approve`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: status
        })
      });

      if (response.ok) {
        setSuccess(`Invitation ${status.toLowerCase()} successfully`);
        loadData();
      } else {
        const error = await response.text();
        setError(error);
      }
    } catch (error) {
      setError('Failed to submit approval');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': case 'ACCEPTED': return 'success';
      case 'REJECTED': case 'DECLINED': return 'error';
      case 'EXPIRED': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Membership Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="My Applications" />
        <Tab label="My Invitations" />
        <Tab label="Pending Approvals" />
        <Tab label="My Memberships" />
        <Tab label="Send Invitations" />
      </Tabs>

      {/* My Applications - Lab and Team Requests */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">My Applications</Typography>
            <Button variant="contained" onClick={() => setRequestDialogOpen(true)}>
              Apply to Join Lab/Team
            </Button>
          </Box>
          
          <Tabs value={applicationTabValue} onChange={(_, newValue) => setApplicationTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="Lab Applications" />
            <Tab label="Team Applications" />
          </Tabs>
          
          {/* Lab Applications */}
          {applicationTabValue === 0 && (
            <Grid container spacing={2}>
              {labRequests.map((request) => (
                <Grid item xs={12} md={6} key={request.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{request.labName}</Typography>
                        <Chip label={request.status} color={getStatusColor(request.status) as any} />
                      </Box>
                      <Typography color="textSecondary">Role: {request.requestedRole}</Typography>
                      {request.requestMessage && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Message: {request.requestMessage}
                        </Typography>
                      )}
                      {request.reviewMessage && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Review: {request.reviewMessage}
                        </Typography>
                      )}
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Requested: {formatDate(request.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Team Applications */}
          {applicationTabValue === 1 && (
            <Grid container spacing={2}>
              {teamRequests.map((request) => (
                <Grid item xs={12} md={6} key={request.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{request.teamName}</Typography>
                        <Chip label={request.status} color={getStatusColor(request.status) as any} />
                      </Box>
                      <Typography color="textSecondary">Lab: {request.labName}</Typography>
                      <Typography color="textSecondary">Role: {request.requestedRole}</Typography>
                      {request.requestMessage && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Message: {request.requestMessage}
                        </Typography>
                      )}
                      {request.reviewMessage && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Review: {request.reviewMessage}
                        </Typography>
                      )}
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Requested: {formatDate(request.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
                </Box>
      )}



      {/* My Invitations - Lab and Team Invitations */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>My Invitations</Typography>
          
          <Tabs value={invitationTabValue} onChange={(_, newValue) => setInvitationTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="Lab Invitations" />
            <Tab label="Team Invitations" />
          </Tabs>
          
          {/* Lab Invitations */}
          {invitationTabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Lab Invitations</Typography>
            <Button 
              variant="contained" 
              onClick={() => setInvitationDialogOpen(true)}
              disabled={!username}
              title={!username ? 'Please login to send invitations' : 'Send lab invitation'}
            >
              Invite to Lab
            </Button>
          </Box>
          
          {!username && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Please login to send lab invitations. All lab members can invite others, but invitations require PI approval.
              </Typography>
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {labInvitations.map((invitation) => (
              <Grid item xs={12} md={6} key={invitation.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">{invitation.labName}</Typography>
                      <Chip label={invitation.status} color={getStatusColor(invitation.status) as any} />
                    </Box>
                    <Typography color="textSecondary">Role: {invitation.invitedRole}</Typography>
                    <Typography color="textSecondary">From: {invitation.invitedByUsername}</Typography>
                    {invitation.invitationMessage && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Message: {invitation.invitationMessage}
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Expires: {formatDate(invitation.expiresAt)}
                    </Typography>
                    {invitation.status === 'PENDING' && (
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small" 
                          sx={{ mr: 1 }}
                          onClick={() => {
                            setSelectedInvitation(invitation);
                            setResponseForm({ response: 'ACCEPTED' });
                            setResponseDialogOpen(true);
                          }}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="contained" 
                          color="error" 
                          size="small"
                          onClick={() => {
                            setSelectedInvitation(invitation);
                            setResponseForm({ response: 'DECLINED' });
                            setResponseDialogOpen(true);
                          }}
                        >
                          Decline
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

          {/* Team Invitations */}
          {invitationTabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6">Team Invitations</Typography>
                  {!username && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Please login to send team invitations. All team members can invite others, but invitations require Leader approval.
                    </Typography>
                  )}
                </Box>
                <Button 
                  variant="contained" 
                  onClick={() => setInvitationDialogOpen(true)}
                  disabled={!username}
                  title={!username ? 'Please login to send invitations' : 'Send team invitation'}
                >
                  Invite to Team
                </Button>
              </Box>
          
          <Grid container spacing={2}>
            {teamInvitations.map((invitation) => (
              <Grid item xs={12} md={6} key={invitation.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">{invitation.teamName}</Typography>
                      <Chip label={invitation.status} color={getStatusColor(invitation.status) as any} />
                    </Box>
                    <Typography color="textSecondary">Team: {invitation.teamName}</Typography>
                    <Typography color="textSecondary">Role: {invitation.invitedRole}</Typography>
                    <Typography color="textSecondary">From: {invitation.invitedByUsername}</Typography>
                    {invitation.invitationMessage && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Message: {invitation.invitationMessage}
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Expires: {formatDate(invitation.expiresAt)}
                    </Typography>
                    {invitation.status === 'PENDING' && (
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small" 
                          sx={{ mr: 1 }}
                          onClick={() => {
                            setSelectedInvitation(invitation);
                            setResponseForm({ response: 'ACCEPTED' });
                            setResponseDialogOpen(true);
                          }}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="contained" 
                          color="error" 
                          size="small"
                          onClick={() => {
                            setSelectedInvitation(invitation);
                            setResponseForm({ response: 'DECLINED' });
                            setResponseDialogOpen(true);
                          }}
                        >
                          Decline
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          </Box>
        )}
        </Box>
      )}

      {/* Pending Approvals */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Pending Approvals</Typography>
          
          {/* Lab Approvals */}
          {(role === 'Lab PI' || role === 'Super Admin') && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Lab Invitations Pending Approval</Typography>
              <Grid container spacing={2}>
                {pendingLabApprovals.map((invitation) => (
                  <Grid item xs={12} md={6} key={invitation.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6">{invitation.labName}</Typography>
                          <Chip label={invitation.status} color={getStatusColor(invitation.status) as any} />
                        </Box>
                        <Typography color="textSecondary">Invitee: {invitation.invitedUsername}</Typography>
                        <Typography color="textSecondary">Role: {invitation.invitedRole}</Typography>
                        <Typography color="textSecondary">Invited by: {invitation.invitedByUsername}</Typography>
                        {invitation.invitationMessage && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Message: {invitation.invitationMessage}
                          </Typography>
                        )}
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Expires: {formatDate(invitation.expiresAt)}
                        </Typography>
                        {invitation.status === 'PENDING' && (
                          <Box sx={{ mt: 2 }}>
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small" 
                              sx={{ mr: 1 }}
                              onClick={() => handleApprovalSubmit(invitation.id, 'APPROVED', 'lab')}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="contained" 
                              color="error" 
                              size="small"
                              onClick={() => handleApprovalSubmit(invitation.id, 'REJECTED', 'lab')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {pendingLabApprovals.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info">No lab invitations pending approval.</Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Team Approvals */}
          {(role === 'Team Leader' || role === 'Super Admin') && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Team Invitations Pending Approval</Typography>
              <Grid container spacing={2}>
                {pendingTeamApprovals.map((invitation) => (
                  <Grid item xs={12} md={6} key={invitation.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6">{invitation.teamName}</Typography>
                          <Chip label={invitation.status} color={getStatusColor(invitation.status) as any} />
                        </Box>
                        <Typography color="textSecondary">Invitee: {invitation.invitedUsername}</Typography>
                        <Typography color="textSecondary">Role: {invitation.invitedRole}</Typography>
                        <Typography color="textSecondary">Invited by: {invitation.invitedByUsername}</Typography>
                        {invitation.invitationMessage && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Message: {invitation.invitationMessage}
                          </Typography>
                        )}
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Expires: {formatDate(invitation.expiresAt)}
                        </Typography>
                        {invitation.status === 'PENDING' && (
                          <Box sx={{ mt: 2 }}>
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small" 
                              sx={{ mr: 1 }}
                              onClick={() => handleApprovalSubmit(invitation.id, 'APPROVED', 'team')}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="contained" 
                              color="error" 
                              size="small"
                              onClick={() => handleApprovalSubmit(invitation.id, 'REJECTED', 'team')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {pendingTeamApprovals.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info">No team invitations pending approval.</Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {role !== 'Lab PI' && role !== 'Team Leader' && role !== 'Super Admin' && (
            <Alert severity="info">
              You don't have permission to approve invitations. Only Lab PIs, Team Leaders, and Super Admins can approve invitations.
            </Alert>
          )}
        </Box>
      )}

      {/* My Memberships - Lab and Team Memberships */}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>My Memberships</Typography>
          
          <Tabs value={membershipTabValue} onChange={(_, newValue) => setMembershipTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="Lab Memberships" />
            <Tab label="Team Memberships" />
          </Tabs>
          
          {/* Lab Memberships */}
          {membershipTabValue === 0 && (
            <Grid container spacing={2}>
              {userLabs.map((lab) => (
                <Grid item xs={12} md={6} key={lab.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{lab.labName}</Typography>
                        <Chip label="Active Member" color="success" />
                      </Box>
                      <Typography color="textSecondary">Lab ID: {lab.labId}</Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => openLeaveDialog('lab', lab)}
                        >
                          Leave Lab
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {userLabs.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">You are not a member of any labs.</Alert>
                </Grid>
              )}
            </Grid>
          )}
          
          {/* Team Memberships */}
          {membershipTabValue === 1 && (
            <Grid container spacing={2}>
              {userTeams.map((team) => (
                <Grid item xs={12} md={6} key={team.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">{team.teamName}</Typography>
                        <Chip label="Active Member" color="success" />
                      </Box>
                      <Typography color="textSecondary">Team ID: {team.teamId}</Typography>
                      <Typography color="textSecondary">Description: {team.teamDescription || 'No description'}</Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => openLeaveDialog('team', undefined, team)}
                        >
                          Leave Team
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {userTeams.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">You are not a member of any teams.</Alert>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      )}

      {/* Send Invitations */}
      {tabValue === 4 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Send Invitations</Typography>
          
          <Tabs value={invitationTabValue} onChange={(_, newValue) => setInvitationTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="Lab Invitations" />
            <Tab label="Team Invitations" />
          </Tabs>
          
          {/* Lab Invitations */}
          {invitationTabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6">Lab Invitations</Typography>
                  {!username ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Please login to send lab invitations. Only Lab PIs can send invitations.
                    </Typography>
                  ) : !userProfile?.labMemberships?.some((membership: any) => membership.roleInLab === 'Lab PI') ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Only Lab PIs can send lab invitations. You are not a Lab PI in any lab.
                    </Typography>
                  ) : null}
                </Box>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setInvitationTabValue(0); // Set to lab invitation
                    setInvitationDialogOpen(true);
                  }}
                  disabled={!username || !userProfile?.labMemberships?.some((membership: any) => membership.roleInLab === 'Lab PI')}
                  title={!username ? 'Please login to send invitations' : 
                         !userProfile?.labMemberships?.some((membership: any) => membership.roleInLab === 'Lab PI') ? 'Only Lab PIs can send lab invitations' : 
                         'Send lab invitation'}
                >
                  Invite to Lab
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Team Invitations */}
          {invitationTabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6">Team Invitations</Typography>
                  {!username && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Please login to send team invitations. All team members can invite others, but invitations require Leader approval.
                    </Typography>
                  )}
                </Box>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setInvitationTabValue(1); // Set to team invitation
                    setInvitationDialogOpen(true);
                  }}
                  disabled={!username}
                  title={!username ? 'Please login to send invitations' : 'Send team invitation'}
                >
                  Invite to Team
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {applicationTabValue === 0 ? 'Apply to Join Lab' : 'Apply to Join Team'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{applicationTabValue === 0 ? 'Lab' : 'Team'}</InputLabel>
            <Select
              value={applicationTabValue === 0 ? requestForm.labId : requestForm.teamId}
              onChange={(e) => setRequestForm({
                ...requestForm,
                [applicationTabValue === 0 ? 'labId' : 'teamId']: e.target.value
              })}
            >
              {(applicationTabValue === 0 ? labs : teams).map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {applicationTabValue === 0 ? item.labName : item.teamName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Requested Role"
            value={requestForm.requestedRole}
            onChange={(e) => setRequestForm({ ...requestForm, requestedRole: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Message (Optional)"
            multiline
            rows={3}
            value={requestForm.requestMessage}
            onChange={(e) => setRequestForm({ ...requestForm, requestMessage: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRequestSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Invitation Dialog */}
      <Dialog open={invitationDialogOpen} onClose={() => {
        setInvitationDialogOpen(false);
        setInvitationForm({ invitedUsername: '', labId: '', teamId: '', invitedRole: '', invitationMessage: '' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {invitationTabValue === 0 ? 'Invite to Lab' : 'Invite to Team'}
          <Button 
            size="small" 
            onClick={() => {
              console.log('Manual refresh clicked');
              loadData();
            }}
            sx={{ ml: 2 }}
          >
            Refresh Data
          </Button>

        </DialogTitle>
        <DialogContent>
          {/* Debug info - removed to prevent infinite re-renders */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{invitationTabValue === 0 ? 'Lab' : 'Team'}</InputLabel>
            <Select
              value={invitationTabValue === 0 ? invitationForm.labId : invitationForm.teamId}
              onChange={(e) => {
                const selectedId = e.target.value;
                
                setInvitationForm({
                  ...invitationForm,
                  [invitationTabValue === 0 ? 'labId' : 'teamId']: selectedId,
                  invitedUsername: '' // Reset user selection when lab/team changes
                });
                
                // If lab is selected, load users not in that lab
                if (invitationTabValue === 0 && selectedId) {
                  loadUsersNotInLab(parseInt(selectedId));
                } else if (invitationTabValue === 0 && !selectedId) {
                  // If no lab is selected, load all users
                  loadAllUsers();
                }
              }}
            >
              {(invitationTabValue === 0 ? userLabs : userTeams).length > 0 ? (
                (invitationTabValue === 0 ? userLabs : userTeams).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {invitationTabValue === 0 ? item.labName : item.teamName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Loading {invitationTabValue === 0 ? 'labs' : 'teams'}...</MenuItem>
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>User</InputLabel>
            <Select
              value={invitationForm.invitedUsername}
              onChange={(e) => setInvitationForm({ ...invitationForm, invitedUsername: e.target.value })}
              disabled={false}
            >
              {availableUsers.length > 0 ? (
                availableUsers.map((user) => (
                  <MenuItem key={user.username} value={user.username}>
                    {user.username} ({user.email})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Loading users...</MenuItem>
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Invited Role
            </Typography>
            <select
              value={invitationForm.invitedRole}
              onChange={(e) => {
                setInvitationForm({ ...invitationForm, invitedRole: e.target.value });
              }}
              style={{
                width: '100%',
                padding: '16.5px 14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: 'white',
                marginTop: '8px'
              }}
            >
              <option value="">Select a role</option>
              {invitationTabValue === 0 ? (
                // Lab roles
                <>
                  <option value="Lab PI">Lab PI</option>
                  <option value="PhD Student">PhD Student</option>
                  <option value="Master Student">Master Student</option>
                  <option value="Research Assistant">Research Assistant</option>
                  <option value="Postdoctoral Researcher">Postdoctoral Researcher</option>
                  <option value="Visiting Scholar">Visiting Scholar</option>
                </>
              ) : (
                // Team roles
                <>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Team Member">Team Member</option>
                  <option value="Senior Developer">Senior Developer</option>
                  <option value="Developer">Developer</option>
                  <option value="Analyst">Analyst</option>
                </>
              )}
            </select>
          </FormControl>

          <TextField
            fullWidth
            label="Message (Optional)"
            multiline
            rows={3}
            value={invitationForm.invitationMessage}
            onChange={(e) => setInvitationForm({ ...invitationForm, invitationMessage: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setInvitationDialogOpen(false);
            setInvitationForm({ invitedUsername: '', labId: '', teamId: '', invitedRole: '', invitationMessage: '' });
          }}>Cancel</Button>
          <Button onClick={handleInvitationSubmit} variant="contained">Send Invitation</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Request</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={reviewForm.status}
              onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
            >
              <MenuItem value="APPROVED">Approve</MenuItem>
              <MenuItem value="REJECTED">Reject</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Review Message (Optional)"
            multiline
            rows={3}
            value={reviewForm.reviewMessage}
            onChange={(e) => setReviewForm({ ...reviewForm, reviewMessage: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReviewSubmit} variant="contained">Submit Review</Button>
        </DialogActions>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onClose={() => setResponseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Respond to Invitation</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Response</InputLabel>
            <Select
              value={responseForm.response}
              onChange={(e) => setResponseForm({ ...responseForm, response: e.target.value })}
            >
              <MenuItem value="ACCEPTED">Accept</MenuItem>
              <MenuItem value="DECLINED">Decline</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResponseSubmit} variant="contained">Submit Response</Button>
        </DialogActions>
      </Dialog>

      {/* Leave Lab/Team Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => {
        setLeaveDialogOpen(false);
        setCurrentUserRole('');
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          Leave {leaveType === 'lab' ? 'Lab' : 'Team'} (Your role: {currentUserRole || 'Loading...'})
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to leave {leaveType === 'lab' ? selectedLabToLeave?.labName : selectedTeamToLeave?.teamName}?
          </Typography>
          
          {leaveType === 'lab' && selectedLabToLeave && (
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                If you are a Lab PI, you must assign a new PI before leaving.
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>New Lab PI (Required if you are PI)</InputLabel>
                <Select
                  value={newPiUsername}
                  onChange={(e) => setNewPiUsername(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select a new PI</em>
                  </MenuItem>
                  {availableMembers.map((member) => (
                    <MenuItem key={member.username} value={member.username}>
                      {member.username} ({member.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          
          {leaveType === 'team' && selectedTeamToLeave && (
            <Box>
              {currentUserRole === 'Team Leader' ? (
                <>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    As a Team Leader, you must assign a new leader before leaving.
                  </Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>New Team Leader (Required)</InputLabel>
                    <Select
                      value={newLeaderUsername}
                      onChange={(e) => setNewLeaderUsername(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Select a new leader</em>
                      </MenuItem>
                      {availableMembers.map((member) => (
                        <MenuItem key={member.username} value={member.username}>
                          {member.username} ({member.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  As a Team Member, you can leave the team directly.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setLeaveDialogOpen(false);
            setCurrentUserRole('');
          }}>Cancel</Button>
          <Button 
            onClick={leaveType === 'lab' ? handleLeaveLab : handleLeaveTeam} 
            variant="contained" 
            color="error"
            disabled={leaveType === 'team' && currentUserRole === 'Team Leader' && !newLeaderUsername}
          >
            Leave {leaveType === 'lab' ? 'Lab' : 'Team'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembershipManagementPage;
