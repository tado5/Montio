import { useAuth } from '../context/AuthContext'
import SuperAdminLayout from './SuperAdminLayout'
import CompanyAdminLayout from './CompanyAdminLayout'
import EmployeeLayout from './EmployeeLayout'

/**
 * Dynamic Layout component
 * Automatically selects the correct layout based on user role
 *
 * Usage:
 * <DynamicLayout title="Profile" subtitle="User settings" showSearch>
 *   <YourPageContent />
 * </DynamicLayout>
 */
const DynamicLayout = ({ children, title, subtitle, showSearch = false }) => {
  const { user } = useAuth()

  // Select layout based on user role
  const LayoutComponent =
    user?.role === 'superadmin' ? SuperAdminLayout :
    user?.role === 'companyadmin' ? CompanyAdminLayout :
    user?.role === 'employee' ? EmployeeLayout :
    CompanyAdminLayout // fallback

  return (
    <LayoutComponent
      title={title}
      subtitle={subtitle}
      showSearch={showSearch}
    >
      {children}
    </LayoutComponent>
  )
}

export default DynamicLayout
