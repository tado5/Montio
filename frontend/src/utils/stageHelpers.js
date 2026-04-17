/**
 * Stage Pages Helper Utilities
 * Shared constants and functions for order stage pages
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_PHOTOS = 10

/**
 * Validate file size
 * @throws {Error} If file exceeds MAX_FILE_SIZE
 */
export const validateFileSize = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Súbor ${file.name} je príliš veľký (max 5MB)`)
  }
}

/**
 * Read file as Data URL (base64)
 * @returns {Promise<{name: string, dataUrl: string, file: File}>}
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve({
      name: file.name,
      dataUrl: e.target.result,
      file
    })
    reader.onerror = () => reject(new Error('Chyba pri načítaní súboru'))
    reader.readAsDataURL(file)
  })
}
