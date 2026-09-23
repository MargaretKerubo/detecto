"""
routes/history.py – GET /history and DELETE /reset endpoints.
Retrieves and manages stored detection history from SQLite.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from models.record import DetectionRecord, get_db

router = APIRouter()


@router.get("/")
def get_history(
    db: Session = Depends(get_db),
    limit: int = Query(default=100, ge=1, le=1000, description="Max records to return"),
    skip: int = Query(default=0, ge=0, description="Records to skip (pagination offset)"),
):
    """Return a paginated list of past detection records, newest first."""
    records = (
        db.query(DetectionRecord)
        .order_by(DetectionRecord.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp.isoformat(),
            "person_count": r.person_count,
            "average_confidence": r.average_confidence,
            "inference_time_ms": r.inference_time_ms,
            "image_filename": r.image_filename,
        }
        for r in records
    ]


@router.delete("/reset")
def reset_history(db: Session = Depends(get_db)):
    """Delete all stored detection records."""
    deleted = db.query(DetectionRecord).delete()
    db.commit()
    return {"message": f"Cleared {deleted} detection record(s)."}
