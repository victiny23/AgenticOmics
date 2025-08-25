
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import WelcomePage from './pages/WelcomePage'
import DashboardPage from './pages/DashboardPage'
import DataPage from './pages/DataPage'
import EDAPage from './pages/EDAPage'
import ModelPage from './pages/ModelPage'
import PipelinePage from './pages/PipelinePage'
import ResultPage from './pages/ResultPage'
import LoginPage from './pages/LoginPage'
import RestrictedDashboardPage from './pages/RestrictedDashboardPage'
import RestrictedAccessPage from './pages/RestrictedAccessPage'
import ActivationRequestsPage from './pages/ActivationRequestsPage'
import UserManagementPage from './pages/UserManagementPage'
import SystemAdministrationPage from './pages/SystemAdministrationPage'
import SettingsPage from './pages/SettingsPage'
import MembershipManagementPage from './pages/MembershipManagementPage'

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/restricted-access" element={<RestrictedAccessPage />} />
          
          {/* Protected routes - with layout */}
          <Route path="/welcome" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/restricted" element={
            <ProtectedRoute requireActive={false}>
              <RestrictedDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <Layout>
                <UserManagementPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/activation-requests" element={
            <ProtectedRoute>
              <Layout>
                <ActivationRequestsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/system" element={
            <ProtectedRoute>
              <Layout>
                <SystemAdministrationPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/membership" element={
            <ProtectedRoute>
              <Layout>
                <MembershipManagementPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/data" element={
            <ProtectedRoute>
              <Layout>
                <DataPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/eda" element={
            <ProtectedRoute>
              <Layout>
                <EDAPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/model" element={
            <ProtectedRoute>
              <Layout>
                <ModelPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/pipeline" element={
            <ProtectedRoute>
              <Layout>
                <PipelinePage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/result" element={
            <ProtectedRoute>
              <Layout>
                <ResultPage />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Box>
    </AuthProvider>
  )
}

export default App