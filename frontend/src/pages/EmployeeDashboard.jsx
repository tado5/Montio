import { useAuth } from '../context/AuthContext'
import {
  Calendar,
  CheckSquare,
  Camera,
  Briefcase,
  Info
} from 'lucide-react'
import EmployeeLayout from '../components/EmployeeLayout'
import ReadOnlyBanner from '../components/ReadOnlyBanner'

const EmployeeDashboard = () => {
  const { user } = useAuth()

  return (
    <EmployeeLayout
      title="FIELD PORTAL"
      subtitle="Your tasks and schedule"
      showSearch={false}
    >
      {/* Read-Only Banner for Inactive Users */}
      <ReadOnlyBanner />

      <div className="card p-6 md:p-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-accent text-white px-6 py-3 rounded-xl shadow-soft mb-6">
              <Briefcase className="w-6 h-6" />
              <h2 className="text-xl md:text-2xl font-display font-bold">
                Vitajte v Employee portáli!
              </h2>
            </div>
            <p className="text-secondary mb-8 font-medium text-base md:text-lg">
              Ste prihlásený ako zamestnanec.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8 max-w-3xl mx-auto">
              {/* Placeholder cards for future features */}
              <div className="card-interactive border-2 border-dashed border-blue-300 dark:border-blue-700 p-6 md:p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg md:text-xl text-primary mb-3">Môj kalendár</h3>
                <p className="text-sm text-secondary mb-4">Prehľad priradených zákaziek</p>
                <span className="badge badge-info">
                  FÁZA 7
                </span>
              </div>

              <div className="card-interactive border-2 border-dashed border-accent-300 dark:border-accent-700 p-6 md:p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-2xl flex items-center justify-center">
                  <CheckSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg md:text-xl text-primary mb-3">Moje úlohy</h3>
                <p className="text-sm text-secondary mb-4">Aktuálne montáže a checklists</p>
                <span className="badge badge-warning">
                  FÁZA 7
                </span>
              </div>

              <div className="card-interactive border-2 border-dashed border-accent-300 dark:border-accent-700 p-6 md:p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-2xl flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg md:text-xl text-primary mb-3">Fotky</h3>
                <p className="text-sm text-secondary mb-4">Nahrať fotky z montáže</p>
                <span className="badge badge-warning">
                  FÁZA 5
                </span>
              </div>

              <div className="card-interactive border-2 border-dashed border-accent-300 dark:border-accent-700 p-6 md:p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg md:text-xl text-primary mb-3">Voľno</h3>
                <p className="text-sm text-secondary mb-4">Žiadosti o dovolenku</p>
                <span className="badge badge-warning">
                  FÁZA 7
                </span>
              </div>
            </div>

            <div className="mt-10 card border-2 border-accent-500/30 p-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm text-secondary font-semibold mb-2">
                    Momentálne je implementovaná len FÁZA 2 (Autentifikácia).
                    Employee funkcie budú pridané v FÁZE 5 a 7.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-secondary rounded-xl border border-primary">
                <p className="text-xs text-primary font-bold mb-2">Poznámka pre zamestnancov:</p>
                <p className="text-xs text-secondary">
                  Nevidíte ceny zákaziek. Môžete len dokončovať priradené úlohy,
                  checklist položky a nahrávať fotky z montáží.
                </p>
              </div>
            </div>
          </div>
        </div>
    </EmployeeLayout>
  )
}

export default EmployeeDashboard
