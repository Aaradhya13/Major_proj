import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import NewAnalysis from './pages/NewAnalysis.jsx'
import PatientDetails from './pages/PatientDetails.jsx'
import Patients from './pages/Patients.jsx'
import PredictionResult from './pages/PredictionResult.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          <Route path="analysis/new" element={<NewAnalysis />} />
          <Route
            path="new-analysis"
            element={<Navigate to="/analysis/new" replace />}
          />
          <Route path="analysis/:id" element={<PredictionResult />} />
          <Route path="history" element={<History />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

function NotFound() {
  return <h1>Not Found</h1>
}

export default App
