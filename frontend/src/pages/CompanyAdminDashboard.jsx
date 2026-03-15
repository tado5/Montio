import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'

const CompanyAdminDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Company Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Spravujte svoju firmu</p>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-green-200 dark:border-gray-700">
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg mb-6 transform hover:scale-105 transition-all duration-200">
              <h2 className="text-2xl font-black">
                🏢 Vitajte v Company Admin dashboarde!
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-8 font-medium text-lg">
              Ste prihlásený ako administrátor firmy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {/* Placeholder cards for future features */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl p-6 text-gray-600 dark:text-gray-300 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Dashboard</h3>
                  <p className="text-sm mb-3">KPI metriky a prehľad</p>
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 4
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-purple-300 rounded-2xl p-6 text-gray-600 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-4xl mb-3">📅</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Kalendár</h3>
                  <p className="text-sm mb-3">Plánovanie zákaziek</p>
                  <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 4
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-orange-300 rounded-2xl p-6 text-gray-600 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-4xl mb-3">🔧</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Typy montáží</h3>
                  <p className="text-sm mb-3">Správa typov a checklistov</p>
                  <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 4
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-green-300 rounded-2xl p-6 text-gray-600 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Zákazky</h3>
                  <p className="text-sm mb-3">Workflow obhliadka → faktúra</p>
                  <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 5
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-indigo-300 rounded-2xl p-6 text-gray-600 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Zamestnanci</h3>
                  <p className="text-sm mb-3">Správa zamestnancov</p>
                  <span className="inline-block bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 7
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-yellow-300 rounded-2xl p-6 text-gray-600 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Faktúry</h3>
                  <p className="text-sm mb-3">Fakturácia a platby</p>
                  <span className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 6
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300 font-semibold">
                ℹ️ Momentálne je implementovaná len FÁZA 2 (Autentifikácia).
                Ďalšie funkcie budú pridané v FÁZE 3-9.
              </p>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}

export default CompanyAdminDashboard
