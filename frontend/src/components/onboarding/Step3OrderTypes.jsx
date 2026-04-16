import { useState } from 'react'
import { api } from '../../utils/apiClient'
import { Plus, Trash2, ClipboardList, AlertCircle, ArrowLeft } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function Step3OrderTypes({ data, updateData, nextStep, prevStep, inviteToken }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  const [orderTypes, setOrderTypes] = useState(
    data.orderTypes.length > 0
      ? data.orderTypes
      : [
          {
            name: '',
            description: '',
            checklist: [{ item: '', required: true }]
          }
        ]
  )

  const addOrderType = () => {
    if (orderTypes.length >= 10) {
      setError('Maximálne 10 typov montáží')
      return
    }

    setOrderTypes([
      ...orderTypes,
      {
        name: '',
        description: '',
        checklist: [{ item: '', required: true }]
      }
    ])
  }

  const removeOrderType = (index) => {
    setOrderTypes(orderTypes.filter((_, i) => i !== index))
  }

  const updateOrderType = (index, field, value) => {
    const updated = [...orderTypes]
    updated[index][field] = value
    setOrderTypes(updated)
  }

  const addChecklistItem = (orderTypeIndex) => {
    const updated = [...orderTypes]
    updated[orderTypeIndex].checklist.push({ item: '', required: true })
    setOrderTypes(updated)
  }

  const removeChecklistItem = (orderTypeIndex, checklistIndex) => {
    const updated = [...orderTypes]
    updated[orderTypeIndex].checklist = updated[orderTypeIndex].checklist.filter(
      (_, i) => i !== checklistIndex
    )
    setOrderTypes(updated)
  }

  const updateChecklistItem = (orderTypeIndex, checklistIndex, field, value) => {
    const updated = [...orderTypes]
    updated[orderTypeIndex].checklist[checklistIndex][field] = value
    setOrderTypes(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    const validOrderTypes = orderTypes.filter(
      ot => ot.name && ot.name.length >= 3 && ot.checklist.some(c => c.item)
    )

    if (validOrderTypes.length === 0) {
      setError('Musíte pridať aspoň 1 platný typ montáže')
      setLoading(false)
      return
    }

    // Clean checklist items
    const cleanedOrderTypes = validOrderTypes.map(ot => ({
      ...ot,
      checklist: ot.checklist.filter(c => c.item && c.item.trim() !== '')
    }))

    try {
      await api.post('/api/onboarding/step3', {
        inviteToken,
        orderTypes: cleanedOrderTypes
      })

      // Update parent state
      updateData({ orderTypes: cleanedOrderTypes })

      toast.success('Typy montáží uložené')

      // Go to next step
      nextStep()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Chyba pri ukladaní'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-2">Typy montáží</h2>
      <p className="text-secondary mb-6">Definujte typy montáží a ich checklists</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Types */}
        {orderTypes.map((orderType, otIndex) => (
          <div key={otIndex} className="card p-4 relative">
            {/* Remove button */}
            {orderTypes.length > 1 && (
              <button
                type="button"
                onClick={() => removeOrderType(otIndex)}
                className="absolute top-3 right-3 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
              >
                <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-600" />
              </button>
            )}

            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-accent-500" />
              <h3 className="font-semibold text-primary">
                Typ montáže #{otIndex + 1}
              </h3>
            </div>

            {/* Name */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-secondary mb-1">
                Názov <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orderType.name}
                onChange={e => updateOrderType(otIndex, 'name', e.target.value)}
                placeholder="napr. Klimatizácia - inštalácia"
                className="input"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-secondary mb-1">
                Popis (voliteľné)
              </label>
              <textarea
                value={orderType.description}
                onChange={e => updateOrderType(otIndex, 'description', e.target.value)}
                placeholder="Krátky popis typu montáže"
                rows="2"
                className="input"
              />
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Checklist položky
              </label>

              {orderType.checklist.map((checklistItem, clIndex) => (
                <div key={clIndex} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={checklistItem.item}
                    onChange={e =>
                      updateChecklistItem(otIndex, clIndex, 'item', e.target.value)
                    }
                    placeholder="napr. Montáž vnútornej jednotky"
                    className="input flex-1 text-sm"
                  />

                  <label className="flex items-center gap-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={checklistItem.required}
                      onChange={e =>
                        updateChecklistItem(otIndex, clIndex, 'required', e.target.checked)
                      }
                      className="rounded text-accent-500 focus:ring-accent-500"
                    />
                    <span className="text-xs text-secondary">Povinné</span>
                  </label>

                  {orderType.checklist.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(otIndex, clIndex)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addChecklistItem(otIndex)}
                className="mt-2 text-sm text-accent-500 hover:text-accent-600 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Pridať položku
              </button>
            </div>
          </div>
        ))}

        {/* Add Order Type Button */}
        {orderTypes.length < 10 && (
          <button
            type="button"
            onClick={addOrderType}
            className="w-full py-3 card-interactive border-2 border-dashed border-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 text-accent-500" />
            <span className="text-accent-500 font-medium">Pridať ďalší typ montáže</span>
          </button>
        )}

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Späť
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Ukladám...' : 'Ďalej →'}
          </button>
        </div>
      </form>
    </div>
  )
}
