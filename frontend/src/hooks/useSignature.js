import { useRef, useState } from 'react'

/**
 * Custom hook pre signature pad management
 * Eliminuje duplicitný kód z stage pages
 */
export const useSignature = () => {
  const signatureRef = useRef(null)
  const [signatureData, setSignatureData] = useState(null)

  const clearSignature = () => {
    signatureRef.current?.clear()
    setSignatureData(null)
  }

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL()
      setSignatureData(dataUrl)
    }
  }

  return {
    signatureRef,
    signatureData,
    clearSignature,
    handleSignatureEnd,
    setSignatureData
  }
}
