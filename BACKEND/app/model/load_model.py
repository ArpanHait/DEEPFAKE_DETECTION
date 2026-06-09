import torch
import torch.nn as nn
from torchvision import models
from transformers import pipeline
from PIL import Image

# --------------------------------------------------
# Singleton Models
# --------------------------------------------------

_classifier = None
_audio_classifier = None


def get_classifier():
    """
    Returns a singleton PyTorch EfficientNet-B0 image classifier
    trained on Real vs Fake face detection (FaceForensics++).
    """
    global _classifier
    if _classifier is None:
        print("Loading lightweight EfficientNet-B0 deepfake detection model...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Instantiate EfficientNet-B0
        model = models.efficientnet_b0(weights=None)
        model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)
        
        # Load weights from Hugging Face
        url = "https://huggingface.co/Xicor9/efficientnet-b0-ffpp-c23/resolve/main/efficientnet_b0_ffpp_c23.pth"
        state_dict = torch.hub.load_state_dict_from_url(url, map_location=device)
        model.load_state_dict(state_dict)
        model.to(device)
        model.eval()
        
        _classifier = model
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


