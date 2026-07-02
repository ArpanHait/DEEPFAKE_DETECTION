import numpy as np
from PIL import Image
from app.model.load_model import get_onnx_session
from app.utils.preprocessing import preprocess_image

def softmax(x):
    """Computes softmax values for a set of scores in x."""
    e_x = np.exp(x - np.max(x, axis=1, keepdims=True))
    return e_x / e_x.sum(axis=1, keepdims=True)

def predict_image(image: Image.Image) -> dict:
    """
    Accepts a PIL Image (face crop or full image).
    Runs inference using the lightweight MobileNetV3-Small ONNX model.
    Returns a dict with:
        - label: "REAL" or "FAKE"
        - score: float confidence (0.0 to 1.0)
    """
    try:
        # 1. Preprocess image to normalized tensor (1, 3, 224, 224)
        tensor = preprocess_image(image)
        
        # 2. Convert PyTorch tensor to NumPy array
        input_data = tensor.numpy()
        
        # 3. Run ONNX Session
        session = get_onnx_session()
        input_name = session.get_inputs()[0].name
        outputs = session.run(None, {input_name: input_data})[0]
        
        # 4. Softmax probability mapping
        probs = softmax(outputs)[0]
        
        # Output labels: index 0 = Real, index 1 = Fake
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
    except Exception as e:
        print(f"ONNX predict_image error: {e}")
        # Fallback default response in case of any runtime errors
        return {
            "label": "REAL",
            "score": 0.5
        }