import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Link, Container, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Science } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [telephoneReg, setTelephoneReg] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'username' | 'telephone'>('username');
  const [role, setRole] = useState('');
  
  // New lab membership fields
  const [labName, setLabName] = useState('');
  const [roleInLab, setRoleInLab] = useState('');
  const [memberId, setMemberId] = useState('');
  const [supervisorUsername, setSupervisorUsername] = useState('');
  const [isPrimaryLab, setIsPrimaryLab] = useState<boolean | null>(true);
  
  // New state for lab selection and supervisors
  const [availableLabs, setAvailableLabs] = useState<Array<{id: number, labName: string, labId: string}>>([]);
  const [availableSupervisors, setAvailableSupervisors] = useState<Array<{id: number, username: string, role: string}>>([]);
  const [selectedLabId, setSelectedLabId] = useState<number | null>(null);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [isLoadingSupervisors, setIsLoadingSupervisors] = useState(false);
  
  // New state for team selection
  const [availableTeams, setAvailableTeams] = useState<Array<{id: number, teamName: string, teamId: string}>>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refreshProfile } = useAuth();

  // Role options
  const roleOptions = [
    'Lab PI',
    'Master Student', 
    'PhD Student',
    'Data Analyst',
    'Technician',
    'Professor'
  ];

  // Lab role options
  const labRoleOptions = [
    'Lab PI',
    'PhD Student',
    'Master Student',
    'Postdoc',
    'Research Assistant',
    'Technician',
    'Data Analyst',
    'Visiting Scholar'
  ];

  // Check if we should show register form based on navigation state
  useEffect(() => {
    if (location.state?.showRegister) {
      setIsRegister(true);
    }
    // Auto-open reset form if resetToken present in query string
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('resetToken');
    if (tokenFromUrl) {
      setIsResetPassword(true);
      setResetToken(tokenFromUrl);
      setIsRegister(false);
      setIsForgotPassword(false);
    }
  }, [location.state]);

  // Load available labs and teams when registration form is shown
  useEffect(() => {
    if (isRegister) {
      loadAvailableLabs();
      loadAvailableTeams();
    }
  }, [isRegister]);

  // Load supervisors when lab is selected
  useEffect(() => {
    if (selectedLabId) {
      loadAvailableSupervisors(selectedLabId);
    } else {
      setAvailableSupervisors([]);
    }
  }, [selectedLabId]);

  const loadAvailableLabs = async () => {
    try {
      setIsLoadingLabs(true);
      const response = await axios.get('http://localhost:12001/api/auth/public/labs');
      setAvailableLabs(response.data || []);
    } catch (error) {
      console.log('Could not load labs, will allow manual entry');
      setAvailableLabs([]);
    } finally {
      setIsLoadingLabs(false);
    }
  };

  const loadAvailableTeams = async () => {
    try {
      setIsLoadingTeams(true);
      const response = await axios.get('http://localhost:12001/api/auth/public/teams');
      setAvailableTeams(response.data || []);
    } catch (error) {
      console.log('Could not load teams, will allow manual entry');
      setAvailableTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const loadAvailableSupervisors = async (labId: number) => {
    try {
      setIsLoadingSupervisors(true);
      const response = await axios.get(`http://localhost:12001/api/auth/public/labs/${labId}/supervisors`);
      setAvailableSupervisors(response.data || []);
    } catch (error) {
      console.log('Could not load supervisors for this lab');
      setAvailableSupervisors([]);
    } finally {
      setIsLoadingSupervisors(false);
    }
  };

  const handleLabSelection = (labId: number | null, labName: string) => {
    setSelectedLabId(labId);
    setLabName(labName);
    setSupervisorUsername(''); // Reset supervisor when lab changes
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const loginData = {
        password,
        ...(loginMethod === 'username' ? { username } : { telephone })
      };
      
      const response = await axios.post('http://localhost:12001/api/auth/login', loginData);

      // Use auth context to login with user status
      const isActive = response.data.isActive !== false; // Default to true if not provided
      login(response.data.token, response.data.username, response.data.role, isActive);
      
      // Refresh profile to get photo URL and other sensitive data
      await refreshProfile();
      
      // Navigate based on user status
      if (isActive) {
        navigate('/welcome');
      } else {
        navigate('/restricted');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        // Extract specific error message from backend
        const errorMessage = err.response.data;
        
        // Make error messages more user-friendly
        if (errorMessage.includes("Incorrect password")) {
          setError("❌ Incorrect password. Please check your password and try again.");
        } else if (errorMessage.includes("User not found")) {
          setError("❌ User not found. Please check your username/telephone or register a new account.");
        } else if (errorMessage.includes("Password is required")) {
          setError("❌ Please enter your password.");
        } else if (errorMessage.includes("Username or telephone number is required")) {
          setError("❌ Please enter your username or telephone number.");
        } else {
          setError(errorMessage);
        }
      } else if (err.message) {
        setError(`❌ Login failed: ${err.message}`);
      } else {
        setError('❌ Login failed. Please check your credentials and try again.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!role) {
      setError('Please select a role.');
      return;
    }
    // Lab-related validation - only required if user has selected a lab or entered a lab name
    if ((selectedLabId || labName.trim()) && !roleInLab) {
      setError('Please select your role in the lab.');
      return;
    }
    try {
      const registerData: any = {
        username,
        password,
        email,
        role,
      };
      
      // Only include lab-related data if user has selected a lab or entered a lab name
      if (selectedLabId || labName.trim()) {
        registerData.labName = labName.trim();
        registerData.roleInLab = roleInLab;
        // Only include isPrimaryLab if it's not null
        if (isPrimaryLab !== null) {
          registerData.isPrimaryLab = isPrimaryLab;
        }
      }
      
      // Only include telephone if it's not empty
      if (telephoneReg && telephoneReg.trim() !== '') {
        registerData.telephone = telephoneReg.trim();
      }
      
      // Only include memberId if it's not empty
      if (memberId && memberId.trim() !== '') {
        registerData.memberId = memberId.trim();
      }
      
      // Only include supervisorUsername if it's not empty
      if (supervisorUsername && supervisorUsername.trim() !== '') {
        registerData.supervisorUsername = supervisorUsername.trim();
      }
      
      await axios.post('http://localhost:12001/api/auth/register', registerData);
      setSuccess('Registration successful! You can now log in.');
      setIsRegister(false);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setEmail('');
      setTelephoneReg('');
      setRole('');
      setLabName('');
      setRoleInLab('');
      setMemberId('');
      setSupervisorUsername('');
      setIsPrimaryLab(true);
      setSelectedLabId(null);
    } catch (err: any) {
      if (err.response && err.response.data) {
        // Extract specific error message from backend
        const errorMessage = err.response.data;
        
        // Make registration error messages more user-friendly
        if (errorMessage.includes("Username already exists")) {
          setError("❌ Username already exists. Please choose a different username.");
        } else if (errorMessage.includes("Email already exists")) {
          setError("❌ Email already exists. Please use a different email address.");
        } else if (errorMessage.includes("Telephone number already exists")) {
          setError("❌ Telephone number already exists. Please use a different number.");
        } else if (errorMessage.includes("Missing fields")) {
          setError("❌ Please fill in all required fields.");
        } else {
          setError(errorMessage);
        }
      } else if (err.message) {
        setError(`❌ Registration failed: ${err.message}`);
      } else {
        setError('❌ Registration failed. Please check your information and try again.');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('http://localhost:12001/api/auth/forgot-password', { email });
      const resp = response.data;
      if (typeof resp === 'string' && resp.includes('Token:')) {
        const match = resp.match(/Token:\s*([A-Za-z0-9\-]+)/);
        const token = match ? match[1] : '';
        if (token) {
          setIsResetPassword(true);
          setResetToken(token);
          setIsForgotPassword(false);
          setSuccess('Reset token detected. You can now set a new password below.');
        } else {
          setSuccess('Password reset token generated. Please check the server response.');
        }
      } else {
        setSuccess('Password reset link sent to your email. Check your inbox.');
        setIsForgotPassword(false);
        setEmail('');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else if (err.message) {
        setError(`Failed to send reset link: ${err.message}`);
      } else {
        setError('Failed to send reset link. Please check your email address.');
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await axios.post('http://localhost:12001/api/auth/reset-password', {
        resetToken,
        newPassword,
      });
      setSuccess('Password reset successful! You can now log in with your new password.');
      setIsResetPassword(false);
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else if (err.message) {
        setError(`Failed to reset password: ${err.message}`);
      } else {
        setError('Failed to reset password. Please check your reset token.');
      }
    }
  };

  return (
    <Box 
      sx={{
        width: '100vw',
        height: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0, 255, 136, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(0, 153, 255, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
        animation: 'gradient 15s ease infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none'
        }
      }}
    >
        <Paper
          component="form" 
          onSubmit={
            isRegister ? handleRegister : 
            isForgotPassword ? handleForgotPassword : 
            isResetPassword ? handleResetPassword : 
            handleLogin
          } 
          sx={{ 
            p: 6, 
            borderRadius: 6,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 72px rgba(0,0,0,0.4), 0 8px 32px rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            maxWidth: 600,
            mx: 'auto',
            width: '95%',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #00d4ff, #00ff88, #0099ff, #00d4ff)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s linear infinite'
            }
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 200,
              height: 200,
              margin: '0 auto 3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              filter: 'drop-shadow(0 12px 36px rgba(0, 212, 255, 0.35))',
              animation: 'float 6s ease-in-out infinite'
            }}
          >
            {/* Try to load the uploaded logo first */}
            <img 
              src="/agenticomics-logo.png" 
              alt="AgenticOmics Logo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 20px rgba(0, 212, 255, 0.3))'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback Logo with gradient matching your brand */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 50%, #0099ff 100%)',
                borderRadius: '50%',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                boxShadow: '0 16px 48px rgba(0, 212, 255, 0.5)',
                animation: 'pulse 3s ease-in-out infinite'
              }}
            >
              <Science sx={{ fontSize: 100, color: 'white' }} />
            </Box>
          </Box>
          
          <Typography variant="h4" mb={3} sx={{ fontWeight: 600, color: '#1e3c72' }}>
            {isRegister ? 'Create Account' : isForgotPassword ? 'Forgot Password' : isResetPassword ? 'Reset Password' : 'Welcome Back'}
          </Typography>
          
          {!isRegister && !isForgotPassword && !isResetPassword && (
            <>
              {/* Login Method Toggle */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant={loginMethod === 'username' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setLoginMethod('username')}
                  sx={{ flex: 1 }}
                >
                  Username
                </Button>
                <Button
                  variant={loginMethod === 'telephone' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setLoginMethod('telephone')}
                  sx={{ flex: 1 }}
                >
                  Phone Number
                </Button>
              </Box>
              
              {/* Login Fields */}
              {loginMethod === 'username' ? (
                <TextField
                  label="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                />
              ) : (
                <TextField
                  label="Phone Number"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  placeholder="+1234567890"
                />
              )}
              
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            </>
          )}
          
          {isRegister && (
            <>
              <TextField
                label="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                required
                type="email"
              />
              <TextField
                label="Phone Number (Optional)"
                value={telephoneReg}
                onChange={e => setTelephoneReg(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="+1234567890"
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roleOptions.map((roleOption) => (
                    <MenuItem key={roleOption} value={roleOption}>
                      {roleOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Lab Information Section */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#1e3c72', fontWeight: 600 }}>
                Lab Information (Optional)
              </Typography>
              
              {isLoadingLabs ? (
                <Typography>Loading labs...</Typography>
              ) : (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Existing Lab (Optional)</InputLabel>
                  <Select
                    value={selectedLabId || ''}
                    label="Select Existing Lab (Optional)"
                    onChange={(e) => {
                      const labId = Number(e.target.value);
                      if (labId === 0) {
                        // "No Lab" option selected
                        setSelectedLabId(null);
                        setLabName('');
                        setSupervisorUsername('');
                      } else {
                        const selectedLab = availableLabs.find(lab => lab.id === labId);
                        handleLabSelection(labId, selectedLab?.labName || '');
                      }
                    }}
                  >
                    <MenuItem value={0}>
                      <em>No Lab - I'm an independent researcher</em>
                    </MenuItem>
                    {availableLabs.map((lab) => (
                      <MenuItem key={lab.id} value={lab.id}>
                        {lab.labName} ({lab.labId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {/* Lab Name (if not selected from dropdown and user wants to create/join a lab) */}
              {!selectedLabId && (
                <TextField
                  label="Lab Name (Optional - for new lab or existing lab not in list)"
                  value={labName}
                  onChange={e => setLabName(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="e.g., Omics Research Lab (leave empty if no lab)"
                  helperText="Enter lab name if you want to create a new lab or join an existing lab not listed above"
                />
              )}
              
              {/* Role in Lab - Only show if user has selected a lab or entered a lab name */}
              {(selectedLabId || labName.trim()) && (
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Role in Lab</InputLabel>
                  <Select
                    value={roleInLab}
                    label="Role in Lab"
                    onChange={(e) => setRoleInLab(e.target.value)}
                  >
                    {labRoleOptions.map((roleOption) => (
                      <MenuItem key={roleOption} value={roleOption}>
                        {roleOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {/* Member ID (if not selected from dropdown) */}
              {!selectedLabId && (
                <TextField
                  label="Member ID (Optional)"
                  value={memberId}
                  onChange={e => setMemberId(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="e.g., LAB001, Student ID"
                />
              )}
              
                             {/* Supervisor Selection */}
               {selectedLabId && (
                 <FormControl fullWidth margin="normal">
                   <InputLabel>Supervisor (Optional)</InputLabel>
                   <Select
                     value={supervisorUsername || ''}
                     label="Supervisor (Optional)"
                     onChange={(e) => setSupervisorUsername(e.target.value)}
                   >
                     <MenuItem value="">
                       <em>None - I am a Lab PI or independent researcher</em>
                     </MenuItem>
                     {availableSupervisors.map((supervisor) => (
                       <MenuItem key={supervisor.id} value={supervisor.username}>
                         {supervisor.username} ({supervisor.role})
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               )}
              
              {/* Team Information Section */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#1e3c72', fontWeight: 600 }}>
                Team Information (Optional)
              </Typography>
              
              {isLoadingTeams ? (
                <Typography>Loading teams...</Typography>
              ) : (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Existing Team (Optional)</InputLabel>
                  <Select
                    value={selectedTeamId || ''}
                    label="Select Existing Team (Optional)"
                    onChange={(e) => {
                      const teamId = Number(e.target.value);
                      if (teamId === 0) {
                        // "No Team" option selected
                        setSelectedTeamId(null);
                      } else {
                        setSelectedTeamId(teamId);
                      }
                    }}
                  >
                    <MenuItem value={0}>
                      <em>No Team - I'm not part of a specific team</em>
                    </MenuItem>
                    {availableTeams.map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        {team.teamName} ({team.teamId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {/* Primary Lab - Only show if user has selected a lab or entered a lab name */}
              {(selectedLabId || labName.trim()) && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Primary Lab</InputLabel>
                  <Select
                    value={isPrimaryLab === null ? 'none' : (isPrimaryLab ? 'true' : 'false')}
                    label="Primary Lab"
                    onChange={(e) => {
                      if (e.target.value === 'none') {
                        setIsPrimaryLab(null);
                      } else {
                        setIsPrimaryLab(e.target.value === 'true');
                      }
                    }}
                  >
                    <MenuItem value="none">None - I don't have a primary lab</MenuItem>
                    <MenuItem value="true">Yes - This is my primary lab</MenuItem>
                    <MenuItem value="false">No - I belong to multiple labs</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            </>
          )}
          
          {isForgotPassword && (
            <TextField
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              type="email"
            />
          )}
          
          {isResetPassword && (
            <>
              <TextField
                label="Reset Token"
                value={resetToken}
                onChange={e => setResetToken(e.target.value)}
                fullWidth
                margin="normal"
                required
                placeholder="Enter the token from your email"
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            </>
          )}
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ 
              mt: 3,
              background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 50%, #0099ff 100%)',
              color: 'white',
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              boxShadow: '0 6px 24px rgba(0, 212, 255, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00ff88 0%, #0099ff 50%, #00d4ff 100%)',
                boxShadow: '0 8px 32px rgba(0, 212, 255, 0.6)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {isRegister ? 'Register' : isForgotPassword ? 'Send Reset Link' : isResetPassword ? 'Reset Password' : 'Login'}
          </Button>
          
          <Box 
            sx={{ 
              mt: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 1.5 
            }}
          >
            {!isRegister && !isForgotPassword && !isResetPassword && (
              <>
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
                  sx={{ 
                    color: '#1976d2',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                    border: '1px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderColor: '#1976d2',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                    }
                  }}
                >
                  Don't have an account? Register
                </Link>
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                  sx={{ 
                    color: '#1976d2',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                    border: '1px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderColor: '#1976d2',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                    }
                  }}
                >
                  Forgot your password?
                </Link>
              </>
            )}
            
            {isRegister && (
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
                sx={{ 
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    borderColor: '#1976d2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                  }
                }}
              >
                Already have an account? Login
              </Link>
            )}
            
            {isForgotPassword && (
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }}
                sx={{ 
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    borderColor: '#1976d2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                  }
                }}
              >
                Back to Login
              </Link>
            )}
            
            {isResetPassword && (
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => { setIsResetPassword(false); setError(''); setSuccess(''); }}
                sx={{ 
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    borderColor: '#1976d2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                  }
                }}
              >
                Back to Login
              </Link>
            )}
          </Box>
        </Paper>
      </Box>
  );
};

export default LoginPage;