import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  PenTool,
  RotateCcw,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import axios from 'axios'
import SignatureCanvas from 'react-signature-canvas'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const ClientQuoteViewPage = () => {
  const { quoteLink } = useParams()
  const signatureRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [signatureData, setSignatureData] = useState(null)
  const [signatureError, setSignatureError] = useState('')
  const [signed, setSigned] = useState(false)
  const [justSigned, setJustSigned] = useState(false)

  useEffect(() => {
    fetchQuote()
  }, [quoteLink])

  const fetchQuote = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/orders/public/quote/${quoteLink}`)
      setData(response.data)

      if (response.data.quote.client_signature) {
        setSigned(true)
      }
    } catch (err) {
      console.error('❌ [ClientQuoteView] Fetch error:', err)
      setError(err.response?.data?.message || 'Cenová ponuka nebola nájdená.')
    } finally {
      setLoading(false)
    }
  }

  const clearSignature = () => {
    signatureRef.current?.clear()
    setSignatureData(null)
    setSignatureError('')
  }

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL()
      setSignatureData(dataUrl)
      setSignatureError('')
    }
  }

  const handleSign = async () => {
    if (!signatureData) {
      setSignatureError('Podpis je povinný')
      return
    }

    try {
      setSubmitting(true)
      await axios.post(`${API_URL}/api/orders/public/quote/${quoteLink}/sign`, {
        signature_data: signatureData
      })
      setSigned(true)
      setJustSigned(true)
      await fetchQuote() // Refresh data to get client signature
    } catch (err) {
      console.error('❌ [ClientQuoteView] Sign error:', err)
      setError(err.response?.data?.message || 'Nepodarilo sa podpísať ponuku.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Chyba</h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    )
  }

  // Success screen - shown only right after signing
  if (signed && justSigned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Ponuka podpísaná! 🎉
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Ďakujeme za potvrdenie cenovej ponuky. Firma vás bude kontaktovať ohľadom termínu montáže.
          </p>
          <button
            onClick={() => setJustSigned(false)}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            Zobraziť cenovú ponuku
          </button>
        </div>
      </div>
    )
  }

  const { order, quote, survey } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Top Header - Company Branding */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b-4 border-orange-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Company Logo & Name */}
            <div className="flex items-center gap-3">
              {order.company_logo ? (
                <img
                  src={order.company_logo}
                  alt={order.company_name}
                  className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-lg bg-white/10 p-1.5 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {order.company_name?.charAt(0) || 'M'}
                </div>
              )}
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white mb-0.5">
                  {order.company_name}
                </h1>
                <p className="text-xs md:text-sm text-gray-300">Cenová ponuka pre montážne práce</p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-white/10 backdrop-blur-sm border-2 border-green-400 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-xs md:text-sm font-bold text-green-300 leading-tight">Overená ponuka</p>
                  <p className="text-[10px] md:text-xs text-green-400 leading-tight">Bezpečné elektronické podpisovanie</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Cenová ponuka</h2>
              <p className="text-white/90 text-sm md:text-base">
                {order.order_number} - {order.order_type_name}
              </p>
            </div>
            {quote.scheduled_date && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-1.5 text-white/80 text-xs md:text-sm mb-1">
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Plánovaný termín
                </div>
                <p className="text-lg md:text-xl font-bold">
                  {new Date(quote.scheduled_date).toLocaleDateString('sk-SK', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Company and Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Company */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <Building className="w-6 h-6 text-orange-500" />
              Dodávateľ
            </h3>
            <div className="space-y-2">
              <p className="font-bold text-lg text-gray-900">{order.company_name}</p>
              {order.ico && <p className="text-gray-600">IČO: {order.ico}</p>}
              {order.dic && <p className="text-gray-600">DIČ: {order.dic}</p>}
              {order.company_address && <p className="text-gray-600">{order.company_address}</p>}
              {order.company_phone && (
                <p className="text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {order.company_phone}
                </p>
              )}
              {order.company_email && (
                <p className="text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {order.company_email}
                </p>
              )}
            </div>
          </div>

          {/* Client */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-orange-500" />
              Odberateľ
            </h3>
            <div className="space-y-2">
              <p className="font-bold text-lg text-gray-900">{order.client_name}</p>
              {order.client_phone && (
                <p className="text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {order.client_phone}
                </p>
              )}
              {order.client_email && (
                <p className="text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {order.client_email}
                </p>
              )}
              {order.client_address && (
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {order.client_address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Survey Details and Photos */}
        {survey && (survey.notes || (survey.photos && survey.photos.length > 0)) && (
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              Zistenia z obhliadky
            </h3>

            {survey.notes && (
              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{survey.notes}</p>
              </div>
            )}

            {survey.photos && survey.photos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  Fotografie z obhliadky ({survey.photos.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {survey.photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={photo.data || photo.dataUrl}
                        alt={`Obhliadka ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(photo.data || photo.dataUrl, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quote Items */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Položky ponuky</h3>

          {/* Materials */}
          {quote.materials && quote.materials.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-orange-500 rounded"></div>
                Materiál
              </h3>
              <div className="space-y-3">
                {quote.materials.map((item, index) => (
                  <div key={index} className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                        {item.description && (
                          <p className="text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 text-lg ml-4">
                        {parseFloat(item.price).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Labor */}
          {quote.labor && quote.labor.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded"></div>
                Práca
              </h3>
              <div className="space-y-3">
                {quote.labor.map((item, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                        {item.description && (
                          <p className="text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 text-lg ml-4">
                        {parseFloat(item.price).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>DPH ({quote.vat_rate}%):</span>
                <span className="font-semibold">{parseFloat(quote.vat_amount).toFixed(2)} €</span>
              </div>
              <div className="border-t border-white/30 pt-3 flex justify-between text-2xl font-bold">
                <span>CELKOVÁ CENA:</span>
                <span>{parseFloat(quote.total_price).toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Poznámky k ponuke
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{quote.notes}</p>
          </div>
        )}

        {/* Signatures Section */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Podpisy</h3>

          {signed && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-700">
                  Cenová ponuka bola podpísaná dňa {new Date(quote.client_signed_at || Date.now()).toLocaleDateString('sk-SK', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Company Signature - LEFT */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Dodávateľ</h3>
              {quote.company_signature ? (
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 mb-4">
                  <img
                    src={quote.company_signature}
                    alt="Podpis dodávateľa"
                    className="h-32 max-w-full mx-auto"
                  />
                </div>
              ) : (
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 h-40 flex items-center justify-center mb-4">
                  <p className="text-gray-400">Bez podpisu</p>
                </div>
              )}
              <div className="border-t-2 border-gray-900 pt-2">
                <p className="text-sm text-gray-600">Meno: {order.company_name}</p>
                <p className="text-sm text-gray-600">
                  Dátum: {new Date().toLocaleDateString('sk-SK')}
                </p>
              </div>
            </div>

            {/* Client Signature - RIGHT */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-orange-500" />
                Odberateľ
              </h3>

              {signed ? (
                // READ-ONLY MODE - Show signed signature
                <>
                  {quote.client_signature ? (
                    <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 mb-4">
                      <img
                        src={quote.client_signature}
                        alt="Podpis odberateľa"
                        className="h-32 max-w-full mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 h-40 flex items-center justify-center mb-4">
                      <p className="text-gray-400">Bez podpisu</p>
                    </div>
                  )}
                </>
              ) : (
                // SIGNING MODE - Show signature pad
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Svojim podpisom potvrdzujete súhlas s cenovou ponukou.
                  </p>

                  <div className={`border-2 rounded-lg overflow-hidden mb-3 ${signatureError ? 'border-red-500' : 'border-gray-400'}`}>
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        className: 'w-full h-40 bg-white touch-none',
                        style: { touchAction: 'none' }
                      }}
                      onEnd={handleSignatureEnd}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={clearSignature}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors mb-3 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Vymazať podpis
                  </button>

                  {signatureError && (
                    <p className="text-red-500 text-sm mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {signatureError}
                    </p>
                  )}
                </>
              )}

              <div className="border-t-2 border-gray-900 pt-2 mb-4">
                <p className="text-sm text-gray-600">Meno: {order.client_name}</p>
                <p className="text-sm text-gray-600">
                  Dátum: {new Date(quote.client_signed_at || Date.now()).toLocaleDateString('sk-SK')}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button - Only show if not signed */}
          {!signed && (
            <button
              onClick={handleSign}
              disabled={submitting}
              className="w-full mt-6 px-6 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                  Podpisujem...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Potvrdiť a podpísať ponuku
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer - Trust & Security */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-6 mt-12 border-t-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4">
              <div className="flex flex-col items-center gap-1.5 p-3 bg-white/5 rounded-lg border border-white/10">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-xs font-semibold">Bezpečné podpisovanie</span>
                <span className="text-[10px] text-gray-400">SSL šifrované</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 bg-white/5 rounded-lg border border-white/10">
                <Building className="w-6 h-6 text-blue-400" />
                <span className="text-xs font-semibold">Overená firma</span>
                <span className="text-[10px] text-gray-400">IČO: {order.ico}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 bg-white/5 rounded-lg border border-white/10">
                <FileText className="w-6 h-6 text-orange-400" />
                <span className="text-xs font-semibold">Právne záväzný dokument</span>
                <span className="text-[10px] text-gray-400">Platný elektronický podpis</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-center">
            <p className="text-xs text-gray-400 mb-1.5">
              Tento dokument je generovaný systémom MONTIO a je právne záväzný po obojstrannom podpise.
            </p>
            <p className="text-[10px] text-gray-500">
              © {new Date().getFullYear()} {order.company_name}. Všetky práva vyhradené.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientQuoteViewPage
