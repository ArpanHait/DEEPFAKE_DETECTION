from transformers import pipeline
from PIL import Image

# --------------------------------------------------
# Singleton HuggingFace Deepfake Detection Pipeline
# Uses: dima806/deepfake_vs_real_image_detection (ViT)
# Downloads automatically on first run (~300MB)
# --------------------------------------------------

_classifier = None
_audio_classifier = None


def get_classifier():
    """
    Returns a singleton HuggingFace image-classification pipeline
    trained on Real vs Fake image detection.
    """
    global _classifier
    if _classifier is None:
        print("Loading HuggingFace SigLIP deepfake detection model...")
        _classifier = pipeline(
            "image-classification",
            model="prithivMLmods/Deepfake-Detect-Siglip2",
            device=-1  # CPU (-1). Set to 0 for GPU.
        )
        print("Model loaded successfully.")
    return _classifier


def get_audio_classifier():
    """
    Returns a singleton HuggingFace audio-classification pipeline
    trained on Real vs Fake audio detection.
    """
    global _audio_classifier
    if _audio_classifier is None:
        print("Loading HuggingFace Wav2Vec2 deepfake audio detection model...")
        _audio_classifier = pipeline(
            "audio-classification",
            model="MelodyMachine/Deepfake-audio-detection-V2",
            device=-1  # CPU (-1).
        )
        print("Audio model loaded successfully.")
    return _audio_classifier


