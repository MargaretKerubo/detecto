import axios from 'axios'
import { useState } from 'react'
import BoundingBoxOverlay from '../components/BoundingBoxOverlay'
import ImageUploader from '../components/ImageUploader'
import StatsPanel from '../components/StatsPanel'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function DetectionView() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleUpload = async (file) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await axios.post(`${API_BASE}/detect/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Detection View</h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload an image to detect and count people in the frame.
        </p>
      </div>

      <ImageUploader onUpload={handleUpload} isLoading={isLoading} />

      {error && (
        <div className="rounded-lg border border-red-700 bg-red-900/30 p-4 text-sm text-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <>
          <StatsPanel
            personCount={result.person_count}
            avgConfidence={result.average_confidence}
            inferenceTimeMs={result.inference_time_ms}
          />
          <BoundingBoxOverlay
            annotatedImageB64={result.annotated_image_b64}
            detections={result.detections}
            personCount={result.person_count}
          />
        </>
      )}
    </div>
  )
}
