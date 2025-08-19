import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Refresh,
  Visibility,
  Person,
  Email,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface ActivationRequest {
  id: number;
  username: string;
  email: string;
  requestMessage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

const ActivationRequestsPage: React.FC = () => {
  const { token, username } = useAuth();
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ActivationRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadActivationRequests();
  }, []);

  const loadActivationRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:12001/api/auth/admin/activation-requests/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load activation requests');
      }
    } catch (error) {
      console.error('Error loading activation requests:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:12001/api/auth/admin/activation-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username,
        },
      });

      if (response.ok) {
        // Remove the approved request from the list
        setRequests(requests.filter(req => req.id !== requestId));
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      setError('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:12001/api/auth/admin/activation-requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (response.ok) {
        // Remove the rejected request from the list
        setRequests(requests.filter(req => req.id !== selectedRequest.id));
        setRejectDialogOpen(false);
        setRejectReason('');
        setSelectedRequest(null);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (request: ActivationRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setRejectReason('');
    setSelectedRequest(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'APPROVED':
        return <Chip label="Approved" color="success" size="small" />;
      case 'REJECTED':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Activation Requests
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadActivationRequests}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {requests.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No pending activation requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              All activation requests have been processed.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Request Message</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Requested At</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {request.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email color="action" />
                      <Typography variant="body2">
                        {request.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300 }}>
                      {request.requestMessage}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule color="action" />
                      <Typography variant="body2">
                        {formatDate(request.requestedAt)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(request.status)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Approve Request">
                        <IconButton
                          color="success"
                          onClick={() => handleApprove(request.id)}
                          disabled={processing}
                          size="small"
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject Request">
                        <IconButton
                          color="error"
                          onClick={() => openRejectDialog(request)}
                          disabled={processing}
                          size="small"
                        >
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={closeRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Activation Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to reject the activation request from <strong>{selectedRequest?.username}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={20} /> : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivationRequestsPage;
