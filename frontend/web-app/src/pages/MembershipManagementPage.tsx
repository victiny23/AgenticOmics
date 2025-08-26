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
  status: 'PENDING_APPROVAL' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
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
  status: 'PENDING_APPROVAL' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  respondedAt?: string;
  expiresAt: string;
  createdAt: string;
}

interface Lab {
  id: number;
  labId: string;
  labName: string;
  labDescription?: string;
  description?: string;
  institution?: string;
  department?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  memberCount?: number;
  teamCount?: number;
  piUsername?: string;
}

interface Team {
  id: number;
  teamId: string;
  teamName: string;
  teamDescription?: string;
  description?: string;
  labId?: string;
  labName?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  memberCount?: number;
  leaderUsername?: string;
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
  
  // Member management data
  const [labMembers, setLabMembers] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [managedLabs, setManagedLabs] = useState<Lab[]>([]);
  const [managedTeams, setManagedTeams] = useState<Team[]>([]);
  
  // Remove member functionality
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [removeMemberType, setRemoveMemberType] = useState<'lab' | 'team'>('lab');
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<any>(null);
  const [removeMemberForm, setRemoveMemberForm] = useState({
    username: '',
    labName: '',
    teamName: ''
  });
  
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

  // Unified Management states (for PI and Super Admin)
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showDeactivated, setShowDeactivated] = useState(true); // Show all users by default
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: any | null;
    action: 'activate' | 'deactivate' | null;
  }>({ open: false, user: null, action: null });
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Deletion confirmation states
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = useState(false);
  const [deleteConfirmationTarget, setDeleteConfirmationTarget] = useState<{ type: 'lab' | 'team', id: number, name: string } | null>(null);

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

  // Load managed labs and teams when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      loadManagedLabsAndTeams();
    }
  }, [userProfile]);

  // Handle URL parameter for tab selection
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabIndex = parseInt(tabParam);
      // Super Admin has more tabs (0-8), others have fewer tabs (0-5)
      const maxTabs = role === 'Super Admin' ? 8 : 5;
      if (tabIndex >= 0 && tabIndex <= maxTabs) {
        setTabValue(tabIndex);
      }
    }
  }, [searchParams, role]);

  // Load unified management data when tab changes to unified management tabs
  useEffect(() => {
    if (role === 'Super Admin' && (tabValue === 6 || tabValue === 7)) {
      // Load data for Super Admin unified management tabs (Lab Overview, Team Overview)
      if (tabValue === 6) { // Lab Overview tab
        loadAllLabsForSuperAdmin();
        // Clear any existing member data to show fresh data
        setLabMembers([]);
        setTeamMembers([]);
      } else if (tabValue === 7) { // Team Overview tab
        loadAllTeamsForSuperAdmin();
        // Clear any existing member data to show fresh data
        setLabMembers([]);
        setTeamMembers([]);
      }
    }
  }, [tabValue, role]);

  // Load data for Manage Members tab (for both PI/Team Leader and Super Admin)
  useEffect(() => {
    if (tabValue === 5) {
      // Load managed labs and teams for both roles
      loadManagedLabsAndTeams();
      
      // Load users for Super Admin's Organization Users tab
      if (role === 'Super Admin' && membershipTabValue === 2) {
        loadAllUsersForManagement();
      }
    }
  }, [tabValue, membershipTabValue, role]);

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
        console.log('🔍 Loaded lab invitations for user:', username, data);
        setLabInvitations(data);
      }
      
      if (teamInvitationsRes.ok) {
        const data = await teamInvitationsRes.json();
        console.log('🔍 Loaded team invitations for user:', username, data);
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
          console.log('🔍 Loaded pending lab approvals for PI:', username, data);
          setPendingLabApprovals(data);
        } else {
          console.log('🔍 Failed to load pending lab approvals:', pendingLabApprovalsRes.status, pendingLabApprovalsRes.statusText);
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

  // Load members for a specific lab (for member management)
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
        
        // Map lab members with their emails and include lab info
        const mappedMembers = labData
          .filter((member: any) => member.username !== username) // Exclude current user
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
      } else {
        console.error('Failed to load lab members or users:', labResponse.status, usersResponse.status);
      }
    } catch (error) {
      console.error('Error loading lab members:', error);
    }
  };

  // Load members for a specific team (for member management)
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
        
        // Map team members with their emails and include team info
        const mappedMembers = teamData
          .filter((member: any) => member.username !== username) // Exclude current user
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
      } else {
        console.error('Failed to load team members or users:', teamResponse.status, usersResponse.status);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  // Load managed labs and teams (labs where user is PI, teams where user is leader)
  const loadManagedLabsAndTeams = async () => {
    if (!token) return;
    
    try {
      // Load labs where user is PI
      const managedLabsRes = await fetch('/api/auth/labs', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (managedLabsRes.ok) {
        const allLabs = await managedLabsRes.json();
        // Filter labs where user is PI (this would need backend support)
        setManagedLabs(allLabs.filter((lab: Lab) => 
          userProfile?.labMemberships?.some((membership: any) => 
            membership.labId === lab.id && membership.roleInLab === 'Lab PI'
          )
        ));
      }
      
      // Load teams where user is leader
      const managedTeamsRes = await fetch('/api/auth/teams', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (managedTeamsRes.ok) {
        const allTeams = await managedTeamsRes.json();
        // Filter teams where user is leader (this would need backend support)
        setManagedTeams(allTeams.filter((team: Team) => 
          userProfile?.teamMemberships?.some((membership: any) => 
            membership.teamId === team.id && membership.roleInTeam === 'Team Leader'
          )
        ));
      }
    } catch (error) {
      console.error('Error loading managed labs and teams:', error);
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

  // Unified Management functions (for PI and Super Admin)
  const loadAllUsersForManagement = async () => {
    if (!token) return;
    
    try {
      // Use different endpoints based on user role
      const endpoint = role === 'Super Admin' 
        ? '/api/auth/admin/system/users' 
        : '/api/auth/admin/users';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        if (Array.isArray(data)) {
          // Super Admin endpoint returns array directly
          setAllUsers(data);
        } else {
          // Lab PI endpoint returns {users: [...]}
          setAllUsers(data.users || []);
        }
      } else {
        console.error('Failed to load users:', response.status, response.statusText);
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    }
  };

  const handleUserAction = async (user: any, action: 'activate' | 'deactivate') => {
    if (!token) return;
    
    try {
      // Use different endpoints based on user role
      const endpoint = role === 'Super Admin' 
        ? `/api/auth/admin/system/users/${user.id}/${action}`
        : `/api/auth/admin/users/${user.id}/${action}`;
      
      const response = await fetch(endpoint, {
        method: 'POST', // Both Super Admin and Lab PI endpoints use POST
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setSuccess(`User ${user.username} ${action}d successfully`);
        loadAllUsersForManagement();
      } else {
        const errorText = await response.text();
        console.error(`Failed to ${action} user:`, response.status, errorText);
        setError(`Failed to ${action} user: ${errorText}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      setError(`Failed to ${action} user`);
    }
  };

  const handleDeleteLab = async (labId: number, labName: string) => {
    setDeleteConfirmationTarget({ type: 'lab', id: labId, name: labName });
    setDeleteConfirmationDialogOpen(true);
  };

  const confirmDeleteLab = async () => {
    if (!token || !deleteConfirmationTarget) return;
    
    try {
      const response = await fetch(`/api/auth/admin/system/labs/${deleteConfirmationTarget.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || ''
        }
      });
      
      if (response.ok) {
        setSuccess('Lab deleted successfully');
        setDeleteConfirmationDialogOpen(false);
        setDeleteConfirmationTarget(null);
        loadData(); // Refresh the data
      } else {
        const errorText = await response.text();
        console.error('Failed to delete lab:', response.status, errorText);
        setError(`Failed to delete lab: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting lab:', error);
      setError('Failed to delete lab');
    }
  };

  const handleDeleteTeam = async (teamId: number, teamName: string) => {
    setDeleteConfirmationTarget({ type: 'team', id: teamId, name: teamName });
    setDeleteConfirmationDialogOpen(true);
  };

  const confirmDeleteTeam = async () => {
    if (!token || !deleteConfirmationTarget) return;
    
    try {
      const response = await fetch(`/api/auth/admin/system/teams/${deleteConfirmationTarget.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || ''
        }
      });
      
      if (response.ok) {
        setSuccess('Team deleted successfully');
        setDeleteConfirmationDialogOpen(false);
        setDeleteConfirmationTarget(null);
        loadData(); // Refresh the data
      } else {
        const errorText = await response.text();
        console.error('Failed to delete team:', response.status, errorText);
        setError(`Failed to delete team: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team');
    }
  };

  // Super Admin functions for loading all labs and teams
  const loadAllLabsForSuperAdmin = async () => {
    if (!token) return;
    
    try {
      // Try the regular labs endpoint first
      const response = await fetch('/api/auth/labs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLabs(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to load labs for Super Admin:', response.status, response.statusText, errorText);
        setError('Failed to load labs');
      }
    } catch (error) {
      console.error('Error loading labs for Super Admin:', error);
      setError('Failed to load labs');
    }
  };

  const loadAllTeamsForSuperAdmin = async () => {
    if (!token) return;
    
    try {
      // Try the regular teams endpoint first
      const response = await fetch('/api/auth/teams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Team data received:', data);
        setTeams(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to load teams for Super Admin:', response.status, response.statusText, errorText);
        setError('Failed to load teams');
      }
    } catch (error) {
      console.error('Error loading teams for Super Admin:', error);
      setError('Failed to load teams');
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
        
        loadData();
      } else {
        const errorText = await response.text();
        setError(`Failed to remove member: ${errorText}`);
      }
    } catch (error) {
      setError('Failed to remove member');
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

      console.log('🔍 Sending invitation with body:', body);
      console.log('🔍 Endpoint:', endpoint);
      console.log('🔍 Lab ID being sent:', invitationForm.labId);
      console.log('🔍 Available labs:', labs);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Invitation created successfully:', result);
        setSuccess('Invitation sent successfully');
        setInvitationDialogOpen(false);
        setInvitationForm({ invitedUsername: '', labId: '', teamId: '', invitedRole: '', invitationMessage: '' });
        loadData();
      } else {
        const error = await response.text();
        console.log('🔍 Error response:', error);
        setError(error);
        // Don't reset form on error so user can fix and retry
      }
    } catch (error) {
      console.log('🔍 Exception occurred:', error);
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
        const errorText = await response.text();
        setError(`Failed to submit response: ${errorText}`);
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
      case 'PENDING_APPROVAL': return 'info';
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

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getExpirationText = (dateString: string) => {
    const expirationDate = new Date(dateString);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} days ago (${expirationDate.toLocaleString()})`;
    } else if (diffDays === 0) {
      if (diffHours <= 0) {
        if (diffMinutes <= 0) {
          return `Expired (${expirationDate.toLocaleString()})`;
        } else {
          return `Expires in ${diffMinutes} minutes (${expirationDate.toLocaleString()})`;
        }
      } else {
        return `Expires in ${diffHours} hours (${expirationDate.toLocaleString()})`;
      }
    } else if (diffDays === 1) {
      return `Expires tomorrow (${expirationDate.toLocaleString()})`;
    } else {
      return `Expires in ${diffDays} days (${expirationDate.toLocaleString()})`;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        <Tab label="Manage Members" />
        <Tab label="Lab Overview" style={{ display: role === 'Super Admin' ? 'block' : 'none' }} />
        <Tab label="Team Overview" style={{ display: role === 'Super Admin' ? 'block' : 'none' }} />
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
                        Requested: {formatDateTime(request.createdAt)}
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
                        Requested: {formatDateTime(request.createdAt)}
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
          <Typography variant="h6" sx={{ mb: 2 }}>Lab Invitations</Typography>
          
          {!username && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Please login to view your lab invitations.
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
                    <Typography color="textSecondary">Created: {formatDateTime(invitation.createdAt)}</Typography>
                    {invitation.invitationMessage && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Message: {invitation.invitationMessage}
                      </Typography>
                    )}
                    <Typography 
                      variant="caption" 
                      display="block" 
                      sx={{ 
                        mt: 1,
                        color: isExpired(invitation.expiresAt) ? 'error.main' : 'text.secondary',
                        fontWeight: isExpired(invitation.expiresAt) ? 'bold' : 'normal'
                      }}
                    >
                      {getExpirationText(invitation.expiresAt)}
                    </Typography>
                    {invitation.status === 'PENDING_APPROVAL' && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        This invitation is waiting for PI approval before you can respond.
                      </Alert>
                    )}
                    {invitation.status === 'PENDING' && !isExpired(invitation.expiresAt) && (
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
                    {invitation.status === 'PENDING' && isExpired(invitation.expiresAt) && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        This invitation has expired and can no longer be responded to.
                      </Alert>
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
              <Typography variant="h6" sx={{ mb: 2 }}>Team Invitations</Typography>
              
              {!username && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Please login to view your team invitations.
                  </Typography>
                </Alert>
              )}
          
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
                    <Typography color="textSecondary">Created: {formatDateTime(invitation.createdAt)}</Typography>
                    {invitation.invitationMessage && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Message: {invitation.invitationMessage}
                      </Typography>
                    )}
                    <Typography 
                      variant="caption" 
                      display="block" 
                      sx={{ 
                        mt: 1,
                        color: isExpired(invitation.expiresAt) ? 'error.main' : 'text.secondary',
                        fontWeight: isExpired(invitation.expiresAt) ? 'bold' : 'normal'
                      }}
                    >
                      {getExpirationText(invitation.expiresAt)}
                    </Typography>
                    {invitation.status === 'PENDING_APPROVAL' && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        This invitation is waiting for Team Leader approval before you can respond.
                      </Alert>
                    )}
                    {invitation.status === 'PENDING' && !isExpired(invitation.expiresAt) && (
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
                    {invitation.status === 'PENDING' && isExpired(invitation.expiresAt) && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        This invitation has expired and can no longer be responded to.
                      </Alert>
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
          {(role === 'Super Admin' || userProfile?.labMemberships?.some((membership: any) => membership.roleInLab === 'Lab PI' && membership.isActive)) && (
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
                        <Typography color="textSecondary">Created: {formatDateTime(invitation.createdAt)}</Typography>
                        {invitation.invitationMessage && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Message: {invitation.invitationMessage}
                          </Typography>
                        )}
                        <Typography 
                          variant="caption" 
                          display="block" 
                          sx={{ 
                            mt: 1,
                            color: isExpired(invitation.expiresAt) ? 'error.main' : 'text.secondary',
                            fontWeight: isExpired(invitation.expiresAt) ? 'bold' : 'normal'
                          }}
                        >
                          {getExpirationText(invitation.expiresAt)}
                        </Typography>
                        {(invitation.status === 'PENDING' || invitation.status === 'PENDING_APPROVAL') && (
                          <Box sx={{ mt: 2 }}>
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small" 
                              sx={{ mr: 1 }}
                              onClick={() => handleApprovalSubmit(invitation.id, 'APPROVED', 'lab')}
                            >
                              {invitation.status === 'PENDING_APPROVAL' ? 'Approve for Invitee' : 'Force Accept'}
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
          {(role === 'Super Admin' || userProfile?.teamMemberships?.some((membership: any) => membership.roleInTeam === 'Team Leader' && membership.isActive)) && (
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
                        <Typography color="textSecondary">Created: {formatDateTime(invitation.createdAt)}</Typography>
                        {invitation.invitationMessage && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Message: {invitation.invitationMessage}
                          </Typography>
                        )}
                        <Typography 
                          variant="caption" 
                          display="block" 
                          sx={{ 
                            mt: 1,
                            color: isExpired(invitation.expiresAt) ? 'error.main' : 'text.secondary',
                            fontWeight: isExpired(invitation.expiresAt) ? 'bold' : 'normal'
                          }}
                        >
                          {getExpirationText(invitation.expiresAt)}
                        </Typography>
                        {(invitation.status === 'PENDING' || invitation.status === 'PENDING_APPROVAL') && (
                          <Box sx={{ mt: 2 }}>
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small" 
                              sx={{ mr: 1 }}
                              onClick={() => handleApprovalSubmit(invitation.id, 'APPROVED', 'team')}
                            >
                              {invitation.status === 'PENDING_APPROVAL' ? 'Approve for Invitee' : 'Force Accept'}
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

          {role !== 'Super Admin' && 
           !userProfile?.labMemberships?.some((membership: any) => membership.roleInLab === 'Lab PI' && membership.isActive) &&
           !userProfile?.teamMemberships?.some((membership: any) => membership.roleInTeam === 'Team Leader' && membership.isActive) && (
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
                      Please login to send lab invitations. All lab members can send invitations, but invitations require PI approval.
                    </Typography>
                  ) : !userProfile?.labMemberships?.some((membership: any) => membership.isActive) ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      You need to be a member of at least one lab to send lab invitations.
                    </Typography>
                  ) : null}
                </Box>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setInvitationTabValue(0); // Set to lab invitation
                    setInvitationDialogOpen(true);
                  }}
                  disabled={!username || !userProfile?.labMemberships?.some((membership: any) => membership.isActive)}
                  title={!username ? 'Please login to send invitations' : 
                         !userProfile?.labMemberships?.some((membership: any) => membership.isActive) ? 'You need to be a lab member to send invitations' : 
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
                  {!username ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Please login to send team invitations. All team members can invite others, but invitations require Leader approval.
                    </Typography>
                  ) : !userProfile?.teamMemberships?.some((membership: any) => membership.isActive) ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      You need to be a member of at least one team to send team invitations.
                    </Typography>
                  ) : null}
                </Box>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setInvitationTabValue(1); // Set to team invitation
                    setInvitationDialogOpen(true);
                  }}
                  disabled={!username || !userProfile?.teamMemberships?.some((membership: any) => membership.isActive)}
                  title={!username ? 'Please login to send invitations' : 
                         !userProfile?.teamMemberships?.some((membership: any) => membership.isActive) ? 'You need to be a team member to send invitations' : 
                         'Send team invitation'}
                >
                  Invite to Team
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Lab Overview (for Super Admin) */}
      {tabValue === 6 && role === 'Super Admin' && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Platform Lab Overview</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Overview of all labs across the platform with detailed information and management capabilities.
          </Typography>
          
          <Card sx={{ mb: 3, p: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6">Platform Summary</Typography>
            <Typography variant="body2">
              Total Labs: {labs.length} | Active Labs: {labs.filter(lab => lab.isActive).length} | 
              Total Lab Members: {labs.reduce((sum, lab) => sum + (lab.memberCount || 0), 0)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
              Debug: labs state length = {labs.length}
            </Typography>
          </Card>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Lab Name</strong></TableCell>
                  <TableCell><strong>PI</strong></TableCell>
                  <TableCell><strong>Members</strong></TableCell>
                  <TableCell><strong>Teams</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {labs.map((lab) => (
                  <TableRow key={lab.id} sx={{
                    backgroundColor: lab.isActive ? 'inherit' : 'rgba(255, 0, 0, 0.05)',
                    borderLeft: lab.isActive ? 'none' : '4px solid #f44336'
                  }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {lab.labName}
                        </Typography>
                        {!lab.isActive && (
                          <Chip label="INACTIVE" size="small" color="error" variant="filled" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={lab.piUsername || 'No PI'} 
                        size="small"
                        color={lab.piUsername ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${lab.memberCount || 0} members`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${lab.teamCount || 0} teams`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={lab.isActive ? '🟢 Active' : '🔴 Inactive'} 
                        color={lab.isActive ? 'success' : 'error'} 
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{new Date(lab.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => loadLabMembersForManagement(lab.id)}
                        >
                          View Members
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error"
                          size="small"
                          onClick={() => handleDeleteLab(lab.id, lab.labName)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {labs.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No labs found. Create a new lab to get started.
              <br />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Debug: Check browser console for API response details.
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Lab Members Management (Unified Management) */}
      {tabValue === 7 && (role === 'Lab PI' || role === 'Super Admin') && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Lab Members Overview</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Overview of all labs you manage as PI. Click "View Members" to see detailed member lists.
          </Typography>
          {managedLabs.length === 0 ? (
            <Alert severity="info">
              You are not a Lab PI of any labs. Only Lab PIs can manage lab members.
            </Alert>
          ) : (
            <>
              <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Summary</Typography>
                  <Typography variant="body2">
                    You are managing {managedLabs.length} lab{managedLabs.length !== 1 ? 's' : ''} as PI
                  </Typography>
                </CardContent>
              </Card>
              <Grid container spacing={2}>
              {managedLabs.map((lab) => (
                <Grid item xs={12} md={6} key={lab.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{lab.labName}</Typography>
                      <Typography color="textSecondary">Lab ID: {lab.labId}</Typography>
                      <Typography color="textSecondary">Description: {lab.labDescription}</Typography>
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
                                secondary={`${member.email} - ${member.roleInLab || 'Member'}`}
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
            </>
          )}
        </Box>
      )}

      {/* Team Overview (for Super Admin) */}
      {tabValue === 7 && role === 'Super Admin' && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Platform Team Overview</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Overview of all teams across the platform with detailed information and management capabilities.
          </Typography>
          
          <Card sx={{ mb: 3, p: 2, bgcolor: 'secondary.light', color: 'white' }}>
            <Typography variant="h6">Platform Summary</Typography>
            <Typography variant="body2">
              Total Teams: {teams.length} | Active Teams: {teams.filter(team => team.isActive).length} | 
              Total Team Members: {teams.reduce((sum, team) => sum + (team.memberCount || 0), 0)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
              Debug: teams state length = {teams.length}
            </Typography>
          </Card>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Team Name</strong></TableCell>
                  <TableCell><strong>Lab</strong></TableCell>
                  <TableCell><strong>Leader</strong></TableCell>
                  <TableCell><strong>Members</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id} sx={{
                    backgroundColor: team.isActive ? 'inherit' : 'rgba(255, 0, 0, 0.05)',
                    borderLeft: team.isActive ? 'none' : '4px solid #f44336'
                  }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {team.teamName}
                        </Typography>
                        {!team.isActive && (
                          <Chip label="INACTIVE" size="small" color="error" variant="filled" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={team.labName || 'No Lab'} 
                        size="small"
                        color={team.labName ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={team.leaderUsername || 'No Leader'} 
                        size="small"
                        color={team.leaderUsername ? 'secondary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${team.memberCount || 0} members`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={team.isActive ? '🟢 Active' : '🔴 Inactive'} 
                        color={team.isActive ? 'success' : 'error'} 
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{new Date(team.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => loadTeamMembersForManagement(team.id)}
                        >
                          View Members
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error"
                          size="small"
                          onClick={() => handleDeleteTeam(team.id, team.teamName)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {teams.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No teams found. Create a new team to get started.
              <br />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Debug: Check browser console for API response details.
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Manage Members - Unified for PI/Team Leader, Separate for Super Admin */}
      {tabValue === 5 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {role === 'Super Admin' ? 'Member Management' : 'Organization Management'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {role === 'Super Admin' 
              ? 'Manage members within your organizations. For platform-wide user management, use the User Management tab.'
              : 'Manage members within your organizations (labs and teams you lead).'
            }
          </Typography>
          
          <Tabs value={membershipTabValue} onChange={(_, newValue) => setMembershipTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="Lab Members" />
            <Tab label="Team Members" />
            {role === 'Super Admin' && <Tab label="Organization Users" />}
          </Tabs>
          
          {/* Lab Members Management */}
          {membershipTabValue === 0 && (
            <Box>
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
                                    secondary={member.email}
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
            </Box>
          )}
          
          {/* Team Members Management */}
          {membershipTabValue === 1 && (
            <Box>
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
                                    secondary={member.email}
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
            </Box>
          )}

          {/* Organization Users Management (Super Admin only) */}
          {membershipTabValue === 2 && role === 'Super Admin' && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Organization Users Management</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Manage users within your organizations (labs and teams you lead).
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Organization Users</Typography>
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
                    {allUsers
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
                  {applicationTabValue === 0 ? (item as Lab).labName : (item as Team).teamName}
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
                    {invitationTabValue === 0 ? (item as Lab).labName : (item as Team).teamName}
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

      {/* Confirmation Dialog for User Actions */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, user: null, action: null })}>
        <DialogTitle>
          {confirmDialog.action === 'activate' ? 'Activate' : 'Deactivate'} Platform User
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to <strong>{confirmDialog.action}</strong> user <strong>"{confirmDialog.user?.username}"</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {confirmDialog.action === 'activate' 
              ? 'This will allow the user to access the platform again.'
              : 'This will prevent the user from accessing the platform until reactivated.'
            }
          </Typography>
          {confirmDialog.user?.role === 'Super Admin' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> This user is a Super Admin. {confirmDialog.action === 'deactivate' 
                  ? 'Deactivating a Super Admin will remove their platform-wide administrative privileges.'
                  : 'Activating a Super Admin will restore their platform-wide administrative privileges.'
                }
              </Typography>
            </Alert>
          )}
          {confirmDialog.user?.role === 'Super Admin' && confirmDialog.user?.username === username && confirmDialog.action === 'deactivate' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Critical Warning:</strong> You cannot deactivate your own account. This would lock you out of the platform.
              </Typography>
            </Alert>
          )}
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
            disabled={confirmDialog.user?.role === 'Super Admin' && confirmDialog.user?.username === username && confirmDialog.action === 'deactivate'}
          >
            {confirmDialog.action === 'activate' ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deletion Confirmation Dialog */}
      <Dialog open={deleteConfirmationDialogOpen} onClose={() => {
        setDeleteConfirmationDialogOpen(false);
        setDeleteConfirmationTarget(null);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>"{deleteConfirmationTarget?.name}"</strong> ({deleteConfirmationTarget?.type})?
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. Deleting this {deleteConfirmationTarget?.type} will:
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Remove all associated members</li>
              <li>Delete all teams within this lab (if deleting a lab)</li>
              <li>Remove all data and resources</li>
              <li>Cancel all pending invitations and applications</li>
            </ul>
          </Alert>
          <Typography variant="body2" color="textSecondary">
            This is a permanent action that will affect all users associated with this {deleteConfirmationTarget?.type}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteConfirmationDialogOpen(false);
            setDeleteConfirmationTarget(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (deleteConfirmationTarget?.type === 'lab') {
                confirmDeleteLab();
              } else if (deleteConfirmationTarget?.type === 'team') {
                confirmDeleteTeam();
              }
            }} 
            variant="contained"
            color="error"
          >
            Delete {deleteConfirmationTarget?.type === 'lab' ? 'Lab' : 'Team'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembershipManagementPage;
