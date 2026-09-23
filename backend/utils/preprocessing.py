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


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------

def run_detection(image_bytes: bytes, filename: str = "upload") -> dict[str, Any]:
    """
    Run YOLOv8 person detection on raw image bytes.

    Returns a dict with:
      - person_count (int)
      - average_confidence (float)
      - inference_time_ms (float)
      - detections (list of {bbox, confidence, label})
      - annotated_image_b64 (base64 PNG string)
    """
    # --- Decode and preprocess ---
    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Could not decode image. Ensure it is a valid JPEG or PNG.")

    # Contrast enhancement via CLAHE on the luminance channel
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_ch = clahe.apply(l_ch)
    enhanced = cv2.merge((l_ch, a_ch, b_ch))
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

    # --- Inference ---
    model = _get_model()
    t0 = time.perf_counter()
    results = model.predict(enhanced, verbose=False)[0]
    inference_time_ms = (time.perf_counter() - t0) * 1000

    # --- Extract person detections ---
    detections: list[dict] = []
    confidences: list[float] = []

    for box in results.boxes:
        cls_id = int(box.cls[0].item())
        conf = float(box.conf[0].item())
        if cls_id != _PERSON_CLASS_ID or conf < _CONFIDENCE_THRESHOLD:
            continue
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        detections.append({"bbox": [x1, y1, x2, y2], "confidence": round(conf, 4)})
        confidences.append(conf)

        # Draw bounding box and label
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 200, 50), 2)
        label = f"Person {conf:.0%}"
        cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX,
                    0.55, (0, 200, 50), 2, cv2.LINE_AA)

    # --- Encode annotated image as base64 PNG ---
    _, buffer = cv2.imencode(".png", frame)
    annotated_b64 = base64.b64encode(buffer).decode("utf-8")

    return {
        "person_count": len(detections),
        "average_confidence": round(sum(confidences) / len(confidences), 4) if confidences else 0.0,
        "inference_time_ms": round(inference_time_ms, 2),
        "detections": detections,
        "annotated_image_b64": annotated_b64,
        "image_filename": filename,
    }

