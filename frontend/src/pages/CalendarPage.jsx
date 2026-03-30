import Layout from '../components/Layout'
import Calendar from '../components/Calendar'

const CalendarPage = () => {
  return (
    <Layout
      title="Kalendár"
      subtitle="Plánovanie zákaziek"
      showSearch={false}
    >
      <Calendar />
    </Layout>
  )
}

export default CalendarPage
