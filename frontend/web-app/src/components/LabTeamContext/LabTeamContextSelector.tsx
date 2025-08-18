import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Business,
  Group,
  Science,
  School,
  Analytics,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface LabMembership {
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

interface TeamMembership {
  id: number;
  userId: number;
  username: string;
  teamId: number;
  teamName: string;
  teamIdCode: string;
  roleInTeam: string;
  memberId: string;
  supervisorId?: number;
  supervisorName?: string;
  isPrimaryTeam: boolean;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LabTeamContextSelectorProps {
  onContextChange: (context: {
    type: 'LAB' | 'TEAM';
    id: number;
    name: string;
    code: string;
    role: string;
  } | null) => void;
  currentContext?: {
    type: 'LAB' | 'TEAM';
    id: number;
    name: string;
    code: string;
    role: string;
  } | null;
}

const LabTeamContextSelector: React.FC<LabTeamContextSelectorProps> = ({
  onContextChange,
  currentContext,
}) => {
  const { username } = useAuth();
  const [labMemberships, setLabMemberships] = useState<LabMembership[]>([]);
  const [teamMemberships, setTeamMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [contextStats, setContextStats] = useState<any>(null);

  // Calculate if we have valid data
  const hasValidData = labMemberships.length > 0 || teamMemberships.length > 0;

  useEffect(() => {
    if (username) {
      console.log('Loading memberships for user:', username);
      loadUserMemberships();
    }
  }, [username]);

  // Debug state changes
  useEffect(() => {
    console.log('=== STATE CHANGE ===');
    console.log('selectedContext changed to:', selectedContext);
    console.log('labMemberships:', labMemberships);
    console.log('teamMemberships:', teamMemberships);
  }, [selectedContext, labMemberships, teamMemberships]);

  // No automatic initial selection - let user choose manually

  // REMOVED: No default selection - let user choose manually
  // useEffect(() => {
  //   // Set initial context to primary lab if available and no current context
  //   if (hasValidData && labMemberships.length > 0 && !currentContext) {
  //     const primaryLab = labMemberships.find(lab => lab.isPrimaryLab);
  //     if (primaryLab) {
  //       const context = {
  //         type: 'LAB' as const,
  //         id: primaryLab.labId,
  //         name: primaryLab.labName,
  //         code: primaryLab.labCode,
  //         role: primaryLab.roleInLab,
  //       };
  //       console.log('Setting initial primary lab context:', context);
  //       setSelectedContext(`LAB_${primaryLab.labId}`);
  //       onContextChange(context);
  //     }
  //   }
  // }, [hasValidData, labMemberships, currentContext, onContextChange]);

  // Sync selectedContext with currentContext prop
  useEffect(() => {
    console.log('=== SYNC EFFECT TRIGGERED ===');
    console.log('Sync effect triggered - currentContext:', currentContext, 'hasValidData:', hasValidData);
    console.log('Current selectedContext in sync effect:', selectedContext);
    
    if (currentContext && hasValidData) {
      const contextValue = `${currentContext.type}_${currentContext.id}`;
      console.log('Attempting to sync with contextValue:', contextValue);
      
      // Validate that this context exists in our data
      const isValidContext = currentContext.type === 'LAB' 
        ? labMemberships.some(lab => lab.labId === currentContext.id)
        : teamMemberships.some(team => team.teamId === currentContext.id);
      
      if (isValidContext) {
        console.log('Context is valid, setting selectedContext to:', contextValue);
        setSelectedContext(contextValue);
      } else {
        console.log('Context is invalid, clearing selectedContext');
        setSelectedContext('');
      }
    } else {
      console.log('Clearing selectedContext - no currentContext or no valid data');
      setSelectedContext('');
    }
  }, [currentContext, hasValidData, labMemberships, teamMemberships]);

  // Clear selectedContext if no memberships are available
  useEffect(() => {
    if (labMemberships.length === 0 && teamMemberships.length === 0) {
      console.log('No memberships available, clearing selectedContext');
      setSelectedContext('');
    }
  }, [labMemberships.length, teamMemberships.length]);

  // Reset selectedContext when data changes to prevent stale values
  useEffect(() => {
    console.log('Data changed - resetting selectedContext to prevent stale values');
    console.log('Current selectedContext:', selectedContext);
    console.log('Available labs:', labMemberships.map(l => `LAB_${l.labId}`));
    console.log('Available teams:', teamMemberships.map(t => `TEAM_${t.teamId}`));
    
    // If selectedContext is not empty, validate it still exists
    if (selectedContext && selectedContext !== '') {
      const [type, id] = selectedContext.split('_');
      const numericId = parseInt(id);
      
      const isValidSelection = type === 'LAB' 
        ? labMemberships.some(lab => lab.labId === numericId)
        : teamMemberships.some(team => team.teamId === numericId);
      
      if (!isValidSelection) {
        console.log('Selected context no longer valid, clearing:', selectedContext);
        setSelectedContext('');
      }
    }
  }, [labMemberships, teamMemberships, selectedContext]);

  // NUCLEAR EFFECT: Ensure selectedContext is always valid (moved to proper location)
  useEffect(() => {
    const hasStableData = hasValidData && (labMemberships.length + teamMemberships.length) > 0;
    
    if (hasStableData && selectedContext) {
      const [type, id] = selectedContext.split('_');
      const numericId = parseInt(id);
      
      const isValid = type === 'LAB' 
        ? labMemberships.some(l => l.labId === numericId)
        : teamMemberships.some(t => t.teamId === numericId);
      
      if (!isValid) {
        console.log('NUCLEAR EFFECT: Clearing invalid selectedContext:', selectedContext);
        setSelectedContext('');
      }
    }
  }, [hasValidData, labMemberships, teamMemberships, selectedContext]);

  // Selection made - no need to close dropdown with HTML select

  const loadUserMemberships = async () => {
    if (!username) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('jwtToken');
      
              const response = await fetch('http://localhost:12001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log('Profile data received:', profileData);
        
        if (profileData.labMemberships && Array.isArray(profileData.labMemberships)) {
          const activeLabs = profileData.labMemberships.filter((lab: any) => lab.isActive);
          console.log('Active labs loaded:', activeLabs);
          console.log('Lab memberships count:', activeLabs.length);
          setLabMemberships(activeLabs);
        } else {
          console.log('No lab memberships found in profile data');
          setLabMemberships([]);
        }
        
        if (profileData.teamMemberships && Array.isArray(profileData.teamMemberships)) {
          const activeTeams = profileData.teamMemberships.filter((team: any) => team.isActive);
          console.log('Active teams loaded:', activeTeams);
          console.log('Team memberships count:', activeTeams.length);
          setTeamMemberships(activeTeams);
        } else {
          console.log('No team memberships found in profile data');
          setTeamMemberships([]);
        }
      } else {
        console.error('Failed to load profile data:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }

    } catch (err) {
      console.error('Error loading memberships:', err);
      setError('Failed to load lab/team memberships');
    } finally {
      setLoading(false);
    }
  };

  const loadContextStats = async (contextType: string, contextId: number) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const endpoint = contextType === 'LAB' 
        ? `http://localhost:12001/api/auth/labs/${contextId}/file-stats`
        : `http://localhost:12001/api/auth/teams/${contextId}/file-stats`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Username': username || '',
        },
      });

      if (response.ok) {
        const stats = await response.json();
        setContextStats(stats);
      }
    } catch (err) {
      console.error('Error loading context stats:', err);
    }
  };

  const handleContextChange = (event: any) => {
    const value = event.target.value;
    console.log('=== CONTEXT CHANGE START ===');
    console.log('Context change triggered with value:', value);
    console.log('Current selectedContext before change:', selectedContext);
    console.log('Available labMemberships:', labMemberships);
    console.log('Available teamMemberships:', teamMemberships);
    console.log('Event object:', event);
    console.log('Event target:', event.target);
    console.log('Event target value:', event.target.value);
    
    // Ensure value is a string and not empty
    const stringValue = String(value || '');
    console.log('Normalized value:', stringValue);
    
    // Set selectedContext immediately to ensure proper display
    console.log('About to set selectedContext to:', stringValue);
    setSelectedContext(stringValue);
    console.log('setSelectedContext called with:', stringValue);

    if (value === '') {
      console.log('Clearing context');
      onContextChange(null);
      return;
    }

    const [type, id] = value.split('_');
    const numericId = parseInt(id);
    console.log('Parsed type:', type, 'id:', numericId);

    if (type === 'LAB') {
      const lab = labMemberships.find(l => l.labId === numericId);
      console.log('Found lab for selection:', lab);
      if (lab) {
        const context = {
          type: 'LAB' as const,
          id: lab.labId,
          name: lab.labName,
          code: lab.labCode,
          role: lab.roleInLab,
        };
        console.log('Setting LAB context:', context);
        console.log('Calling onContextChange with:', context);
        
        onContextChange(context);
        console.log('onContextChange called successfully');
        console.log('=== CONTEXT CHANGE END ===');
        
        // Load context statistics - temporarily disabled due to backend issue
        // loadContextStats('LAB', lab.labId);
      } else {
        console.error('Lab not found for ID:', numericId);
        // Don't set selectedContext if lab not found
      }
    } else if (type === 'TEAM') {
      const team = teamMemberships.find(t => t.teamId === numericId);
      console.log('Found team for selection:', team);
      if (team) {
        const context = {
          type: 'TEAM' as const,
          id: team.teamId,
          name: team.teamName,
          code: team.teamIdCode,
          role: team.roleInTeam,
        };
        console.log('Setting TEAM context:', context);
        
        onContextChange(context);
        // Load context statistics - temporarily disabled due to backend issue
        // loadContextStats('TEAM', team.teamId);
      } else {
        console.error('Team not found for ID:', numericId);
        // Don't set selectedContext if team not found
      }
    }
  };

  const getContextIcon = (type: 'LAB' | 'TEAM') => {
    return type === 'LAB' ? <Business /> : <Group />;
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('PI') || role.includes('Leader')) {
      return <Science color="primary" />;
    }
    if (role.includes('Student')) {
      return <School color="secondary" />;
    }
    return <Group color="info" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" ml={1}>
          Loading lab/team memberships...
        </Typography>
      </Box>
    );
  }

  // Don't render the select if we don't have any memberships yet
  if (labMemberships.length === 0 && teamMemberships.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" ml={1}>
          Loading lab/team memberships...
        </Typography>
      </Box>
    );
  }

  // Ensure we have valid data before rendering the Select
  if (!hasValidData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" ml={1}>
          Loading lab/team memberships...
        </Typography>
      </Box>
    );
  }

  // NUCLEAR OPTION: Only render when everything is absolutely ready
  const totalOptions = labMemberships.length + teamMemberships.length;
  const hasOptions = totalOptions > 0;
  const hasStableData = hasValidData && hasOptions;
  
  // Validate that selectedContext exists in our data if it's set
  const isValidSelectedContext = selectedContext ? (() => {
    const [type, id] = selectedContext.split('_');
    const numericId = parseInt(id);
    
    if (type === 'LAB') {
      return labMemberships.some(l => l.labId === numericId);
    } else if (type === 'TEAM') {
      return teamMemberships.some(t => t.teamId === numericId);
    }
    return false;
  })() : true;

  console.log('NUCLEAR CHECK:', {
    hasValidData,
    hasOptions,
    hasStableData,
    totalOptions,
    selectedContext,
    currentContext,
    isValidSelectedContext,
    labMemberships: labMemberships.map(l => ({ id: l.labId, name: l.labName })),
    teamMemberships: teamMemberships.map(t => ({ id: t.teamId, name: t.teamName }))
  });

  // Don't render anything until we have stable data
  if (!hasStableData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" ml={1}>
          Loading lab/team memberships...
        </Typography>
      </Box>
    );
  }

  // Clear invalid selectedContext
  if (selectedContext && !isValidSelectedContext) {
    console.log('Clearing invalid selectedContext:', selectedContext);
    setSelectedContext('');
  }

  // Log data status
  console.log('Has valid data:', hasValidData, 'Labs:', labMemberships.length, 'Teams:', teamMemberships.length);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const totalMemberships = labMemberships.length + teamMemberships.length;

  if (totalMemberships === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        You are not a member of any labs or teams. Please contact your administrator to be added to a lab or team.
      </Alert>
    );
  }

  return (
    <Paper sx={{ 
      p: 3, 
      mb: 2, 
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0'
    }}>
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        fontWeight: 600,
        color: '#1976d2',
        mb: 2
      }}>
        <Business color="primary" />
        Lab/Team Context
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ 
        mb: 3,
        lineHeight: 1.6,
        color: '#666'
      }}>
        Choose which lab or team you want to work in. Files will be uploaded in the context of your selected lab/team.
      </Typography>

      <Box sx={{ position: 'relative' }}>
        {!selectedContext && (
          <Typography 
            variant="body2" 
            sx={{ 
              position: 'absolute',
              top: '12px',
              left: '16px',
              color: '#666',
              pointerEvents: 'none',
              zIndex: 1,
              fontSize: '14px'
            }}
          >
            Select Lab/Team Context
          </Typography>
        )}
        <select
          value={selectedContext}
          onChange={handleContextChange}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            outline: 'none',
            position: 'relative',
            zIndex: 2
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#1976d2';
            e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
          }}
          key={`select-${selectedContext}-${labMemberships.length}-${teamMemberships.length}`}
        >
          <option value="">No context selected</option>
          
          {labMemberships.length > 0 && (
            <>
              <optgroup label="Labs">
                {labMemberships.map((lab) => (
                  <option key={`LAB_${lab.labId}`} value={`LAB_${lab.labId}`}>
                    {lab.labName} ({lab.labCode}) - {lab.roleInLab}
                  </option>
                ))}
              </optgroup>
            </>
          )}

          {teamMemberships.length > 0 && (
            <>
              <optgroup label="Teams">
                {teamMemberships.map((team) => (
                  <option key={`TEAM_${team.teamId}`} value={`TEAM_${team.teamId}`}>
                    {team.teamName} ({team.teamIdCode}) - {team.roleInTeam}
                  </option>
                ))}
              </optgroup>
            </>
          )}
        </select>
      </Box>

      {/* File Statistics - shown only when context is selected */}
      {currentContext && contextStats && (
        <Box sx={{ 
          mt: 3, 
          p: 3, 
          bgcolor: '#f8f9fa', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: '#e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="subtitle2" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            fontWeight: 'bold',
            mb: 1
          }}>
            <Analytics color="primary" />
            File Statistics for {currentContext.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`${contextStats.fileCount || 0} files`}
              size="small"
              color="primary"
            />
            <Chip 
              label={`${formatFileSize(contextStats.totalFileSize || 0)}`}
              size="small"
              color="primary"
            />
            {contextStats.lastFileUpload && (
              <Chip 
                label={`Last: ${new Date(contextStats.lastFileUpload).toLocaleDateString()}`}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default LabTeamContextSelector; 