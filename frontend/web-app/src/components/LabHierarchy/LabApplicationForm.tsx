import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography
} from '@mui/material';
import axios from 'axios';

interface Lab {
  id: number;
  labId: string;
  labName: string;
  isActive: boolean;
}

interface LabApplicationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableLabs: Lab[];
}

const LabApplicationForm: React.FC<LabApplicationFormProps> = ({
  open,
  onClose,
  onSuccess,
  availableLabs
}) => {
  const [selectedLab, setSelectedLab] = useState<number | ''>('');
  const [requestedRole, setRequestedRole] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleOptions = [
    'PhD Student',
    'Master Student',
    'Postdoc',
    'Research Assistant',
    'Lab Technician',
    'Visiting Scholar'
  ];

  const handleSubmit = async () => {
    if (!selectedLab || !requestedRole) {
      setError('Please select a lab and role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      const response = await axios.post(
        'http://localhost:12001/api/auth/labs/apply',
        {
          labId: selectedLab,
          requestedRole,
          applicationMessage: applicationMessage || undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Username': username,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Application submitted successfully:', response.data);
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.response?.data || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedLab('');
    setRequestedRole('');
    setApplicationMessage('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Apply to Join Lab</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Lab</InputLabel>
            <Select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value as number)}
              label="Select Lab"
            >
              {availableLabs.map((lab) => (
                <MenuItem key={lab.id} value={lab.id}>
                  {lab.labName} ({lab.labId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Requested Role</InputLabel>
            <Select
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              label="Requested Role"
            >
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Application Message (Optional)"
            value={applicationMessage}
            onChange={(e) => setApplicationMessage(e.target.value)}
            placeholder="Tell us why you want to join this lab and what you can contribute..."
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" color="text.secondary">
            Your application will be reviewed by the Lab PI. You will be notified once a decision is made.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !selectedLab || !requestedRole}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabApplicationForm; 