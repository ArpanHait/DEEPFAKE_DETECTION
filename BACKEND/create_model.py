import torch
import torch.nn as nn
from torchvision import models
import os

# Create weights folder if not exists
os.makedirs("app/model/weights", exist_ok=True)

# Load pretrained backbone
model = models.efficientnet_b0(pretrained=True)

# Modify for binary classification
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 1)

# Save weights
torch.save(model.state_dict(), "app/model/weights/model.pth")

print("✅ model.pth created successfully!")