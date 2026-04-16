import { Building2, Upload, ClipboardList, Edit2, CheckCircle, Info, ArrowLeft } from 'lucide-react'

export default function Step4Preview({ data, updateData, nextStep, prevStep, goToStep }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-2">Prehľad údajov</h2>
      <p className="text-secondary mb-6">Skontrolujte zadané informácie pred dokončením</p>

      <div className="space-y-4">
        {/* Základné údaje */}
        <div className="card p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent-500" />
              <h3 className="font-semibold text-primary">Základné údaje</h3>
            </div>
            <button
              onClick={() => goToStep(0)}
              className="px-3 py-1.5 text-sm flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <Edit2 className="w-4 h-4" />
              Upraviť
            </button>
          </div>
          <div className="space-y-2 text-sm ml-7">
            <div className="flex">
              <span className="w-24 text-tertiary">Názov:</span>
              <span className="font-medium text-secondary">{data.name || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-tertiary">IČO:</span>
              <span className="font-medium text-secondary">{data.ico || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-tertiary">DIČ:</span>
              <span className="font-medium text-secondary">{data.dic || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-tertiary">Adresa:</span>
              <span className="font-medium text-secondary">{data.address || '-'}</span>
            </div>
          </div>
        </div>

        {/* Logo a fakturačné údaje */}
        <div className="card p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-accent-500" />
              <h3 className="font-semibold text-primary">Logo a fakturačné údaje</h3>
            </div>
            <button
              onClick={() => goToStep(1)}
              className="px-3 py-1.5 text-sm flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <Edit2 className="w-4 h-4" />
              Upraviť
            </button>
          </div>
          <div className="space-y-2 text-sm ml-7">
            <div className="flex items-center">
              <span className="w-24 text-tertiary">Logo:</span>
              {data.logoPreview ? (
                <div className="w-16 h-16 border border-primary rounded overflow-hidden flex items-center justify-center bg-elevated shadow-soft">
                  <img
                    src={data.logoPreview}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <span className="text-tertiary">Nie je nahrané</span>
              )}
            </div>
            <div className="flex">
              <span className="w-24 text-tertiary">IBAN:</span>
              <span className="font-medium text-secondary">{data.billingData.iban || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-tertiary">SWIFT:</span>
              <span className="font-medium text-secondary">{data.billingData.swift || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-tertiary">Splatnosť:</span>
              <span className="font-medium text-secondary">{data.billingData.invoiceDueDays || 14} dní</span>
            </div>
          </div>
        </div>

        {/* Typy montáží */}
        <div className="card p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent-500" />
              <h3 className="font-semibold text-primary">Typy montáží</h3>
            </div>
            <button
              onClick={() => goToStep(2)}
              className="px-3 py-1.5 text-sm flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <Edit2 className="w-4 h-4" />
              Upraviť
            </button>
          </div>
          {data.orderTypes && data.orderTypes.length > 0 ? (
            <div className="space-y-3 ml-7">
              {data.orderTypes.map((orderType, index) => (
                <div key={index} className="bg-secondary/10 rounded-lg p-3">
                  <h4 className="font-medium text-primary mb-1">{orderType.name}</h4>
                  {orderType.description && (
                    <p className="text-xs text-tertiary mb-2">{orderType.description}</p>
                  )}
                  <div className="text-xs text-secondary">
                    <strong>Checklist:</strong> {orderType.checklist.length} položiek
                  </div>
                  <ul className="mt-1 space-y-1">
                    {orderType.checklist.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs text-secondary flex items-center gap-1">
                        {item.required ? (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-tertiary" />
                        )}
                        {item.item}
                      </li>
                    ))}
                    {orderType.checklist.length > 3 && (
                      <li className="text-xs text-tertiary">
                        ... a ďalších {orderType.checklist.length - 3}
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-tertiary text-sm ml-7">Žiadne typy montáží</p>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="mt-6 card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Dokončenie registrácie</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              V poslednom kroku vytvoríte heslo pre prihlásenie do systému.
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
        <button
          type="button"
          onClick={prevStep}
          className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Späť
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Dokončiť registráciu →
        </button>
      </div>
    </div>
  )
}
