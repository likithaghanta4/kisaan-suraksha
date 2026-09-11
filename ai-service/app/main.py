"""
AgriRaksha AI Service — FastAPI Application

This service provides AI-powered crop disease detection, pest detection,
and severity analysis. Currently runs in MOCK mode for development.
Real ML models (EfficientNet, YOLO, segmentation) will be integrated
when trained.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes.prediction import router as prediction_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI service for crop disease/pest detection and severity analysis",
)

# CORS — allow backend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(prediction_router, prefix="/api", tags=["Prediction"])


@app.on_event("startup")
async def startup_event():
    print("=" * 50)
    print(f"  {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"  Model Mode: {settings.MODEL_MODE}")
    print(f"  Debug: {settings.DEBUG}")
    print("=" * 50)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
