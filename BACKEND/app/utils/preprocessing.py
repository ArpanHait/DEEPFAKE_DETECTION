import torch
import torchvision.transforms as transforms

# --------------------------------------------------
# Image Transform Pipeline
# --------------------------------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # match model input
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],  # ImageNet stats
        std=[0.229, 0.224, 0.225]
    )
])


# --------------------------------------------------
# Preprocess Function
# --------------------------------------------------
def preprocess_image(image):
    """
    Input: PIL Image
    Output: Torch Tensor (1, C, H, W)
    """
    tensor = transform(image)
    return tensor.unsqueeze(0)