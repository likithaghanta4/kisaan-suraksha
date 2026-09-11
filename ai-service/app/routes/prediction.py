from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional

from ..config import settings
from ..schemas import (
    PredictionResponse,
    HealthResponse,
)
from ..services.mock_predictor import (
    mock_predict_disease,
    mock_detect_pests,
    mock_analyze_severity,
)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        service=settings.APP_NAME,
        model_mode=settings.MODEL_MODE,
        version=settings.APP_VERSION,
    )


@router.post("/predict", response_model=PredictionResponse)
async def predict_disease(
    crop: str = Form(...),
    image: Optional[UploadFile] = File(None),
):
    """
    Predict disease from crop image.
    Currently uses mock predictions. Will be replaced with real ML models.
    """
    if settings.MODEL_MODE == "mock":
        disease = mock_predict_disease(crop)
        severity = mock_analyze_severity(crop, disease.disease)

        return PredictionResponse(
            crop=crop,
            disease=disease,
            severity=severity,
            model_mode="mock",
        )

    # Real model inference will be added here
    # from ..models.disease_model import DiseaseModel
    # model = DiseaseModel.load(settings.MODEL_WEIGHTS_DIR)
    # prediction = model.predict(image_bytes)
    raise NotImplementedError("Real model inference not yet implemented")


@router.post("/detect-pest")
async def detect_pest(
    crop: str = Form(...),
    image: Optional[UploadFile] = File(None),
):
    """
    Detect pests in crop image.
    Currently uses mock detections. Will use YOLO when trained.
    """
    if settings.MODEL_MODE == "mock":
        pests = mock_detect_pests(crop)
        return {
            "crop": crop,
            "pests": [p.model_dump() for p in pests],
            "model_mode": "mock",
        }

    raise NotImplementedError("Real pest detection not yet implemented")


@router.post("/analyze-severity")
async def analyze_severity(
    crop: str = Form(...),
    disease: str = Form("Unknown"),
    image: Optional[UploadFile] = File(None),
):
    """
    Analyze disease/pest severity.
    Currently uses mock analysis. Will use segmentation model when trained.
    """
    if settings.MODEL_MODE == "mock":
        severity = mock_analyze_severity(crop, disease)
        return {
            "crop": crop,
            "disease": disease,
            "severity": severity.model_dump(),
            "model_mode": "mock",
        }

    raise NotImplementedError("Real severity analysis not yet implemented")
