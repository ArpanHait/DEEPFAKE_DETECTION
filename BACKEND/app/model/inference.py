from PIL import Image
from app.model.load_model import get_classifier


def predict_image(image: Image.Image) -> dict:
    """
    Accepts a PIL Image (face crop or full image).
    Returns a dict with:
        - label: "REAL" or "FAKE"
        - score: float confidence (0.0 to 1.0)
    """
    classifier = get_classifier()
    results = classifier(image)

    # results is a list like:
    # [{'label': 'Real', 'score': 0.92}, {'label': 'Fake', 'score': 0.08}]
    best = results[0]  # highest confidence result

    # Normalize label to uppercase
    label = best["label"].upper()
    if label not in ("REAL", "FAKE"):
        # Fallback: treat anything not "REAL" as "FAKE"
        label = "FAKE" if "fake" in best["label"].lower() else "REAL"

    return {
        "label": label,
        "score": round(best["score"], 4)
    }