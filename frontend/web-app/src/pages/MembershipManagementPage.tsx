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
  const [tabValue, setTabValue] = useState(0);
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

  // Debug effect for invitation dialog
  useEffect(() => {
    if (invitationDialogOpen) {
      console.log('Invitation dialog opened');
      console.log('Current users:', users);
      console.log('Current labs:', labs);
      console.log('Current teams:', teams);
    }
  }, [invitationDialogOpen, users, labs, teams]);
  
  const [responseForm, setResponseForm] = useState({
    response: 'ACCEPTED'
  });
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

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
      const [labsRes, teamsRes, userLabsRes, userTeamsRes, usersRes] = await Promise.all([
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
        }),
        fetch('/api/auth/public/users/basic')
      ]);

      if (labsRes.ok) {
        const data = await labsRes.json();
        console.log('Labs loaded:', data);
        setLabs(data);
      } else {
        console.error('Failed to load labs:', labsRes.status, labsRes.statusText);
      }
      
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        console.log('Teams loaded:', data);
        setTeams(data);
      } else {
        console.error('Failed to load teams:', teamsRes.status, teamsRes.statusText);
      }
      
      if (userLabsRes.ok) {
        const data = await userLabsRes.json();
        console.log('User labs loaded:', data);
        setUserLabs(data);
      } else {
        console.error('Failed to load user labs:', userLabsRes.status, userLabsRes.statusText);
      }
      
      if (userTeamsRes.ok) {
        const data = await userTeamsRes.json();
        console.log('User teams loaded:', data);
        setUserTeams(data);
      } else {
        console.error('Failed to load user teams:', userTeamsRes.status, userTeamsRes.statusText);
      }
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        console.log('Users loaded:', data);
        setUsers(data.map((u: any) => ({ username: u.username, email: u.email })));
      } else {
        console.error('Failed to load users:', usersRes.status, usersRes.statusText);
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
      setError('Failed to load data');
    }
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
      const endpoint = tabValue === 2 ? '/api/auth/lab-invitations' : '/api/auth/team-invitations';
      const body = tabValue === 2 
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
      }
    } catch (error) {
      setError('Failed to send invitation');
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
      const endpoint = tabValue === 2 
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
        <Tab label="Lab Requests" />
        <Tab label="Team Requests" />
        <Tab label="Lab Invitations" />
        <Tab label="Team Invitations" />
        <Tab label="Pending Approvals" />
      </Tabs>

      {/* Lab Membership Requests */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">My Lab Membership Requests</Typography>
            <Button variant="contained" onClick={() => setRequestDialogOpen(true)}>
              Apply to Join Lab
            </Button>
          </Box>
          
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
        </Box>
      )}

      {/* Team Membership Requests */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">My Team Membership Requests</Typography>
            <Button variant="contained" onClick={() => setRequestDialogOpen(true)}>
              Apply to Join Team
            </Button>
          </Box>
          
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
        </Box>
      )}

      {/* Lab Invitations */}
      {tabValue === 2 && (
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
      {tabValue === 3 && (
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
                    <Typography color="textSecondary">Lab: {invitation.labName}</Typography>
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

      {/* Pending Approvals */}
      {tabValue === 4 && (
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

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {tabValue === 0 ? 'Apply to Join Lab' : 'Apply to Join Team'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{tabValue === 0 ? 'Lab' : 'Team'}</InputLabel>
            <Select
              value={tabValue === 0 ? requestForm.labId : requestForm.teamId}
              onChange={(e) => setRequestForm({
                ...requestForm,
                [tabValue === 0 ? 'labId' : 'teamId']: e.target.value
              })}
            >
              {(tabValue === 0 ? labs : teams).map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.labName || item.teamName}
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
      <Dialog open={invitationDialogOpen} onClose={() => setInvitationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {tabValue === 2 ? 'Invite to Lab' : 'Invite to Team'}
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
          {/* Debug info */}
          {console.log('Users in dialog:', users)}
          {console.log('Labs in dialog:', labs)}
          {console.log('Teams in dialog:', teams)}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>User</InputLabel>
            <Select
              value={invitationForm.invitedUsername}
              onChange={(e) => setInvitationForm({ ...invitationForm, invitedUsername: e.target.value })}
            >
              {users.length > 0 ? (
                users.map((user) => (
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
            <InputLabel>{tabValue === 2 ? 'Lab' : 'Team'}</InputLabel>
            <Select
              value={tabValue === 2 ? invitationForm.labId : invitationForm.teamId}
              onChange={(e) => setInvitationForm({
                ...invitationForm,
                [tabValue === 2 ? 'labId' : 'teamId']: e.target.value
              })}
            >
              {(tabValue === 2 ? labs : teams).length > 0 ? (
                (tabValue === 2 ? labs : teams).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.labName || item.teamName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Loading {tabValue === 2 ? 'labs' : 'teams'}...</MenuItem>
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Invited Role</InputLabel>
            <Select
              value={invitationForm.invitedRole}
              onChange={(e) => setInvitationForm({ ...invitationForm, invitedRole: e.target.value })}
            >
              {tabValue === 2 ? (
                // Lab roles
                <>
                  <MenuItem value="Lab PI">Lab PI</MenuItem>
                  <MenuItem value="Professor">Professor</MenuItem>
                  <MenuItem value="Postdoctoral Researcher">Postdoctoral Researcher</MenuItem>
                  <MenuItem value="PhD Student">PhD Student</MenuItem>
                  <MenuItem value="Master Student">Master Student</MenuItem>
                  <MenuItem value="Lab Member">Lab Member</MenuItem>
                  <MenuItem value="Research Assistant">Research Assistant</MenuItem>
                </>
              ) : (
                // Team roles
                <>
                  <MenuItem value="Team Leader">Team Leader</MenuItem>
                  <MenuItem value="Team Member">Team Member</MenuItem>
                  <MenuItem value="Senior Developer">Senior Developer</MenuItem>
                  <MenuItem value="Developer">Developer</MenuItem>
                  <MenuItem value="Analyst">Analyst</MenuItem>
                </>
              )}
            </Select>
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
          <Button onClick={() => setInvitationDialogOpen(false)}>Cancel</Button>
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
    </Box>
  );
};

export default MembershipManagementPage;
