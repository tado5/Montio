import CompanyAdminLayout from '../components/CompanyAdminLayout'
import EmployeesManager from '../components/EmployeesManager'

const EmployeesPage = () => {
  return (
    <CompanyAdminLayout
      title="TEAM CONTROL"
      subtitle="Employee management and access"
      showSearch={false}
    >
      <EmployeesManager />
    </CompanyAdminLayout>
  )
}

export default EmployeesPage
