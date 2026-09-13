import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PipelineMap from './pages/PipelineMap'
import Segments from './pages/Segments'
import SegmentDetail from './pages/SegmentDetail'
import RiskAssessment from './pages/RiskAssessment'
import Incidents from './pages/Incidents'
import Alerts from './pages/Alerts'
import ComingSoon from './pages/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<PipelineMap />} />
        <Route path="/segments" element={<Segments />} />
        <Route path="/segments/:id" element={<SegmentDetail />} />
        <Route path="/segments/:id/assessment" element={<RiskAssessment />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/reports" element={<ComingSoon title="Reports" />} />
        <Route path="/settings" element={<ComingSoon title="Settings" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
