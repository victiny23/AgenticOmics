import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Storage as DataIcon,
  Analytics as EDAIcon,
  Psychology as ModelIcon,
  AccountTree as PipelineIcon,
  Assessment as ResultIcon,
  AdminPanelSettings,
  AccountCircle,
  Settings,
  Logout,
  NotificationsActive,
  Group as GroupIcon,
  Mail as MailIcon,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

const drawerWidth = 280

interface LayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  text: string
  icon: React.ReactElement
  path: string
  description: string
}

const navigationItems: NavigationItem[] = [
  {
    text: 'Welcome',
    icon: <HomeIcon />,
    path: '/welcome',
    description: 'Platform overview and getting started',
  },
  {
    text: 'Data',
    icon: <DataIcon />,
    path: '/data',
    description: 'Upload and manage your omics data',
  },
  {
    text: 'EDA',
    icon: <EDAIcon />,
    path: '/eda',
    description: 'Exploratory data analysis and visualization',
  },
  {
    text: 'Model',
    icon: <ModelIcon />,
    path: '/model',
    description: 'Build and train machine learning models',
  },
  {
    text: 'Pipeline',
    icon: <PipelineIcon />,
    path: '/pipeline',
    description: 'Build and manage analysis pipelines',
  },
  {
    text: 'Results',
    icon: <ResultIcon />,
    path: '/result',
    description: 'View and export analysis results',
  },
  {
    text: 'Membership',
    icon: <GroupIcon />,
    path: '/membership',
    description: 'Manage lab and team memberships, requests, and invitations',
  },
]

// Admin navigation items (shown only to Lab PIs, Team Leaders, and Super Admins)
const adminNavigationItems: NavigationItem[] = [
  {
    text: 'Unified Management',
    icon: <GroupIcon />,
    path: '/unified-management',
    description: 'User management and member management in one place',
  },
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const { isAuthenticated, username, role, photoUrl, logout, getSecurePhotoUrl } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }
  
  const goToSettings = () => {
    handleProfileMenuClose()
    navigate('/settings')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  const handleLogin = () => {
    handleProfileMenuClose()
    navigate('/login')
  }
  const handleLogout = () => {
    logout()
    handleProfileMenuClose()
    navigate('/')
  }

  // Fetch notification count
  useEffect(() => {
    console.log('🔔 Notification useEffect triggered, isAuthenticated:', isAuthenticated)
            const fetchNotificationCount = async () => {
                  if (!isAuthenticated) {
          setNotificationCount(0)
          return
        }

        try {
          const token = localStorage.getItem('jwtToken')
          if (!token) {
            return
          }

          const [labInvitationsRes, teamInvitationsRes] = await Promise.all([
            fetch('/api/auth/lab-invitations/my-invitations', {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('/api/auth/team-invitations/my-invitations', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ])

        let count = 0
        
        // Check for invitations that need user response (PENDING status)
        if (labInvitationsRes.ok) {
          const labInvitations = await labInvitationsRes.json()
          console.log('🔍 All lab invitations:', labInvitations)
          console.log('🔍 Lab invitation statuses:', labInvitations.map((inv: any) => inv.status))
          const pendingLabInvitations = labInvitations.filter((inv: any) => 
            inv.status === 'PENDING' || inv.status === 'pending' || inv.status === 'Pending'
          )
          count += pendingLabInvitations.length
          console.log('🔍 Pending lab invitations (for response):', pendingLabInvitations)
        }
        if (teamInvitationsRes.ok) {
          const teamInvitations = await teamInvitationsRes.json()
          console.log('🔍 All team invitations:', teamInvitations)
          console.log('🔍 Team invitation statuses:', teamInvitations.map((inv: any) => inv.status))
          const pendingTeamInvitations = teamInvitations.filter((inv: any) => 
            inv.status === 'PENDING' || inv.status === 'pending' || inv.status === 'Pending'
          )
          count += pendingTeamInvitations.length
          console.log('🔍 Pending team invitations (for response):', pendingTeamInvitations)
        }

        // Check for invitations that need PI/Leader approval (PENDING_APPROVAL status)
        // Only check if user is a PI or Leader
        const userRole = localStorage.getItem('role')
        console.log('🔍 Current user role for notification:', userRole)
        if (userRole === 'Lab PI' || userRole === 'Super Admin') {
          try {
            const username = localStorage.getItem('username')
            if (username) {
              const pendingLabApprovalsRes = await fetch('/api/auth/lab-invitations/pending-approvals', {
                headers: { 
                  'X-Username': username,
                  'Authorization': `Bearer ${token}`
                }
              })
              if (pendingLabApprovalsRes.ok) {
                const pendingLabApprovals = await pendingLabApprovalsRes.json()
                const pendingApprovalCount = pendingLabApprovals.filter((inv: any) => 
                  inv.status === 'PENDING_APPROVAL' || inv.status === 'pending_approval' || inv.status === 'Pending_Approval' ||
                  inv.status === 'PENDING' || inv.status === 'pending' || inv.status === 'Pending'
                ).length
                count += pendingApprovalCount
                console.log('🔍 Pending lab approvals (for PI):', pendingApprovalCount)
              }
            }
          } catch (error) {
            console.error('Error fetching pending lab approvals:', error)
          }
        }

        if (userRole === 'Team Leader' || userRole === 'Super Admin') {
          try {
            const username = localStorage.getItem('username')
            if (username) {
              const pendingTeamApprovalsRes = await fetch('/api/auth/team-invitations/pending-approvals', {
                headers: { 
                  'X-Username': username,
                  'Authorization': `Bearer ${token}`
                }
              })
              if (pendingTeamApprovalsRes.ok) {
                const pendingTeamApprovals = await pendingTeamApprovalsRes.json()
                const pendingApprovalCount = pendingTeamApprovals.filter((inv: any) => 
                  inv.status === 'PENDING_APPROVAL' || inv.status === 'pending_approval' || inv.status === 'Pending_Approval' ||
                  inv.status === 'PENDING' || inv.status === 'pending' || inv.status === 'Pending'
                ).length
                count += pendingApprovalCount
                console.log('🔍 Pending team approvals (for Leader):', pendingApprovalCount)
              }
            }
          } catch (error) {
            console.error('Error fetching pending team approvals:', error)
          }
        }

        console.log('🔍 Setting notification count to:', count)
        setNotificationCount(count)
      } catch (error) {
        console.error('Error fetching notification count:', error)
      }
    }

            fetchNotificationCount()
        // Refresh every 30 seconds
        const interval = setInterval(fetchNotificationCount, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleNotificationClick = () => {
    // Redirect to membership page with appropriate tab selected
    const userRole = localStorage.getItem('role')
    if (userRole === 'Lab PI' || userRole === 'Team Leader' || userRole === 'Super Admin') {
      // For PIs/Leaders, redirect to Pending Approvals tab
      navigate('/membership?tab=2')
    } else {
      // For regular users, redirect to My Invitations tab
      navigate('/membership?tab=1')
    }
  }

  const forceRefreshNotifications = async () => {
    console.log('🔄 Force refreshing notifications...')
    const token = localStorage.getItem('jwtToken')
    if (!token) return

    try {
      const [labInvitationsRes, teamInvitationsRes] = await Promise.all([
        fetch('/api/auth/lab-invitations/my-invitations', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/team-invitations/my-invitations', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      let count = 0
      
      // Check for invitations that need user response (PENDING status)
      if (labInvitationsRes.ok) {
        const labInvitations = await labInvitationsRes.json()
        const pendingLabInvitations = labInvitations.filter((inv: any) => inv.status === 'PENDING')
        count += pendingLabInvitations.length
        console.log('🔄 Lab invitations:', labInvitations)
        console.log('🔄 Pending lab invitations (for response):', pendingLabInvitations)
      }
      if (teamInvitationsRes.ok) {
        const teamInvitations = await teamInvitationsRes.json()
        const pendingTeamInvitations = teamInvitations.filter((inv: any) => inv.status === 'PENDING')
        count += pendingTeamInvitations.length
        console.log('🔄 Team invitations:', teamInvitations)
        console.log('🔄 Pending team invitations (for response):', pendingTeamInvitations)
      }

      // Check for invitations that need PI/Leader approval (PENDING_APPROVAL status)
      const userRole = localStorage.getItem('role')
      if (userRole === 'Lab PI' || userRole === 'Super Admin') {
        try {
          const pendingLabApprovalsRes = await fetch('/api/auth/lab-invitations/pending-approvals', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (pendingLabApprovalsRes.ok) {
            const pendingLabApprovals = await pendingLabApprovalsRes.json()
            const pendingApprovalCount = pendingLabApprovals.filter((inv: any) => inv.status === 'PENDING_APPROVAL').length
            count += pendingApprovalCount
            console.log('🔄 Pending lab approvals (for PI):', pendingApprovalCount)
          }
        } catch (error) {
          console.error('Error fetching pending lab approvals:', error)
        }
      }

      if (userRole === 'Team Leader' || userRole === 'Super Admin') {
        try {
          const pendingTeamApprovalsRes = await fetch('/api/auth/team-invitations/pending-approvals', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (pendingTeamApprovalsRes.ok) {
            const pendingTeamApprovals = await pendingTeamApprovalsRes.json()
            const pendingApprovalCount = pendingTeamApprovals.filter((inv: any) => inv.status === 'PENDING_APPROVAL').length
            count += pendingApprovalCount
            console.log('🔄 Pending team approvals (for Leader):', pendingApprovalCount)
          }
        } catch (error) {
          console.error('Error fetching pending team approvals:', error)
        }
      }

      console.log('🔄 Total notification count:', count)
      setNotificationCount(count)
    } catch (error) {
      console.error('Error force refreshing notifications:', error)
    }
  }

  const drawer = (
    <Box>
      {/* Logo and Title */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: '#2c2c2c',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #1976d2, #9c27b0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          🧬
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            AgenticOmics
          </Typography>
          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
            AI-Powered Analysis
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#333' }} />

      {/* Navigation Items */}
      <List sx={{ px: 1, py: 2 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (location.pathname === '/' && item.path === '/welcome')
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: isActive ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? 'rgba(25, 118, 210, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                  border: isActive ? '1px solid rgba(25, 118, 210, 0.5)' : '1px solid transparent',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#42a5f5' : '#b0b0b0',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  secondary={item.description}
                  primaryTypographyProps={{
                    sx: {
                      color: isActive ? 'white' : '#e0e0e0',
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      color: '#888',
                      fontSize: '0.75rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
        
        {/* Admin Navigation Items for Lab PIs, Team Leaders, and Super Admins */}
        {(role === 'Lab PI' || role === 'Team Leader' || role === 'Super Admin') && (
          <>
            {adminNavigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      backgroundColor: isActive ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
                      '&:hover': {
                        backgroundColor: isActive 
                          ? 'rgba(25, 118, 210, 0.3)' 
                          : 'rgba(255, 255, 255, 0.1)',
                      },
                      border: isActive ? '1px solid rgba(25, 118, 210, 0.5)' : '1px solid transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? '#42a5f5' : '#b0b0b0',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      secondary={item.description}
                      primaryTypographyProps={{
                        sx: {
                          color: isActive ? 'white' : '#e0e0e0',
                          fontWeight: isActive ? 600 : 400,
                        },
                      }}
                      secondaryTypographyProps={{
                        sx: {
                          color: '#888',
                          fontSize: '0.75rem',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </>
        )}
        
        {/* System Administration for Super Admin */}
        {role === 'Super Admin' && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation('/admin/system')}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: location.pathname === '/admin/system' ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: location.pathname === '/admin/system' 
                      ? 'rgba(25, 118, 210, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                  border: location.pathname === '/admin/system' ? '1px solid rgba(25, 118, 210, 0.5)' : '1px solid transparent',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === '/admin/system' ? '#42a5f5' : '#b0b0b0',
                    minWidth: 40,
                  }}
                >
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText
                  primary="System Administration"
                  secondary="Manage all users, labs, and teams"
                  primaryTypographyProps={{
                    sx: {
                      color: location.pathname === '/admin/system' ? 'white' : '#e0e0e0',
                      fontWeight: location.pathname === '/admin/system' ? 600 : 400,
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      color: '#888',
                      fontSize: '0.75rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
        )}
        

        
        {/* Activation Requests for PI users and Super Admin */}
        {(role === 'Lab PI' || role === 'Super Admin') && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation('/admin/activation-requests')}
              sx={{
                borderRadius: 2,
                mx: 1,
                backgroundColor: location.pathname === '/admin/activation-requests' ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === '/admin/activation-requests' 
                    ? 'rgba(25, 118, 210, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                },
                border: location.pathname === '/admin/activation-requests' ? '1px solid rgba(25, 118, 210, 0.5)' : '1px solid transparent',
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === '/admin/activation-requests' ? '#42a5f5' : '#b0b0b0',
                  minWidth: 40,
                }}
              >
                <NotificationsActive />
              </ListItemIcon>
              <ListItemText
                primary="Activation Requests"
                secondary="Review and approve account activation requests"
                primaryTypographyProps={{
                  sx: {
                    color: location.pathname === '/admin/activation-requests' ? 'white' : '#e0e0e0',
                    fontWeight: location.pathname === '/admin/activation-requests' ? 600 : 400,
                  },
                }}
                secondaryTypographyProps={{
                  sx: {
                    color: '#888',
                    fontSize: '0.75rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider sx={{ borderColor: '#333', mx: 2 }} />

      {/* User Info */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}
                            src={getSecurePhotoUrl(photoUrl) || undefined}
          >
            {!photoUrl && (username ? username.charAt(0) : 'U')}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
              {username || 'Demo User'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
              {role || (username ? 'Researcher' : 'Guest')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'black',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => 
              item.path === location.pathname || 
              (location.pathname === '/' && item.path === '/welcome')
            )?.text || 'AgenticOmics'}
          </Typography>

          {/* Notification Icon */}
          {console.log('🔍 Notification icon render - isAuthenticated:', isAuthenticated, 'count:', notificationCount)}
          {isAuthenticated && (
            <IconButton
              size="large"
              edge="end"
              aria-label="notifications"
              onClick={handleNotificationClick}
              onContextMenu={(e) => {
                e.preventDefault()
                forceRefreshNotifications()
              }}
              color="inherit"
              sx={{ mr: 1, position: 'relative' }}
            >
              <MailIcon />
              {notificationCount > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: '#f44336',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Box>
              )}

            </IconButton>
          )}

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {isAuthenticated ? (
              <Avatar 
                src={photoUrl ? getSecurePhotoUrl(photoUrl) || undefined : undefined} 
                sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}
              >
                {!photoUrl && (username ? username.charAt(0).toUpperCase() : 'U')}
              </Avatar>
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={goToSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        {isAuthenticated ? (
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        ) : (
          <MenuItem onClick={handleLogin}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Login
          </MenuItem>
        )}
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1e1e1e',
              color: 'white',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1e1e1e',
              color: 'white',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          overflowX: 'hidden',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout