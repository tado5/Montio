import Layout from '../components/Layout'
import OrderTypesManager from '../components/OrderTypesManager'

const OrderTypesPage = () => {
  return (
    <Layout
      title="Typy montáží"
      subtitle="Správa typov a checklistov"
      showSearch={false}
    >
      <OrderTypesManager />
    </Layout>
  )
}

export default OrderTypesPage
