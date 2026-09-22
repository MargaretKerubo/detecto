"""
models/record.py – SQLAlchemy ORM model for detection history records.
Uses a local SQLite database stored at backend/detecto.db.
"""
import os
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone

# Resolve the database path relative to this file so it always
# lands inside the backend/ directory regardless of CWD.
_DB_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_DB_DIR}/detecto.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite + FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DetectionRecord(Base):
    """Stores one detection result per image processed."""

    __tablename__ = "detection_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    person_count = Column(Integer, nullable=False)
    average_confidence = Column(Float, nullable=False)
    inference_time_ms = Column(Float, nullable=False)
    image_filename = Column(String, nullable=True)


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
