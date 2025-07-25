import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navigation from './components/Navigation'
import DataPage from './pages/DataPage'
import EDAPage from './pages/EDAPage'
import ModelPage from './pages/ModelPage'
import PipelinePage from './pages/PipelinePage'
import ResultPage from './pages/ResultPage'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<DataPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/eda" element={<EDAPage />} />
          <Route path="/model" element={<ModelPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App