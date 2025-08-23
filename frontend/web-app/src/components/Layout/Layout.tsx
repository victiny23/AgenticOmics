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
        if (labInvitationsRes.ok) {
          const labInvitations = await labInvitationsRes.json()
          console.log('🔍 All lab invitations:', labInvitations)
          console.log('🔍 Lab invitation statuses:', labInvitations.map((inv: any) => inv.status))
          const pendingLabInvitations = labInvitations.filter((inv: any) => 
            inv.status === 'PENDING' || inv.status === 'pending' || inv.status === 'Pending'
          )
          count += pendingLabInvitations.length
          console.log('🔍 Pending lab invitations:', pendingLabInvitations)
          console.log('🔍 Pending lab invitation details:', pendingLabInvitations.map((inv: any) => ({
            id: inv.id,
            from: inv.fromUsername,
            to: inv.toUsername,
            lab: inv.labName,
            role: inv.invitedRole,
            status: inv.status,
            message: inv.invitationMessage
          })))
        }
        if (teamInvitationsRes.ok) {
          const teamInvitations = await teamInvitationsRes.json()
          console.log('🔍 All team invitations:', teamInvitations)
          console.log('🔍 Team invitation statuses:', teamInvitations.map((inv: any) => inv.status))
          const pendingTeamInvitations = teamInvitations.filter((inv: any) => 
            inv.status === 'PENDING' || inv.status === 'pending' || inv.status === 'Pending'
          )
          count += pendingTeamInvitations.length
          console.log('🔍 Pending team invitations:', pendingTeamInvitations)
          console.log('🔍 Pending team invitation details:', pendingTeamInvitations.map((inv: any) => ({
            id: inv.id,
            from: inv.fromUsername,
            to: inv.toUsername,
            team: inv.teamName,
            role: inv.invitedRole,
            status: inv.status,
            message: inv.invitationMessage
          })))
        }

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
    // Redirect to membership page with My Invitations tab selected
    navigate('/membership?tab=1')
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
      if (labInvitationsRes.ok) {
        const labInvitations = await labInvitationsRes.json()
        const pendingLabInvitations = labInvitations.filter((inv: any) => inv.status === 'PENDING')
        count += pendingLabInvitations.length
        console.log('🔄 Lab invitations:', labInvitations)
        console.log('🔄 Pending lab invitations:', pendingLabInvitations)
      }
      if (teamInvitationsRes.ok) {
        const teamInvitations = await teamInvitationsRes.json()
        const pendingTeamInvitations = teamInvitations.filter((inv: any) => inv.status === 'PENDING')
        count += pendingTeamInvitations.length
        console.log('🔄 Team invitations:', teamInvitations)
        console.log('🔄 Pending team invitations:', pendingTeamInvitations)
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
        
        {/* User Management for PI users (not Super Admin) */}
        {role === 'Lab PI' && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation('/admin/users')}
              sx={{
                borderRadius: 2,
                mx: 1,
                backgroundColor: location.pathname === '/admin/users' ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === '/admin/users' 
                    ? 'rgba(25, 118, 210, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                },
                border: location.pathname === '/admin/users' ? '1px solid rgba(25, 118, 210, 0.5)' : '1px solid transparent',
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === '/admin/users' ? '#42a5f5' : '#b0b0b0',
                  minWidth: 40,
                }}
              >
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText
                primary="User Management"
                secondary="Manage user accounts and permissions"
                primaryTypographyProps={{
                  sx: {
                    color: location.pathname === '/admin/users' ? 'white' : '#e0e0e0',
                    fontWeight: location.pathname === '/admin/users' ? 600 : 400,
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