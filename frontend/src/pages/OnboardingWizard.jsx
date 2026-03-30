import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import StepProgress from '../components/onboarding/StepProgress'
import Step1BasicInfo from '../components/onboarding/Step1BasicInfo'
import Step2LogoBilling from '../components/onboarding/Step2LogoBilling'
import Step3OrderTypes from '../components/onboarding/Step3OrderTypes'
import Step4Preview from '../components/onboarding/Step4Preview'
import Step5Complete from '../components/onboarding/Step5Complete'

export default function OnboardingWizard() {
  const { inviteToken } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inviteData, setInviteData] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    ico: '',
    dic: '',
    address: '',
    logo: null,
    logoPreview: null,
    billingData: {
      iban: '',
      swift: '',
      variableSymbol: 'VS-{YYYY}-{###}',
      invoiceDueDays: 14,
      invoiceNote: ''
    },
    orderTypes: [],
    password: '',
    firstName: '',
    lastName: ''
  })

  // Validate token on mount
  useEffect(() => {
    validateToken()
  }, [inviteToken])

  const validateToken = async () => {
    try {
      const response = await axios.get(`/api/invites/${inviteToken}`)

      if (!response.data.valid) {
        setError('Invite token is invalid or expired')
        return
      }

      setInviteData(response.data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to validate token')
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)
  const goToStep = (step) => setCurrentStep(step)

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-500 animate-spin mx-auto mb-4" />
          <p className="text-secondary">Načítavam...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="card p-8 max-w-md">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary text-center mb-2">Neplatný link</h2>
          <p className="text-secondary text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary w-full"
          >
            Späť na prihlásenie
          </button>
        </div>
      </div>
    )
  }

  const steps = [
    <Step1BasicInfo
      key="step1"
      data={formData}
      updateData={updateFormData}
      nextStep={nextStep}
      inviteToken={inviteToken}
      email={inviteData.email}
    />,
    <Step2LogoBilling
      key="step2"
      data={formData}
      updateData={updateFormData}
      nextStep={nextStep}
      prevStep={prevStep}
      inviteToken={inviteToken}
    />,
    <Step3OrderTypes
      key="step3"
      data={formData}
      updateData={updateFormData}
      nextStep={nextStep}
      prevStep={prevStep}
      inviteToken={inviteToken}
    />,
    <Step4Preview
      key="step4"
      data={formData}
      updateData={updateFormData}
      nextStep={nextStep}
      prevStep={prevStep}
      goToStep={goToStep}
    />,
    <Step5Complete
      key="step5"
      data={formData}
      inviteToken={inviteToken}
      email={inviteData.email}
    />
  ]

  return (
    <div className="min-h-screen bg-primary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-accent bg-clip-text text-transparent mb-2">
            Vitajte v MONTIO
          </h1>
          <p className="text-secondary">Dokončite registráciu Vašej firmy</p>
          {inviteData && (
            <p className="text-sm text-tertiary mt-2">
              Registrácia pre: <span className="font-semibold text-secondary">{inviteData.email}</span>
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <StepProgress currentStep={currentStep} totalSteps={5} />

        {/* Step Content */}
        <div className="card p-8 mt-8">
          {steps[currentStep]}
        </div>
      </div>
    </div>
  )
}
