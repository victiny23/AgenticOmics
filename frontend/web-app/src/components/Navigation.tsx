import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
} from '@mui/material'
import {
  Storage as DataIcon,
  Analytics as AnalyticsIcon,
  ModelTraining as ModelIcon,
  AccountTree as PipelineIcon,
  Assessment as ResultIcon,
} from '@mui/icons-material'

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const getCurrentTab = () => {
    switch (location.pathname) {
      case '/data':
      case '/':
        return 0
      case '/eda':
        return 1
      case '/model':
        return 2
      case '/pipeline':
        return 3
      case '/result':
        return 4
      default:
        return 0
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/data')
        break
      case 1:
        navigate('/eda')
        break
      case 2:
        navigate('/model')
        break
      case 3:
        navigate('/pipeline')
        break
      case 4:
        navigate('/result')
        break
    }
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AgenticOmics
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={getCurrentTab()}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: 'white',
                },
              },
            }}
          >
            <Tab
              icon={<DataIcon />}
              label="Data"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<AnalyticsIcon />}
              label="EDA"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<ModelIcon />}
              label="Model"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<PipelineIcon />}
              label="Pipeline"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<ResultIcon />}
              label="Result"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navigation