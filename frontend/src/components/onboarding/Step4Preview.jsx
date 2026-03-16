export default function Step4Preview({ data, updateData, nextStep, prevStep, goToStep }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Prehľad údajov</h2>
      <p className="text-gray-600 mb-6">Skontrolujte zadané informácie pred dokončením</p>

      <div className="space-y-6">
        {/* Základné údaje */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Základné údaje</h3>
            <button
              onClick={() => goToStep(0)}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              ✏️ Upraviť
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="w-24 text-gray-500">Názov:</span>
              <span className="font-medium">{data.name || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500">IČO:</span>
              <span className="font-medium">{data.ico || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500">DIČ:</span>
              <span className="font-medium">{data.dic || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500">Adresa:</span>
              <span className="font-medium">{data.address || '-'}</span>
            </div>
          </div>
        </div>

        {/* Logo a fakturačné údaje */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Logo a fakturačné údaje</h3>
            <button
              onClick={() => goToStep(1)}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              ✏️ Upraviť
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="w-24 text-gray-500">Logo:</span>
              {data.logoPreview ? (
                <div className="w-16 h-16 border border-gray-300 rounded overflow-hidden flex items-center justify-center bg-white">
                  <img
                    src={data.logoPreview}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <span className="text-gray-400">Nie je nahrané</span>
              )}
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500">IBAN:</span>
              <span className="font-medium">{data.billingData.iban || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500">SWIFT:</span>
              <span className="font-medium">{data.billingData.swift || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500">Splatnosť:</span>
              <span className="font-medium">{data.billingData.invoiceDueDays || 14} dní</span>
            </div>
          </div>
        </div>

        {/* Typy montáží */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Typy montáží</h3>
            <button
              onClick={() => goToStep(2)}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              ✏️ Upraviť
            </button>
          </div>
          {data.orderTypes && data.orderTypes.length > 0 ? (
            <div className="space-y-3">
              {data.orderTypes.map((orderType, index) => (
                <div key={index} className="bg-gray-50 rounded p-3">
                  <h4 className="font-medium text-gray-800 mb-1">{orderType.name}</h4>
                  {orderType.description && (
                    <p className="text-xs text-gray-600 mb-2">{orderType.description}</p>
                  )}
                  <div className="text-xs text-gray-600">
                    <strong>Checklist:</strong> {orderType.checklist.length} položiek
                  </div>
                  <ul className="mt-1 space-y-1">
                    {orderType.checklist.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center">
                        <span className="mr-1">
                          {item.required ? '✓' : '○'}
                        </span>
                        {item.item}
                      </li>
                    ))}
                    {orderType.checklist.length > 3 && (
                      <li className="text-xs text-gray-400">
                        ... a ďalších {orderType.checklist.length - 3}
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Žiadne typy montáží</p>
          )}
        </div>
      </div>

      {/* Heslo a meno */}
      <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">Dokončenie registrácie</h3>
        <p className="text-sm text-gray-600 mb-4">
          V poslednom kroku vytvoríte heslo pre prihlásenie do systému.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          ← Späť
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-6 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
        >
          Dokončiť registráciu →
        </button>
      </div>
    </div>
  )
}
