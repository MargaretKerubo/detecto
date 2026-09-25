import { useCallback, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

/**
 * ImageUploader
 * A drag-and-drop / click-to-browse upload dropzone.
 * Calls onUpload(file) when a valid image is selected.
 */
export default function ImageUploader({ onUpload, isLoading }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) return
      onUpload(file)
    },
    [onUpload]
  )

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      handleFile(e.dataTransfer.files[0])
    },
    [handleFile]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
        isDragging
          ? 'border-emerald-400 bg-emerald-900/20'
          : 'border-slate-600 bg-slate-800 hover:border-slate-400'
      } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <UploadCloud className="h-10 w-10 text-emerald-400" />
      <p className="text-sm text-slate-400">
        {isLoading
          ? 'Processing…'
          : 'Drag & drop an image here, or click to browse'}
      </p>
      <p className="text-xs text-slate-500">JPEG, PNG, WebP supported</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
