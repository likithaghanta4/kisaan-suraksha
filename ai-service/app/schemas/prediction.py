from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class DiseasePrediction(BaseModel):
    """Disease prediction result from AI model."""
    disease: str = Field(..., description="Predicted disease name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0-1")
    description: str = Field(default="", description="Brief description of the disease")


class PestPrediction(BaseModel):
    """Pest detection result from AI model."""
    pest: str = Field(..., description="Detected pest name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0-1")
    bbox: Optional[List[float]] = Field(default=None, description="Bounding box [x1,y1,x2,y2]")


class SeverityResult(BaseModel):
    """Severity analysis result."""
    severity: str = Field(..., description="Low, Moderate, or Severe")
    affected_area_percentage: float = Field(..., ge=0.0, le=100.0)
    description: str = Field(default="")


class PredictionRequest(BaseModel):
    """Request payload for disease prediction."""
    crop: str = Field(..., description="Crop name (e.g., Tomato, Paddy)")
    image_base64: Optional[str] = Field(default=None, description="Base64 encoded image")


class PredictionResponse(BaseModel):
    """Complete prediction response."""
    model_config = ConfigDict(protected_namespaces=())

    crop: str
    disease: Optional[DiseasePrediction] = None
    pests: Optional[List[PestPrediction]] = None
    severity: Optional[SeverityResult] = None
    model_mode: str = Field(default="mock", description="mock or real")


class HealthResponse(BaseModel):
    """Health check response."""
    model_config = ConfigDict(protected_namespaces=())

    status: str = "ok"
    service: str = "agriraksha-ai-service"
    model_mode: str = "mock"
    version: str = "1.0.0"
