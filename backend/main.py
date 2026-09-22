"""
main.py – FastAPI application entry point for Detecto.
Registers routers and configures CORS for the Vite dev server.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes import detect, history
from models.record import Base, engine

load_dotenv()

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Detecto API",
    description="Real-time person detection and counting system.",
    version="1.0.0",
)

# Allow requests from the Vite frontend dev server
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detect.router, prefix="/detect", tags=["Detection"])
app.include_router(history.router, prefix="/history", tags=["History"])


@app.get("/", tags=["Health"])
def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok", "service": "Detecto API"}
