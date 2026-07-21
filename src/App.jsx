import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import RoutePageViews from './components/RoutePageViews'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import AppsPage from './pages/AppsPage'
import ExtensionLandingPage from './pages/ExtensionLandingPage'
import PluginsIndexPage from './pages/PluginsIndexPage'
import PluginLandingPage from './pages/PluginLandingPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import SaveDirectlyToDrivePage from './pages/SaveDirectlyToDrivePage'
import BlogIndexPage from './pages/BlogIndexPage'
import BlogPostPage from './pages/BlogPostPage'
import StatsPage from './pages/StatsPage'
import ThankYouPage from './pages/ThankYouPage'
import UninstallPage from './pages/UninstallPage'
import WorkPage from './pages/WorkPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import { pluginPath, pluginsIndexPath } from './utils/plugins'

function PluginSlugRedirect() {
  const { slug } = useParams()
  return <Navigate to={pluginPath(slug)} replace />
}

function AppRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="CC__page-enter">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/apps/:slug" element={<ExtensionLandingPage />} />
        <Route path="/davinci-resolve-plugins" element={<PluginsIndexPage />} />
        <Route path="/davinci-resolve-plugins/:slug" element={<PluginLandingPage />} />
        <Route path="/plugins" element={<Navigate to={pluginsIndexPath()} replace />} />
        <Route path="/plugins/:slug" element={<PluginSlugRedirect />} />
        <Route path="/privacy-policy/:slug" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service/:slug" element={<TermsOfServicePage />} />
        <Route path="/save-directly-to-drive" element={<SaveDirectlyToDrivePage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/live-stats" element={<StatsPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/uninstall" element={<UninstallPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/stats" element={<Navigate to="/live-stats" replace />} />
        <Route path="/extensions" element={<Navigate to="/apps" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <RoutePageViews />
      <AppRoutes />
    </>
  )
}
