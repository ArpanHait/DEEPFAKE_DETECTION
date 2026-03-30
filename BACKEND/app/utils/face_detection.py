from facenet_pytorch import MTCNN
import torch

# --------------------------------------------------
# Device
# --------------------------------------------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --------------------------------------------------
# Initialize MTCNN (singleton)
# --------------------------------------------------
mtcnn = MTCNN(
    image_size=224,
    margin=20,
    device=DEVICE
)


# --------------------------------------------------
# Face Extraction
# --------------------------------------------------
def extract_face(image):
    """
    Input: PIL Image
    Output: Cropped face (PIL Image) or None
    """

    # Detect face and return tensor
    face_tensor = mtcnn(image)

    if face_tensor is None:
        return None

    # Convert tensor back to PIL Image (for preprocessing pipeline)
    face = face_tensor.permute(1, 2, 0).cpu().numpy()

    # Convert to PIL safely
    from PIL import Image
    face = (face * 255).astype("uint8")
    face = Image.fromarray(face)

    return face