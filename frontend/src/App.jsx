import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import OnboardingWizard from './pages/OnboardingWizard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import CompanyDetail from './pages/CompanyDetail'
import CompanyAdminDashboard from './pages/CompanyAdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import CalendarPage from './pages/CalendarPage'
import OrderTypesPage from './pages/OrderTypesPage'
import OrdersPage from './pages/OrdersPage'
import CreateOrderPage from './pages/CreateOrderPage'
import OrderDetailPage from './pages/OrderDetailPage'
import EmployeesPage from './pages/EmployeesPage'
import CompanySettingsPage from './pages/CompanySettingsPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import ProtectedRoute from './components/ProtectedRoute'

// Dashboard redirect based on user role
const DashboardRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Načítavanie...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect based on role
  switch (user.role) {
    case 'superadmin':
      return <Navigate to="/superadmin" replace />
    case 'companyadmin':
      return <Navigate to="/company" replace />
    case 'employee':
      return <Navigate to="/employee" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register/:inviteToken" element={<OnboardingWizard />} />

            <Route
              path="/superadmin"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/superadmin/company/:id"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <CompanyDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company"
              element={
                <ProtectedRoute allowedRoles={['companyadmin']}>
                  <CompanyAdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company/calendar"
              element={
                <ProtectedRoute allowedRoles={['companyadmin', 'employee']}>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company/order-types"
              element={
                <ProtectedRoute allowedRoles={['companyadmin']}>
                  <OrderTypesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company/orders"
              element={
                <ProtectedRoute allowedRoles={['companyadmin', 'employee']}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company/orders/new"
              element={
                <ProtectedRoute allowedRoles={['companyadmin', 'employee']}>
                  <CreateOrderPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company/orders/:id"
              element={
                <ProtectedRoute allowedRoles={['companyadmin', 'employee']}>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company/employees"
              element={
                <ProtectedRoute allowedRoles={['companyadmin']}>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company/settings"
              element={
                <ProtectedRoute allowedRoles={['companyadmin']}>
                  <CompanySettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'companyadmin', 'employee']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'companyadmin', 'employee']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<DashboardRedirect />} />
            </Routes>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
