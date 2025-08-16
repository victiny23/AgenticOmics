import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box
} from '@mui/material';
import axios from 'axios';

interface LeaveLabDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  labId: number;
  labName: string;
  userRole: string;
}

const LeaveLabDialog: React.FC<LeaveLabDialogProps> = ({
  open,
  onClose,
  onSuccess,
  labId,
  labName,
  userRole
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLeaveLab = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      await axios.delete(
        `http://localhost:12001/api/auth/labs/${labId}/leave`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Username': username
          }
        }
      );

      console.log('Successfully left the lab');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error leaving lab:', err);
      setError(err.response?.data || 'Failed to leave the lab');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Leave Lab</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to leave <strong>{labName}</strong>?
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current Role: <strong>{userRole}</strong>
          </Typography>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. You will lose access to:
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Lab files and resources</li>
              <li>Lab member communications</li>
              <li>Lab-specific permissions</li>
            </ul>
            <Typography variant="body2">
              You can reapply to join the lab later if needed.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleLeaveLab} 
          variant="contained" 
          color="error"
          disabled={loading}
        >
          {loading ? 'Leaving...' : 'Leave Lab'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveLabDialog; 