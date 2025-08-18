import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as WithdrawIcon
} from '@mui/icons-material';
import axios from 'axios';

interface LabApplication {
  id: number;
  applicantUsername: string;
  applicantName: string;
  labId: number;
  labName: string;
  requestedRole: string;
  applicationMessage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  reviewedByUsername?: string;
  reviewedByName?: string;
  reviewMessage?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface LabApplicationsPanelProps {
  labId?: number;
  isPI: boolean;
  onApplicationUpdate: () => void;
}

const LabApplicationsPanel: React.FC<LabApplicationsPanelProps> = ({
  labId,
  isPI,
  onApplicationUpdate
}) => {
  const [applications, setApplications] = useState<LabApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<LabApplication | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      let endpoint = 'http://localhost:12001/api/auth/labs/applications/my';
      if (isPI && labId) {
        endpoint = `http://localhost:12001/api/auth/labs/${labId}/applications`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username
        }
      });

      setApplications(response.data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [labId, isPI]);

  const handleReview = (application: LabApplication, action: 'APPROVE' | 'REJECT') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewMessage('');
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!selectedApplication) return;

    setReviewLoading(true);

    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      const response = await axios.post(
        `http://localhost:12001/api/auth/labs/applications/${selectedApplication.id}/review`,
        {
          action: reviewAction,
          reviewMessage: reviewMessage || undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Username': username,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Review submitted successfully:', response.data);
      setReviewDialogOpen(false);
      onApplicationUpdate();
      fetchApplications();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.response?.data || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: number) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      await axios.delete(
        `http://localhost:12001/api/auth/labs/applications/${applicationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Username': username
          }
        }
      );

      console.log('Application withdrawn successfully');
      onApplicationUpdate();
      fetchApplications();
    } catch (err: any) {
      console.error('Error withdrawing application:', err);
      setError(err.response?.data || 'Failed to withdraw application');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'WITHDRAWN':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading applications...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isPI ? 'Lab Applications' : 'My Applications'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              {isPI ? 'No applications found for this lab.' : 'You have no applications.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {applications.map((application) => (
            <Grid item xs={12} key={application.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {isPI ? application.applicantName : application.labName}
                      </Typography>
                      <Typography color="text.secondary">
                        {isPI ? `Applicant: ${application.applicantUsername}` : `Lab: ${application.labName}`}
                      </Typography>
                      <Typography color="text.secondary">
                        Role: {application.requestedRole}
                      </Typography>
                    </Box>
                    <Chip 
                      label={application.status} 
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </Box>

                  {application.applicationMessage && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Application Message:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {application.applicationMessage}
                      </Typography>
                    </Box>
                  )}

                  {application.reviewMessage && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Review Message:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {application.reviewMessage}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Applied: {formatDate(application.createdAt)}
                      {application.reviewedAt && ` • Reviewed: ${formatDate(application.reviewedAt)}`}
                    </Typography>

                    <Box>
                      {isPI && application.status === 'PENDING' && (
                        <>
                          <Tooltip title="Approve Application">
                            <IconButton
                              color="success"
                              onClick={() => handleReview(application, 'APPROVE')}
                              size="small"
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Application">
                            <IconButton
                              color="error"
                              onClick={() => handleReview(application, 'REJECT')}
                              size="small"
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {!isPI && application.status === 'PENDING' && (
                        <Tooltip title="Withdraw Application">
                          <IconButton
                            color="warning"
                            onClick={() => handleWithdraw(application.id)}
                            size="small"
                          >
                            <WithdrawIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'APPROVE' ? 'Approve' : 'Reject'} Application
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {selectedApplication && (
                <>
                  <strong>Applicant:</strong> {selectedApplication.applicantName} ({selectedApplication.applicantUsername})<br />
                  <strong>Lab:</strong> {selectedApplication.labName}<br />
                  <strong>Requested Role:</strong> {selectedApplication.requestedRole}
                </>
              )}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Review Message (Optional)"
              value={reviewMessage}
              onChange={(e) => setReviewMessage(e.target.value)}
              placeholder={`Add a message for the ${reviewAction === 'APPROVE' ? 'approval' : 'rejection'}...`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)} disabled={reviewLoading}>
            Cancel
          </Button>
          <Button 
            onClick={submitReview} 
            variant="contained" 
            color={reviewAction === 'APPROVE' ? 'success' : 'error'}
            disabled={reviewLoading}
          >
            {reviewLoading ? 'Submitting...' : reviewAction}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabApplicationsPanel; 