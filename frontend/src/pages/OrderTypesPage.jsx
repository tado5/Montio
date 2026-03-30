import CompanyAdminLayout from '../components/CompanyAdminLayout'
import OrderTypesManager from '../components/OrderTypesManager'

const OrderTypesPage = () => {
  return (
    <CompanyAdminLayout
      title="OPERATIONS CONFIG"
      subtitle="Installation types and checklists"
      showSearch={false}
    >
      <OrderTypesManager />
    </CompanyAdminLayout>
  )
}

export default OrderTypesPage
