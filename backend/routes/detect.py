"""
routes/detect.py – POST /detect endpoint.
Accepts an image upload, runs YOLOv8 inference, persists the result,
and returns detection data plus the base64-annotated image.
"""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from models.record import DetectionRecord, get_db
from utils.preprocessing import run_detection

router = APIRouter()

_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/")
async def detect_people(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Run person detection on an uploaded image.

    Returns:
      - person_count: total people detected
      - average_confidence: mean confidence of all detections
      - inference_time_ms: wall-clock time for YOLOv8 inference
      - detections: list of bounding boxes and confidence scores
      - annotated_image_b64: base64-encoded PNG with overlaid boxes
    """
    # Validate content type
    if file.content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. "
                   "Please upload a JPEG, PNG, or WebP image.",
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = run_detection(image_bytes, filename=file.filename or "upload")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # Persist to database
    record = DetectionRecord(
        person_count=result["person_count"],
        average_confidence=result["average_confidence"],
        inference_time_ms=result["inference_time_ms"],
        image_filename=result["image_filename"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "timestamp": record.timestamp.isoformat(),
        **{k: result[k] for k in ("person_count", "average_confidence",
                                  "inference_time_ms", "detections",
                                  "annotated_image_b64")},
    }
