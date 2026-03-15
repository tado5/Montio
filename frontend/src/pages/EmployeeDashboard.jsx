import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'

const EmployeeDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Employee Portal</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Vaše úlohy a kalendár</p>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-orange-200 dark:border-gray-700">
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-2xl shadow-lg mb-6 transform hover:scale-105 transition-all duration-200">
              <h2 className="text-2xl font-black">
                👷 Vitajte v Employee portáli!
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-8 font-medium text-lg">
              Ste prihlásený ako zamestnanec.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto">
              {/* Placeholder cards for future features */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-blue-300 rounded-2xl p-8 text-gray-600 dark:text-gray-300 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-gray-200">Môj kalendár</h3>
                  <p className="text-sm mb-4">Prehľad priradených zákaziek</p>
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 7
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-green-300 rounded-2xl p-8 text-gray-600 dark:text-gray-300 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-gray-200">Moje úlohy</h3>
                  <p className="text-sm mb-4">Aktuálne montáže a checklists</p>
                  <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 7
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-purple-300 rounded-2xl p-8 text-gray-600 dark:text-gray-300 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-5xl mb-4">📸</div>
                  <h3 className="font-bold text-xl mb-3 text-gray-800">Fotky</h3>
                  <p className="text-sm mb-4">Nahrať fotky z montáže</p>
                  <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 5
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-700 border-2 border-dashed border-orange-300 rounded-2xl p-8 text-gray-600 dark:text-gray-300 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
                  <div className="text-5xl mb-4">🏖️</div>
                  <h3 className="font-bold text-xl mb-3 text-gray-800">Voľno</h3>
                  <p className="text-sm mb-4">Žiadosti o dovolenku</p>
                  <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    FÁZA 7
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border-2 border-orange-200 dark:border-orange-800 shadow-lg max-w-3xl mx-auto">
              <p className="text-sm text-orange-900 dark:text-orange-300 font-semibold mb-4">
                ℹ️ Momentálne je implementovaná len FÁZA 2 (Autentifikácia).
                Employee funkcie budú pridané v FÁZE 5 a 7.
              </p>

              <div className="mt-4 p-4 bg-white/80 dark:bg-gray-700/80 rounded-xl border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-bold mb-2">📝 Poznámka pre zamestnancov:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Nevidíte ceny zákaziek. Môžete len dokončovať priradené úlohy,
                  checklist položky a nahrávať fotky z montáží.
                </p>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}

export default EmployeeDashboard
