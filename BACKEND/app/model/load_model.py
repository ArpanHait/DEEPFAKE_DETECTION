from transformers import pipeline
from PIL import Image

# --------------------------------------------------
# Singleton HuggingFace Deepfake Detection Pipeline
# Uses: dima806/deepfake_vs_real_image_detection (ViT)
# Downloads automatically on first run (~300MB)
# --------------------------------------------------

_classifier = None


def get_classifier():
    """
    Returns a singleton HuggingFace image-classification pipeline
    trained on Real vs Fake image detection.
    """
    global _classifier
    if _classifier is None:
        print("Loading HuggingFace ViT deepfake detection model...")
        _classifier = pipeline(
            "image-classification",
            model="dima806/deepfake_vs_real_image_detection",
            device=-1  # CPU (-1). Set to 0 for GPU.
        )
        print("Model loaded successfully.")
    return _classifier
