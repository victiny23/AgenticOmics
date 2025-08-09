import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography, TextField, Button, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

const SettingsPage: React.FC = () => {
  const { username, logout, setPhotoUrl: setAuthPhotoUrl, refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [birthday, setBirthday] = useState('')
  const [studentId, setStudentId] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('jwtToken')
        const res = await fetch('http://localhost:12001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}`, 'X-Username': username || '' }
        })
        if (res.ok) {
          const data = await res.json()
          setEmail(data.email || '')
          setTelephone(data.telephone || '')
          setBirthday(data.birthday || '')
          setStudentId(data.studentId || '')
          setPhotoUrl(data.photoUrl || '')
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
        body: JSON.stringify({ email, telephone, birthday, studentId, photoUrl })
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
      const clean = url.replaceAll('"', '')
      setAuthPhotoUrl(clean)
      setPhotoUrl(clean)
      await refreshProfile()
      setSuccess('Photo uploaded successfully')
    } catch (e: any) {
      setError(e.message || 'Failed to upload photo')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Account Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Manage your profile and account.</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Stack spacing={2}>
          <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
          <TextField label="Telephone" value={telephone} onChange={e => setTelephone(e.target.value)} fullWidth />
          <TextField label="Birthday" type="date" value={birthday} onChange={e => setBirthday(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} fullWidth />
          <TextField label="Photo URL" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} fullWidth />
          <Button component="label" variant="outlined">Upload Photo<input type="file" accept="image/*" hidden onChange={handlePhotoUpload} /></Button>
          <Box>
            <Button variant="contained" onClick={handleSaveProfile}>Save Changes</Button>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" sx={{ mb: 1, color: '#d32f2f', fontWeight: 700 }}>Danger Zone</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Deleting your account will permanently remove your profile and associated data. This action cannot be undone.</Typography>
          <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>Delete Account</Button>
        </Box>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <Typography>Are you absolutely sure? This action is permanent and cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteAccount}>Yes, delete my account</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SettingsPage

