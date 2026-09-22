"""
utils/preprocessing.py – YOLOv8 inference service for person detection.

Responsibilities:
  - Load and cache the YOLOv8 model (lazy singleton pattern).
  - Preprocess raw image bytes: decode, resize, normalize.
  - Run inference and extract person-class detections.
  - Draw bounding boxes + labels onto the result frame.
  - Return structured detection data and a base64-encoded annotated image.
"""
import base64
import os
import time
from io import BytesIO
from typing import Any

import cv2
import numpy as np
from ultralytics import YOLO

# ---------------------------------------------------------------------------
# Model singleton
# ---------------------------------------------------------------------------
_MODEL: YOLO | None = None
_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")

# COCO class index for 'person'
_PERSON_CLASS_ID = 0
_CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.4"))


def _get_model() -> YOLO:
    """Lazily load and cache the YOLOv8 model."""
    global _MODEL
    if _MODEL is None:
        _MODEL = YOLO(_MODEL_PATH)
    return _MODEL
