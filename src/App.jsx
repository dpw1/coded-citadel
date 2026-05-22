import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import AppsPage from './pages/AppsPage'
import ExtensionLandingPage from './pages/ExtensionLandingPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'

function AppRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="CC__page-enter">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/apps/:slug" element={<ExtensionLandingPage />} />
        <Route path="/privacy-policy/:slug" element={<PrivacyPolicyPage />} />
        <Route path="/extensions" element={<Navigate to="/apps" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  )
}
