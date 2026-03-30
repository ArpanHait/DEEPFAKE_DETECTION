import torch
from app.model.load_model import get_model

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODEL_PATH = "app/model/weights/model.pth"

model = get_model(MODEL_PATH)


def predict_image(input_tensor):
    input_tensor = input_tensor.to(DEVICE)

    with torch.no_grad():
        output = model(input_tensor)
        prob = torch.sigmoid(output).item()

    return prob