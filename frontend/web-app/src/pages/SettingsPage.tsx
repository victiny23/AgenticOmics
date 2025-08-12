import React, { useEffect, useState } from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  Divider, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Alert,
  Card,
  CardContent,
  Chip,
  Avatar,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material'
import {
  Business,
  Group,
  Star,
  ExpandMore,
  Person,
  SupervisorAccount,
  School,
  Science,
  Build,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

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
  labMemberships?: UserLabMembershipDto[];
  primaryLab?: UserLabMembershipDto;
  teamMemberships?: UserTeamMembershipDto[];
  primaryTeam?: UserTeamMembershipDto;
}

const SettingsPage: React.FC = () => {
  const { username, logout, setPhotoUrl: setAuthPhotoUrl, refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [birthday, setBirthday] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('jwtToken')
        // Load non-sensitive profile data
        const res = await fetch('http://localhost:12001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}`, 'X-Username': username || '' }
        })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
        
        // Load sensitive profile data
        const sensitiveRes = await fetch('http://localhost:12001/api/auth/profile/sensitive', {
          headers: { Authorization: `Bearer ${token}`, 'X-Username': username || '' }
        })
        if (sensitiveRes.ok) {
          const sensitiveData = await sensitiveRes.json()
          setEmail(sensitiveData.email || '')
          setTelephone(sensitiveData.telephone || '')
          setBirthday(sensitiveData.birthday || '')
          setPhotoUrl(sensitiveData.photoUrl || '')
        }
      } catch {}
    }
    if (username) loadProfile()
  }, [username])

  const handleSaveProfile = async () => {
    try {
      setError(''); setSuccess('')
      const token = localStorage.getItem('jwtToken')
      const res = await fetch('http://localhost:12001/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'X-Username': username || '' },
        body: JSON.stringify({ email, telephone, birthday, photoUrl })
      })
      if (!res.ok) {
        const text = await res.text(); throw new Error(text || 'Failed to update profile')
      }
      setSuccess('Profile updated successfully')
    } catch (e: any) {
      setError(e.message || 'Failed to update profile')
    }
  }

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem('jwtToken')
      const res = await fetch('http://localhost:12001/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'X-Username': username || '' }
      })
      if (!res.ok) {
        const text = await res.text(); throw new Error(text || 'Failed to delete account')
      }
      setConfirmOpen(false)
      logout()
    } catch (e: any) {
      setConfirmOpen(false)
      setError(e.message || 'Failed to delete account')
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const token = localStorage.getItem('jwtToken')
    const formData = new FormData()
    formData.append('file', file)
    try {
      setError(''); setSuccess('')
      const res = await fetch('http://localhost:12001/api/auth/profile/photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'X-Username': username || '' },
        body: formData
      })
      if (!res.ok) {
        const text = await res.text(); throw new Error(text || 'Failed to upload photo')
      }
      const url = await res.text()
      const clean = url.replace(/"/g, '')
      setAuthPhotoUrl(clean)
      setPhotoUrl(clean)
      await refreshProfile()
      setSuccess('Photo uploaded successfully')
    } catch (e: any) {
      setError(e.message || 'Failed to upload photo')
    }
  }

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

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 1200 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Account Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Manage your profile and account.</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Personal Information</Typography>
                <Stack spacing={2}>
                  <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
                  <TextField label="Telephone" value={telephone} onChange={e => setTelephone(e.target.value)} fullWidth />
                  <TextField label="Birthday" type="date" value={birthday} onChange={e => setBirthday(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                  <TextField label="Photo URL" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} fullWidth />
                  <Button component="label" variant="outlined">Upload Photo<input type="file" accept="image/*" hidden onChange={handlePhotoUpload} /></Button>
                  <Button variant="contained" onClick={handleSaveProfile}>Save Changes</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Organization Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Organization Information</Typography>
                
                {/* Primary Lab */}
                {profile?.primaryLab && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Primary Lab
                    </Typography>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.dark' }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {profile.primaryLab.labName}
                          </Typography>
                          <Chip
                            label={`${profile.primaryLab.labCode} • ${profile.primaryLab.roleInLab}`}
                            color={getRoleColor(profile.primaryLab.roleInLab) as any}
                            size="small"
                            icon={<Star />}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* Primary Team */}
                {profile?.primaryTeam && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Primary Team
                    </Typography>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'secondary.dark' }}>
                          <Group />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {profile.primaryTeam.teamName}
                          </Typography>
                          <Chip
                            label={`${profile.primaryTeam.teamIdCode} • ${profile.primaryTeam.roleInTeam}`}
                            color={getRoleColor(profile.primaryTeam.roleInTeam) as any}
                            size="small"
                            icon={<Star />}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* Lab Memberships */}
                {profile?.labMemberships && profile.labMemberships.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      All Lab Memberships ({profile.labMemberships.length})
                    </Typography>
                    <List dense>
                      {profile.labMemberships.map((membership) => (
                        <ListItem key={membership.id} sx={{ pl: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: membership.isPrimaryLab ? 'primary.main' : 'grey.300' }}>
                              {membership.isPrimaryLab ? <Star /> : <Business />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={membership.labName}
                            secondary={`${membership.labCode} • ${membership.roleInLab}${membership.isPrimaryLab ? ' • Primary' : ''}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Team Memberships */}
                {profile?.teamMemberships && profile.teamMemberships.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      All Team Memberships ({profile.teamMemberships.length})
                    </Typography>
                    <List dense>
                      {profile.teamMemberships.map((membership) => (
                        <ListItem key={membership.id} sx={{ pl: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: membership.isPrimaryTeam ? 'secondary.main' : 'grey.300' }}>
                              {membership.isPrimaryTeam ? <Star /> : <Group />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={membership.teamName}
                            secondary={`${membership.teamIdCode} • ${membership.roleInTeam}${membership.isPrimaryTeam ? ' • Primary' : ''}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {(!profile?.labMemberships || profile.labMemberships.length === 0) && 
                 (!profile?.teamMemberships || profile.teamMemberships.length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                    No organization memberships found.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" sx={{ mb: 1, color: '#d32f2f', fontWeight: 700 }}>Danger Zone</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Deleting your account will permanently remove your profile and associated data. This action cannot be undone.</Typography>
          <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>Delete Account</Button>
        </Box>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete your account? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={deleteAccount} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  )
}

export default SettingsPage

