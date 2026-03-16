import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import StepProgress from '../components/onboarding/StepProgress'
import Step1BasicInfo from '../components/onboarding/Step1BasicInfo'
import Step2LogoBilling from '../components/onboarding/Step2LogoBilling'
import Step3OrderTypes from '../components/onboarding/Step3OrderTypes'
import Step4Preview from '../components/onboarding/Step4Preview'
import Step5Complete from '../components/onboarding/Step5Complete'

export default function OnboardingWizard() {
  const { inviteToken } = useParams()
  const navigate = useNavigate()

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md">
          <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Neplatný link</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            Vitajte v MONTIO
          </h1>
          <p className="text-gray-600">Dokončite registráciu Vašej firmy</p>
          {inviteData && (
            <p className="text-sm text-gray-500 mt-2">
              Registrácia pre: <span className="font-semibold">{inviteData.email}</span>
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <StepProgress currentStep={currentStep} totalSteps={5} />

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-xl p-8 mt-8">
          {steps[currentStep]}
        </div>
      </div>
    </div>
  )
}
