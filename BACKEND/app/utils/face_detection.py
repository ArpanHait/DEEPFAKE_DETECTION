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


def extract_face(image, expansion_factor=2.5):
    """
    Detects face and crops it with a given expansion factor.
    Returns a resized PIL Image (224, 224) or None if no face is detected.
    """
    boxes, probs = mtcnn.detect(image)
    if boxes is None or len(boxes) == 0:
        return None

    box = boxes[0]  # Take the face with highest detection probability
    w, h = image.size
    x1, y1, x2, y2 = box

    box_w = x2 - x1
    box_h = y2 - y1

    cx = x1 + box_w / 2
    cy = y1 + box_h / 2

    # Expand box dimensions
    new_w = box_w * expansion_factor
    new_h = box_h * expansion_factor

    # Calculate new coordinates and clip to image bounds
    new_x1 = max(0, int(cx - new_w / 2))
    new_y1 = max(0, int(cy - new_h / 2))
    new_x2 = min(w, int(cx + new_w / 2))
    new_y2 = min(h, int(cy + new_h / 2))

    cropped = image.crop((new_x1, new_y1, new_x2, new_y2))
    return cropped.resize((224, 224))


def detect_face_box(image):
    """
    Detects the main face bounding box.
    Returns dict {"x": int, "y": int, "width": int, "height": int} or None
    """
    boxes, probs = mtcnn.detect(image)
    if boxes is None or len(boxes) == 0:
        return None

    box = boxes[0]
    x1 = max(0, int(box[0]))
    y1 = max(0, int(box[1]))
    x2 = min(image.size[0], int(box[2]))
    y2 = min(image.size[1], int(box[3]))

    return {
        "x": x1,
        "y": y1,
        "width": x2 - x1,
        "height": y2 - y1
    }