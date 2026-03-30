import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import axios from 'axios'
import { Calendar as CalendarIcon, RefreshCw, X, User, DollarSign, Clock, Package, Loader2 } from 'lucide-react'

const Calendar = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchCalendarEvents()
  }, [])

  const fetchCalendarEvents = async (start = null, end = null) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      let url = '/api/orders/calendar'
      const params = []

      if (start) params.push(`start=${start}`)
      if (end) params.push(`end=${end}`)

      if (params.length > 0) {
        url += `?${params.join('&')}`
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setEvents(response.data.events)
      setError(null)
    } catch (err) {
      console.error('Fetch calendar events error:', err)
      setError('Nepodarilo sa načítať zákazky.')
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (info) => {
    setSelectedEvent(info.event)
    setShowModal(true)
  }

  const handleDateClick = (info) => {
    console.log('Date clicked:', info.dateStr)
    // TODO: Open create order modal with pre-filled date
  }

  const handleDatesSet = (dateInfo) => {
    // Optional: Fetch events for specific date range
    // For now, we load all events upfront
    // const start = dateInfo.startStr.split('T')[0]
    // const end = dateInfo.endStr.split('T')[0]
    // fetchCalendarEvents(start, end)
  }

  const getStatusText = (status) => {
    const statusMap = {
      'survey': 'Obhliadka',
      'quote': 'Cenová ponuka',
      'assigned': 'Priradené',
      'in_progress': 'V procese',
      'completed': 'Dokončené',
      'cancelled': 'Zrušené'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      'survey': 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      'quote': 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
      'assigned': 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
      'in_progress': 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
      'completed': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      'cancelled': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-accent-500" />
          <h2 className="text-2xl font-bold text-primary">Kalendár zákaziek</h2>
        </div>
        <button
          onClick={() => fetchCalendarEvents()}
          className="btn-primary"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Obnoviť
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-center mb-6">
          <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-12 h-12 text-accent-500 animate-spin" />
        </div>
      ) : (
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            height="auto"
            locale="sk"
            buttonText={{
              today: 'Dnes',
              month: 'Mesiac',
              week: 'Týždeň',
              day: 'Deň'
            }}
            dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
        </div>
      )}

      {/* Event Detail Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primary">Detail zákazky</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-secondary/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-tertiary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-tertiary" />
                  <p className="text-xs text-tertiary font-semibold">Číslo zákazky</p>
                </div>
                <p className="text-lg font-bold text-primary ml-6">
                  {selectedEvent.extendedProps?.orderNumber}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-tertiary" />
                  <p className="text-xs text-tertiary font-semibold">Zákazník</p>
                </div>
                <p className="text-lg font-bold text-primary ml-6">
                  {selectedEvent.extendedProps?.clientName}
                </p>
              </div>

              <div>
                <p className="text-xs text-tertiary font-semibold mb-1">Status</p>
                <span className={`badge ${getStatusColor(selectedEvent.extendedProps?.status)}`}>
                  {getStatusText(selectedEvent.extendedProps?.status)}
                </span>
              </div>

              {selectedEvent.extendedProps?.orderTypeName && (
                <div>
                  <p className="text-xs text-tertiary font-semibold mb-1">Typ montáže</p>
                  <p className="text-lg font-bold text-primary">
                    {selectedEvent.extendedProps.orderTypeName}
                  </p>
                </div>
              )}

              {selectedEvent.extendedProps?.employeeName && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-tertiary" />
                    <p className="text-xs text-tertiary font-semibold">Zamestnanec</p>
                  </div>
                  <p className="text-lg font-bold text-primary ml-6">
                    {selectedEvent.extendedProps.employeeName}
                  </p>
                </div>
              )}

              {selectedEvent.extendedProps?.totalPrice && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-tertiary" />
                    <p className="text-xs text-tertiary font-semibold">Cena</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 ml-6">
                    {selectedEvent.extendedProps.totalPrice.toFixed(2)}€
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-tertiary" />
                  <p className="text-xs text-tertiary font-semibold">Dátum</p>
                </div>
                <p className="text-lg font-bold text-primary ml-6">
                  {selectedEvent.start?.toLocaleDateString('sk-SK', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn-outline flex-1"
              >
                Zavrieť
              </button>
              <button
                onClick={() => {
                  // TODO: Navigate to order detail
                  console.log('Navigate to order:', selectedEvent.id)
                }}
                className="btn-primary flex-1"
              >
                Otvoriť detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Custom Styles */}
      <style>{`
        .fc {
          font-family: inherit;
        }
        .fc-theme-standard .fc-toolbar {
          margin-bottom: 1.5rem;
          gap: 1rem;
        }
        .fc-toolbar-chunk {
          display: flex;
          gap: 0.5rem;
        }
        .fc-button {
          background: linear-gradient(to right, rgb(249 115 22), rgb(234 88 12)) !important;
          border: none !important;
          font-weight: bold !important;
          padding: 0.5rem 1rem !important;
          border-radius: 0.75rem !important;
          text-transform: none !important;
          margin: 0 0.25rem !important;
        }
        .fc-button:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
        .fc-button-active {
          opacity: 0.9 !important;
        }
        .fc-button-group {
          gap: 0.25rem;
        }
        .fc-event {
          cursor: pointer;
          border-radius: 0.5rem;
          padding: 0.25rem 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .fc-event:hover {
          filter: brightness(1.1);
        }
        .fc-daygrid-day-number {
          font-weight: 600;
        }
        .fc-col-header-cell {
          background: rgb(249 250 251);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          padding: 0.75rem 0;
        }
        .dark .fc-col-header-cell {
          background: rgb(31 41 55);
          color: rgb(209 213 219);
        }
        .dark .fc-daygrid-day-number,
        .dark .fc-toolbar-title,
        .dark .fc-scrollgrid {
          color: rgb(229 231 235);
        }
        .dark .fc-scrollgrid {
          border-color: rgb(55 65 81);
        }
        .dark .fc-theme-standard td,
        .dark .fc-theme-standard th {
          border-color: rgb(55 65 81);
        }
      `}</style>
    </div>
  )
}

export default Calendar
