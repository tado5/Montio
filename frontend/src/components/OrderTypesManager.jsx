import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import {
  Plus,
  Edit2,
  Trash2,
  CheckSquare,
  X,
  Save,
  AlertCircle
} from 'lucide-react'
import { api } from '../utils/apiClient'

const OrderTypesManager = () => {
  const toast = useToast()
  const [orderTypes, setOrderTypes] = useState([])
  const [loading, setLoading] = useState(true)
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
      
      const response = await api.get('/api/order-types', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrderTypes(response.data.orderTypes)
    } catch (err) {
      console.error('Fetch order types error:', err)
      toast.error('Nepodarilo sa načítať typy montáží.')
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
      
      const cleanChecklist = formData.checklist.filter(item => item.trim() !== '')

      await api.post(
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
      toast.success('Typ montáže bol úspešne vytvorený.')
    } catch (err) {
      console.error('Create order type error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa vytvoriť typ montáže.')
    }
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    try {
      
      const cleanChecklist = formData.checklist.filter(item => item.trim() !== '')

      await api.put(
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
      toast.success('Typ montáže bol úspešne aktualizovaný.')
    } catch (err) {
      console.error('Update order type error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa aktualizovať typ montáže.')
    }
  }

  const handleSubmitDelete = async () => {
    try {
      

      await api.delete(
        `/api/order-types/${selectedOrderType.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setShowDeleteModal(false)
      fetchOrderTypes()
      toast.success('Typ montáže bol úspešne vymazaný.')
    } catch (err) {
      console.error('Delete order type error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa vymazať typ montáže.')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary">Typy montáží</h2>
          <p className="text-sm text-tertiary mt-1">Správa typov zákaziek a checklistov</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Pridať typ
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-200 dark:border-accent-700 border-t-accent-600 dark:border-t-accent-400"></div>
        </div>
      ) : orderTypes.length === 0 ? (
        <div className="card border-2 border-dashed border-primary p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-2xl flex items-center justify-center">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <p className="text-secondary font-medium">
            Zatiaľ nemáte žiadne typy montáží. Vytvorte prvý typ kliknutím na tlačidlo "Pridať typ".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderTypes.map((orderType) => (
            <div
              key={orderType.id}
              className="card-interactive p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-primary mb-1">
                    {orderType.name}
                  </h3>
                  {orderType.description && (
                    <p className="text-sm text-secondary">
                      {orderType.description}
                    </p>
                  )}
                </div>
                <span className="badge badge-info">
                  {orderType.usage_count} použití
                </span>
              </div>

              <div className="mb-3">
                <p className="text-xs text-secondary font-semibold mb-2 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  Checklist ({orderType.default_checklist.length} položiek):
                </p>
                <ul className="space-y-1">
                  {orderType.default_checklist.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="text-xs text-secondary flex items-start gap-1">
                      <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                  {orderType.default_checklist.length > 3 && (
                    <li className="text-xs text-tertiary italic">
                      ...a ďalšie {orderType.default_checklist.length - 3}
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(orderType)}
                  className="btn btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Upraviť
                </button>
                <button
                  onClick={() => handleDelete(orderType)}
                  className="btn flex-1 bg-red-500 hover:bg-red-600 text-white text-sm flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
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
          <div className="bg-elevated rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-primary">Nový typ montáže</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate}>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Názov *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Popis
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
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
                          className="input flex-1"
                        />
                        {formData.checklist.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(index)}
                            className="btn bg-red-500 hover:bg-red-600 text-white p-2"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="mt-2 btn bg-emerald-500 hover:bg-emerald-600 text-white text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Pridať položku
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
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
          <div className="bg-elevated rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-primary">
                Upraviť typ montáže
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn btn-ghost p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit}>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Názov *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Popis
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
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
                          className="input flex-1"
                        />
                        {formData.checklist.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(index)}
                            className="btn bg-red-500 hover:bg-red-600 text-white p-2"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="mt-2 btn bg-emerald-500 hover:bg-emerald-600 text-white text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Pridať položku
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
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
          <div className="bg-elevated rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-primary mb-2">
                  Vymazať typ montáže?
                </h3>
                <p className="text-secondary text-sm">
                  Naozaj chcete vymazať typ montáže "<strong>{selectedOrderType.name}</strong>"?
                  Táto akcia je nevratná.
                </p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Tento typ bol použitý v {selectedOrderType.usage_count} zákazkách.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline flex-1"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSubmitDelete}
                className="btn flex-1 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
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
