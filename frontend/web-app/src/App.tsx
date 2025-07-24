
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout/Layout'
import WelcomePage from './pages/WelcomePage'
import DataPage from './pages/DataPage'
import EDAPage from './pages/EDAPage'
import PipelinePage from './pages/PipelinePage'
import ResultPage from './pages/ResultPage'

function App() {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/eda" element={<EDAPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </Layout>
    </Box>
  )
}

export default App