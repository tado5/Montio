import { useState } from 'react'
import { validateFileSize, readFileAsDataURL } from '../utils/stageHelpers'

/**
 * Custom hook pre photo upload management
 * Eliminuje duplicitný kód z stage pages
 */
export const usePhotoUpload = (toast, maxPhotos = 10) => {
  const [photos, setPhotos] = useState([])

  const handlePhotoUpload = async (e, type = null) => {
    const files = Array.from(e.target.files)

    if (photos.length + files.length > maxPhotos) {
      toast.error(`Môžete nahrať maximálne ${maxPhotos} fotografií`)
      return
    }

    for (const file of files) {
      try {
        validateFileSize(file)
        const photo = await readFileAsDataURL(file)
        if (type) photo.type = type
        setPhotos(prev => [...prev, photo])
      } catch (err) {
        toast.error(err.message)
      }
    }
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  return {
    photos,
    setPhotos,
    handlePhotoUpload,
    removePhoto
  }
}
