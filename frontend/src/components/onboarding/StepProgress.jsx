import { Building2, Upload, ClipboardList, Eye, CheckCircle } from 'lucide-react'

export default function StepProgress({ currentStep, totalSteps }) {
  const percentage = ((currentStep + 1) / totalSteps) * 100

  const steps = [
    { label: 'Údaje', icon: Building2 },
    { label: 'Logo', icon: Upload },
    { label: 'Typy', icon: ClipboardList },
    { label: 'Preview', icon: Eye },
    { label: 'Hotovo', icon: CheckCircle }
  ]

  return (
    <div className="w-full">
      {/* Progress text */}
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-secondary">
          Krok {currentStep + 1} z {totalSteps}
        </span>
        <span className="text-sm font-medium text-accent-500">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary/20 rounded-full h-3 overflow-hidden mb-6">
        <div
          className="h-full gradient-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step, i) => {
          const Icon = step.icon
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          const isPending = i > currentStep

          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'gradient-accent text-white scale-100'
                    : isCurrent
                    ? 'gradient-accent text-white scale-110 shadow-lg'
                    : 'bg-secondary/20 text-tertiary scale-100'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs mt-2 transition-all duration-300 ${
                  i <= currentStep ? 'text-accent-500 font-medium' : 'text-tertiary'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
