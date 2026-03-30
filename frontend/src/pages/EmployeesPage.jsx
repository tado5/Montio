import Layout from '../components/Layout'
import EmployeesManager from '../components/EmployeesManager'

const EmployeesPage = () => {
  return (
    <Layout
      title="Zamestnanci"
      subtitle="Správa zamestnancov a prístupov"
      showSearch={false}
    >
      <EmployeesManager />
    </Layout>
  )
}

export default EmployeesPage
