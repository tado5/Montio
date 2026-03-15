import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import CompanyDetail from './pages/CompanyDetail'
import CompanyAdminDashboard from './pages/CompanyAdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
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
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

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
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<DashboardRedirect />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
