import CompanyAdminLayout from '../components/CompanyAdminLayout'
import Calendar from '../components/Calendar'

const CalendarPage = () => {
  return (
    <CompanyAdminLayout
      title="SCHEDULE CENTER"
      subtitle="Order planning and timeline"
      showSearch={false}
    >
      <Calendar />
    </CompanyAdminLayout>
  )
}

export default CalendarPage
