import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AppsPage from './pages/AppsPage'
import ExtensionLandingPage from './pages/ExtensionLandingPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/apps" element={<AppsPage />} />
      <Route path="/apps/:slug" element={<ExtensionLandingPage />} />
      <Route path="/privacy-policy/:slug" element={<PrivacyPolicyPage />} />
      <Route path="/extensions" element={<Navigate to="/apps" replace />} />
    </Routes>
  )
}
