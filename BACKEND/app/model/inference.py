import torch
import torch.nn.functional as F
from PIL import Image
from app.model.load_model import get_classifier
from app.utils.preprocessing import preprocess_image


def predict_image(image: Image.Image) -> dict:
    """
    Accepts a PIL Image (face crop or full image).
    Returns a dict with:
        - label: "REAL" or "FAKE"
        - score: float confidence (0.0 to 1.0)
    """
    classifier = get_classifier()
    
    # Preprocess image to normalized tensor (1, 3, 224, 224)
    tensor = preprocess_image(image)
    device = next(classifier.parameters()).device
    tensor = tensor.to(device)
    
    with torch.inference_mode():
        outputs = classifier(tensor)
        # Apply softmax to get probabilities
        probs = F.softmax(outputs, dim=1)[0]
        
    # Xicor9/efficientnet-b0-ffpp-c23 labels: 0 for Real, 1 for Fake
    real_prob = float(probs[0])
    fake_prob = float(probs[1])
    
    if fake_prob > real_prob:
        label = "FAKE"
        score = fake_prob
    else:
        label = "REAL"
        score = real_prob
        
    return {
        "label": label,
        "score": round(score, 4)
    }