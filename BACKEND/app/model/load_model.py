import torch
import torch.nn as nn
from torchvision import models

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_model_instance = None


def load_model(weights_path: str):
    model = models.efficientnet_b0(pretrained=False)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 1)

    state_dict = torch.load(weights_path, map_location=DEVICE)
    model.load_state_dict(state_dict)

    model.to(DEVICE)
    model.eval()

    return model


def get_model(weights_path: str):
    global _model_instance

    if _model_instance is None:
        print("Loading EfficientNet model...")
        _model_instance = load_model(weights_path)

    return _model_instance
