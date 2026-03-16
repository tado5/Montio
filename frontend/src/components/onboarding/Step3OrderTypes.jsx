import { useState } from 'react'
import axios from 'axios'

export default function Step3OrderTypes({ data, updateData, nextStep, prevStep, inviteToken }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      await axios.post('/api/onboarding/step3', {
        inviteToken,
        orderTypes: cleanedOrderTypes
      })

      // Update parent state
      updateData({ orderTypes: cleanedOrderTypes })

      // Go to next step
      nextStep()
    } catch (err) {
      setError(err.response?.data?.error || 'Chyba pri ukladaní')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Typy montáží</h2>
      <p className="text-gray-600 mb-6">Definujte typy montáží a ich checklists</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Types */}
        {orderTypes.map((orderType, otIndex) => (
          <div key={otIndex} className="border-2 border-gray-200 rounded-lg p-4 relative">
            {/* Remove button */}
            {orderTypes.length > 1 && (
              <button
                type="button"
                onClick={() => removeOrderType(otIndex)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            )}

            <h3 className="font-semibold text-gray-700 mb-3">
              Typ montáže #{otIndex + 1}
            </h3>

            {/* Name */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Názov <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orderType.name}
                onChange={e => updateOrderType(otIndex, 'name', e.target.value)}
                placeholder="napr. Klimatizácia - inštalácia"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popis (voliteľné)
              </label>
              <textarea
                value={orderType.description}
                onChange={e => updateOrderType(otIndex, 'description', e.target.value)}
                placeholder="Krátky popis typu montáže"
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checklist položky
              </label>

              {orderType.checklist.map((checklistItem, clIndex) => (
                <div key={clIndex} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={checklistItem.item}
                    onChange={e =>
                      updateChecklistItem(otIndex, clIndex, 'item', e.target.value)
                    }
                    placeholder="napr. Montáž vnútornej jednotky"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />

                  <label className="flex items-center space-x-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={checklistItem.required}
                      onChange={e =>
                        updateChecklistItem(otIndex, clIndex, 'required', e.target.checked)
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-xs text-gray-600">Povinné</span>
                  </label>

                  {orderType.checklist.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(otIndex, clIndex)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addChecklistItem(otIndex)}
                className="mt-2 text-sm text-orange-600 hover:text-orange-700"
              >
                + Pridať položku
              </button>
            </div>
          </div>
        ))}

        {/* Add Order Type Button */}
        {orderTypes.length < 10 && (
          <button
            type="button"
            onClick={addOrderType}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
          >
            + Pridať ďalší typ montáže
          </button>
        )}

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
          >
            ← Späť
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ukladám...' : 'Ďalej →'}
          </button>
        </div>
      </form>
    </div>
  )
}
