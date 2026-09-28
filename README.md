# Detecto – Real-Time Person Detection & Counting System

A full-stack web application that uses **YOLOv8** to detect and count people in uploaded images, served via a **FastAPI** backend and visualised through a **React/Vite** dashboard.

---

## Architecture

```
detecto/
├── backend/          # FastAPI + YOLOv8 inference engine
│   ├── main.py       # App entry point, CORS, router registration
│   ├── routes/       # /detect, /history, /reset endpoints
│   ├── models/       # SQLAlchemy ORM (DetectionRecord)
│   └── utils/        # YOLOv8 preprocessing & inference service
└── frontend/         # React + Vite dashboard
    ├── src/pages/    # DetectionView, HistoryView
    └── src/components/ # ImageUploader, StatsPanel, BoundingBoxOverlay
```

**Data flow:** Browser → POST /detect → YOLOv8 inference → SQLite → JSON response → React renders annotated image + stats.

---

## Setup & Run

### Prerequisites
- Python ≥ 3.10
- Node.js ≥ 18

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> The YOLOv8 nano weights (`yolov8n.pt`) are downloaded automatically on first run.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

Create a `.env` file in the project root:

```
FRONTEND_ORIGIN=http://localhost:5173
CONFIDENCE_THRESHOLD=0.4
YOLO_MODEL_PATH=yolov8n.pt
DATABASE_URL=sqlite:///./detecto.db
```

---

## Testing & Validation

The model was evaluated on 10 sample images in `frontend/public/samples/`. Ground-truth person counts were manually recorded for accuracy calculation.

### Results Table

| Metric | Description | Target | Result |
|--------|-------------|--------|--------|
| Detection Accuracy | Correct detections ÷ total visible persons | ≥ 85 % | _Run eval-model skill_ |
| False Positives | Non-person bounding boxes | ≤ 10 % | _Run eval-model skill_ |
| Average Inference Time | Wall-clock time per image | ≤ 1.5 s | _Run eval-model skill_ |
| Average Confidence | Mean confidence of valid detections | ≥ 0.7 | _Run eval-model skill_ |
| System Reliability | Processes all images without crashes | 100 % | _Run eval-model skill_ |

> Run the `eval-model` agent skill to automatically populate this table with real numbers.

---

## What Worked Well
- YOLOv8 nano delivers fast inference even on CPU with no GPU required.
- CLAHE contrast enhancement improves detection in low-light images.
- The lazy model singleton means only one model load per server lifetime.

## Areas for Improvement
- Add frame-by-frame video streaming via WebSocket.
- Integrate tracking (ByteTrack) for movement heatmaps.
- Add region-of-interest alerts ("too many people in zone").
