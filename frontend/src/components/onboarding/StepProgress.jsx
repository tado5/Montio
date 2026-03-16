export default function StepProgress({ currentStep, totalSteps }) {
  const percentage = ((currentStep + 1) / totalSteps) * 100

  const stepLabels = ['Údaje', 'Logo', 'Typy', 'Preview', 'Hotovo']

  return (
    <div className="w-full">
      {/* Progress text */}
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Krok {currentStep + 1} z {totalSteps}
        </span>
        <span className="text-sm font-medium text-orange-600">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < currentStep
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white scale-100'
                  : i === currentStep
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white scale-110 shadow-lg'
                  : 'bg-gray-200 text-gray-500 scale-100'
              }`}
            >
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs mt-2 transition-all duration-300 ${
                i <= currentStep ? 'text-orange-600 font-medium' : 'text-gray-400'
              }`}
            >
              {stepLabels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
