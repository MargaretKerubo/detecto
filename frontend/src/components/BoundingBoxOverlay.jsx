/**
 * BoundingBoxOverlay
 * Renders bounding boxes on top of an annotated image returned by the API.
 * The backend already draws boxes in the image bytes; this component simply
 * displays the base64-encoded annotated PNG and the per-detection stats.
 */
export default function BoundingBoxOverlay({ annotatedImageB64, detections, personCount }) {
  if (!annotatedImageB64) return null

  return (
    <div className="space-y-3">
      {/* Annotated image */}
      <div className="overflow-hidden rounded-xl border border-slate-700">
        <img
          src={`data:image/png;base64,${annotatedImageB64}`}
          alt="Detection result with bounding boxes"
          className="w-full object-contain"
        />
      </div>

      {/* Per-detection summary */}
      {detections && detections.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {detections.map((det, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs"
            >
              <span className="font-medium text-emerald-400">
                Person {idx + 1}
              </span>
              <span className="ml-2 text-slate-400">
                {(det.confidence * 100).toFixed(1)}% confidence
              </span>
            </div>
          ))}
        </div>
      )}

      {personCount === 0 && (
        <p className="text-center text-sm text-slate-500">
          No people detected in this image.
        </p>
      )}
    </div>
  )
}
