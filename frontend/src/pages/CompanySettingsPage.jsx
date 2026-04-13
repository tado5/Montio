import CompanyAdminLayout from '../components/CompanyAdminLayout'
import CompanySettingsManager from '../components/CompanySettingsManager'

const CompanySettingsPage = () => {
  return (
    <CompanyAdminLayout
      title="COMPANY CONFIG"
      subtitle="Manage company information and settings"
      showSearch={false}
    >
      <CompanySettingsManager />
    </CompanyAdminLayout>
  )
}

export default CompanySettingsPage
