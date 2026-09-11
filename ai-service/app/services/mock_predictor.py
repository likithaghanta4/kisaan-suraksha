"""
Mock prediction service for development and demo mode.
Returns realistic predictions without actual ML models.
This will be replaced by real model inference when models are trained.
"""

import random
from ..schemas import DiseasePrediction, PestPrediction, SeverityResult

# Mock disease data per crop
MOCK_DISEASES: dict[str, list[dict]] = {
    "tomato": [
        {"disease": "Early Blight", "confidence": 0.94, "description": "Fungal disease causing dark spots with concentric rings on leaves."},
        {"disease": "Late Blight", "confidence": 0.89, "description": "Oomycete infection causing water-soaked lesions on leaves and stems."},
        {"disease": "Leaf Curl", "confidence": 0.87, "description": "Viral disease causing upward curling and yellowing of leaves."},
        {"disease": "Healthy", "confidence": 0.96, "description": "No visible disease symptoms detected."},
    ],
    "paddy": [
        {"disease": "Blast", "confidence": 0.91, "description": "Fungal disease causing diamond-shaped lesions on leaves."},
        {"disease": "Bacterial Leaf Blight", "confidence": 0.88, "description": "Bacterial infection causing yellowing and wilting of leaf tips."},
        {"disease": "Brown Spot", "confidence": 0.85, "description": "Fungal disease causing circular brown spots on leaves."},
        {"disease": "Healthy", "confidence": 0.97, "description": "No visible disease symptoms detected."},
    ],
    "chilli": [
        {"disease": "Leaf Curl", "confidence": 0.90, "description": "Viral disease causing curling and distortion of leaves."},
        {"disease": "Anthracnose", "confidence": 0.86, "description": "Fungal disease causing dark sunken spots on fruits."},
        {"disease": "Powdery Mildew", "confidence": 0.83, "description": "Fungal infection causing white powdery coating on leaves."},
        {"disease": "Healthy", "confidence": 0.95, "description": "No visible disease symptoms detected."},
    ],
    "cotton": [
        {"disease": "Bacterial Blight", "confidence": 0.88, "description": "Bacterial infection causing angular leaf spots."},
        {"disease": "Alternaria Leaf Spot", "confidence": 0.84, "description": "Fungal disease causing circular brown spots with concentric rings."},
        {"disease": "Healthy", "confidence": 0.93, "description": "No visible disease symptoms detected."},
    ],
    "soybean": [
        {"disease": "Rust", "confidence": 0.92, "description": "Fungal disease causing reddish-brown pustules on leaf undersides."},
        {"disease": "Frogeye Leaf Spot", "confidence": 0.86, "description": "Fungal disease causing circular spots with gray centers."},
        {"disease": "Healthy", "confidence": 0.94, "description": "No visible disease symptoms detected."},
    ],
}

# Mock pest data per crop
MOCK_PESTS: dict[str, list[dict]] = {
    "tomato": [
        {"pest": "Aphid", "confidence": 0.91},
        {"pest": "Whitefly", "confidence": 0.87},
        {"pest": "Fruit Borer", "confidence": 0.84},
    ],
    "paddy": [
        {"pest": "Stem Borer", "confidence": 0.89},
        {"pest": "Brown Planthopper", "confidence": 0.85},
        {"pest": "Leaf Folder", "confidence": 0.82},
    ],
    "chilli": [
        {"pest": "Thrips", "confidence": 0.90},
        {"pest": "Mite", "confidence": 0.86},
        {"pest": "Fruit Borer", "confidence": 0.83},
    ],
    "cotton": [
        {"pest": "Bollworm", "confidence": 0.92},
        {"pest": "Whitefly", "confidence": 0.88},
        {"pest": "Jassid", "confidence": 0.84},
    ],
    "soybean": [
        {"pest": "Pod Borer", "confidence": 0.87},
        {"pest": "Semilooper", "confidence": 0.83},
        {"pest": "Stem Fly", "confidence": 0.80},
    ],
}

SEVERITY_LEVELS = ["Low", "Moderate", "Severe"]


def mock_predict_disease(crop: str) -> DiseasePrediction:
    """Return a mock disease prediction for the given crop."""
    crop_lower = crop.lower()
    diseases = MOCK_DISEASES.get(crop_lower, MOCK_DISEASES["tomato"])
    selected = random.choice(diseases)

    # Add slight randomness to confidence
    confidence = selected["confidence"] + random.uniform(-0.05, 0.03)
    confidence = max(0.0, min(1.0, confidence))

    return DiseasePrediction(
        disease=selected["disease"],
        confidence=round(confidence, 2),
        description=selected["description"],
    )


def mock_detect_pests(crop: str) -> list[PestPrediction]:
    """Return mock pest detections for the given crop."""
    crop_lower = crop.lower()
    pests = MOCK_PESTS.get(crop_lower, MOCK_PESTS["tomato"])

    # Return 0-2 pest detections randomly
    num_pests = random.randint(0, min(2, len(pests)))
    selected = random.sample(pests, num_pests)

    results = []
    for pest_data in selected:
        confidence = pest_data["confidence"] + random.uniform(-0.05, 0.03)
        confidence = max(0.0, min(1.0, confidence))
        results.append(PestPrediction(
            pest=pest_data["pest"],
            confidence=round(confidence, 2),
            bbox=[
                round(random.uniform(50, 200), 1),
                round(random.uniform(50, 200), 1),
                round(random.uniform(250, 400), 1),
                round(random.uniform(250, 400), 1),
            ],
        ))

    return results


def mock_analyze_severity(crop: str, disease: str) -> SeverityResult:
    """Return a mock severity analysis."""
    if disease.lower() == "healthy":
        return SeverityResult(
            severity="Low",
            affected_area_percentage=0.0,
            description="No disease symptoms detected.",
        )

    severity = random.choice(SEVERITY_LEVELS)
    area_ranges = {"Low": (5, 15), "Moderate": (15, 45), "Severe": (45, 85)}
    area_range = area_ranges[severity]
    affected = round(random.uniform(*area_range), 1)

    descriptions = {
        "Low": f"Minor {disease} symptoms observed. Early intervention recommended.",
        "Moderate": f"Moderate {disease} spread detected. Take preventive measures.",
        "Severe": f"Significant {disease} damage observed. Immediate action required.",
    }

    return SeverityResult(
        severity=severity,
        affected_area_percentage=affected,
        description=descriptions[severity],
    )
