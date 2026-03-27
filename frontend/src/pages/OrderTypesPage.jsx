import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'
import NotificationBell from '../components/NotificationBell'
import Footer from '../components/Footer'
import OrderTypesManager from '../components/OrderTypesManager'

const OrderTypesPage = () => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-6 py-2 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white">Typy montáží</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Správa typov a checklistov</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <OrderTypesManager />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default OrderTypesPage
