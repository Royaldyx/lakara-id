/**
 * Client-side image compression using Canvas API.
 * Converts any image to JPEG and reduces size iteratively.
 */
export function useImageCompress() {
  /**
   * @param file     - Original file from input
   * @param maxKB    - Max output size in KB
   * @param maxWidth - Max width in px (default 1200)
   */
  async function compress(file: File, maxKB: number, maxWidth = 1200): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)

        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width  = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width  = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas not supported')); return }
        ctx.drawImage(img, 0, 0, width, height)

        const targetBytes = maxKB * 1024
        let quality = 0.85

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error('Gagal mengkompres gambar')); return }

              if (blob.size <= targetBytes || quality <= 0.25) {
                const outputName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
                resolve(new File([blob], outputName, { type: 'image/jpeg' }))
              } else {
                quality = Math.max(quality - 0.1, 0.25)
                tryCompress()
              }
            },
            'image/jpeg',
            quality,
          )
        }

        tryCompress()
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Gagal membaca file gambar'))
      }

      img.src = objectUrl
    })
  }

  return { compress }
}
