import { useState, useEffect } from 'react'
import axios from 'axios'

const OrderTypesManager = () => {
  const [orderTypes, setOrderTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOrderType, setSelectedOrderType] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    checklist: ['']
  })

  useEffect(() => {
    fetchOrderTypes()
  }, [])

  const fetchOrderTypes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/order-types', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrderTypes(response.data.orderTypes)
      setError(null)
    } catch (err) {
      console.error('Fetch order types error:', err)
      setError('Nepodarilo sa načítať typy montáží.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({ name: '', description: '', checklist: [''] })
    setShowCreateModal(true)
  }

  const handleEdit = (orderType) => {
    setSelectedOrderType(orderType)
    setFormData({
      name: orderType.name,
      description: orderType.description || '',
      checklist: orderType.default_checklist.length > 0 ? orderType.default_checklist : ['']
    })
    setShowEditModal(true)
  }

  const handleDelete = (orderType) => {
    setSelectedOrderType(orderType)
    setShowDeleteModal(true)
  }

  const handleChecklistChange = (index, value) => {
    const newChecklist = [...formData.checklist]
    newChecklist[index] = value
    setFormData({ ...formData, checklist: newChecklist })
  }

  const handleAddChecklistItem = () => {
    setFormData({ ...formData, checklist: [...formData.checklist, ''] })
  }

  const handleRemoveChecklistItem = (index) => {
    const newChecklist = formData.checklist.filter((_, i) => i !== index)
    setFormData({ ...formData, checklist: newChecklist.length > 0 ? newChecklist : [''] })
  }

  const handleSubmitCreate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const cleanChecklist = formData.checklist.filter(item => item.trim() !== '')

      await axios.post(
        '/api/order-types',
        {
          name: formData.name,
          description: formData.description,
          checklist: cleanChecklist
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setShowCreateModal(false)
      fetchOrderTypes()
    } catch (err) {
      console.error('Create order type error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa vytvoriť typ montáže.')
    }
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const cleanChecklist = formData.checklist.filter(item => item.trim() !== '')

      await axios.put(
        `/api/order-types/${selectedOrderType.id}`,
        {
          name: formData.name,
          description: formData.description,
          checklist: cleanChecklist
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setShowEditModal(false)
      fetchOrderTypes()
    } catch (err) {
      console.error('Update order type error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa aktualizovať typ montáže.')
    }
  }

  const handleSubmitDelete = async () => {
    try {
      const token = localStorage.getItem('token')

      await axios.delete(
        `/api/order-types/${selectedOrderType.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setShowDeleteModal(false)
      fetchOrderTypes()
    } catch (err) {
      console.error('Delete order type error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa vymazať typ montáže.')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Typy montáží</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          + Pridať typ
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
        </div>
      ) : orderTypes.length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
          <p className="text-blue-800 dark:text-blue-300 font-semibold">
            Zatiaľ nemáte žiadne typy montáží. Vytvorte prvý typ kliknutím na tlačidlo "+ Pridať typ".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderTypes.map((orderType) => (
            <div
              key={orderType.id}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {orderType.name}
                  </h3>
                  {orderType.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {orderType.description}
                    </p>
                  )}
                </div>
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-bold rounded-full">
                  {orderType.usage_count} použití
                </span>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                  Checklist ({orderType.default_checklist.length} položiek):
                </p>
                <ul className="space-y-1">
                  {orderType.default_checklist.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="mr-2">✓</span>
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                  {orderType.default_checklist.length > 3 && (
                    <li className="text-xs text-gray-500 dark:text-gray-400 italic">
                      ...a ďalšie {orderType.default_checklist.length - 3}
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(orderType)}
                  className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Upraviť
                </button>
                <button
                  onClick={() => handleDelete(orderType)}
                  className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Vymazať
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Nový typ montáže</h3>

            <form onSubmit={handleSubmitCreate}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Názov *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Popis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                  rows="3"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Checklist *
                </label>
                <div className="space-y-2">
                  {formData.checklist.map((item, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleChecklistChange(index, e.target.value)}
                        placeholder={`Položka ${index + 1}`}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                      />
                      {formData.checklist.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(index)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  + Pridať položku
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Vytvoriť
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrderType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              Upraviť typ montáže
            </h3>

            <form onSubmit={handleSubmitEdit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Názov *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Popis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                  rows="3"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Checklist *
                </label>
                <div className="space-y-2">
                  {formData.checklist.map((item, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleChecklistChange(index, e.target.value)}
                        placeholder={`Položka ${index + 1}`}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                      />
                      {formData.checklist.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(index)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  + Pridať položku
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Uložiť zmeny
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedOrderType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
              Vymazať typ montáže?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Naozaj chcete vymazať typ montáže "<strong>{selectedOrderType.name}</strong>"?
              Táto akcia je nevratná.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">
                ⚠️ Tento typ bol použitý v {selectedOrderType.usage_count} zákazkách.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSubmitDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
              >
                Vymazať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderTypesManager
