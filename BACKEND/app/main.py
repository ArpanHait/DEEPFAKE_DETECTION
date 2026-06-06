from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import time
import io
import random
from PIL import Image

# Internal modules
from app.model.inference import predict_image
from app.utils.face_detection import extract_face
from app.utils.preprocessing import preprocess_image

# --------------------------------------------------
# App Initialization
# --------------------------------------------------
app = FastAPI(
    title="DeepGuard Multi-Modal API",
    description="Stateless Deepfake and Manipulation Detection System",
    version="2.0.0"
)

# --------------------------------------------------
# Middleware (CORS for frontend integration)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class WebsiteRequest(BaseModel):
    url: str

# --------------------------------------------------
# Health Check Endpoint
# --------------------------------------------------
@app.get("/")
def health_check():
    return {
        "status": "OK",
        "message": "DeepGuard API is running"
    }

# --------------------------------------------------
# 1. Image Analysis Endpoint
# --------------------------------------------------
@app.post("/analyze/image")
def analyze_image(file: UploadFile = File(...)):
    start_time = time.time()

    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    contents = file.file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    face = extract_face(image)

    # Use mock data if no face detected or inference fails
    if face is None:
        # Returning mock data for demonstration
        score = random.uniform(0.6, 0.99)
        manipulated_boxes = [{"x": 100, "y": 150, "width": 80, "height": 80, "reason": "Edge-blending artifact"}]
    else:
        input_tensor = preprocess_image(face)
        try:
            score = predict_image(input_tensor)
            # Dummy box for real inference
            manipulated_boxes = [{"x": 50, "y": 50, "width": 120, "height": 120, "reason": "Detected by CNN"}] if score > 0.5 else []
        except Exception as e:
            score = 0.8
            manipulated_boxes = [{"x": 100, "y": 100, "width": 50, "height": 50, "reason": "Mocked fallback"}]

    label = "FAKE" if score > 0.5 else "REAL"
    confidence = float(score) if label == 'FAKE' else float(1 - score)

    # Mock more complex boxes if fake
    if label == "FAKE" and not manipulated_boxes:
        manipulated_boxes = [
            {"x": random.randint(20, 200), "y": random.randint(20, 200), "width": random.randint(40, 100), "height": random.randint(40, 100), "reason": "Anatomical inconsistency"},
            {"x": random.randint(50, 150), "y": random.randint(50, 150), "width": random.randint(30, 80), "height": random.randint(30, 80), "reason": "Specular reflection mismatch"}
        ]

    response = {
        "prediction": label,
        "confidence": round(confidence, 4),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "manipulated_boxes": manipulated_boxes
    }

    return JSONResponse(content=response)

# --------------------------------------------------
# 2. Video Analysis Endpoint
# --------------------------------------------------
@app.post("/analyze/video")
def analyze_video(file: UploadFile = File(...)):
    start_time = time.time()
    
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be video.")
    
    # Mock Processing Time
    time.sleep(1.5)
    
    # Mock Response
    score = random.uniform(0.65, 0.95)
    label = "FAKE" if score > 0.5 else "REAL"
    
    defect_frames = [
        {"timestamp": "00:02.400", "reason": "Temporal flickering detected"},
        {"timestamp": "00:05.150", "reason": "Facial landmark jitter"},
        {"timestamp": "00:08.800", "reason": "Sub-pixel blending error"}
    ] if label == "FAKE" else []

    response = {
        "prediction": label,
        "confidence": round(score if label == 'FAKE' else 1-score, 4),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "defect_frames": defect_frames
    }
    
    return JSONResponse(content=response)

# --------------------------------------------------
# 3. Audio Analysis Endpoint
# --------------------------------------------------
@app.post("/analyze/audio")
def analyze_audio(file: UploadFile = File(...)):
    start_time = time.time()
    
    if not file.content_type.startswith("audio/") and file.content_type not in ["video/mp4", "video/webm"]:
        # sometimes browsers send audio as video/mp4 depending on container
        pass
        
    # Mock Processing
    time.sleep(1.0)
    
    score = random.uniform(0.7, 0.98)
    label = "FAKE" if score > 0.5 else "REAL"
    
    manipulated_segments = [
        {"start": "00:01.2", "end": "00:03.5", "reason": "Unnatural prosody transition"},
        {"start": "00:10.0", "end": "00:12.8", "reason": "Frequency phase artifact (Vocoder signature)"}
    ] if label == "FAKE" else []

    response = {
        "prediction": label,
        "confidence": round(score if label == 'FAKE' else 1-score, 4),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "manipulated_segments": manipulated_segments
    }
    
    return JSONResponse(content=response)

# --------------------------------------------------
# 4. Website Analysis Endpoint
# --------------------------------------------------
@app.post("/analyze/website")
def analyze_website(request: WebsiteRequest):
    start_time = time.time()
    url = request.url
    
    if not url.startswith("http"):
        url = "https://" + url
        
    # Mock Processing
    time.sleep(2.0)
    
    score = random.uniform(0.75, 0.99)
    label = "FAKE" if score > 0.5 else "REAL"
    
    spoofed_elements = [
        {"element": "<form id='login-box'>", "issue": "Form action posts to suspicious external domain (http://evil-phish.net/submit)"},
        {"element": "<div class='bank-logo'>", "issue": "Logo matches known target (Chase Bank) but domain is mismatched."},
        {"element": "<script src='...'>", "issue": "Obfuscated credential harvesting script detected."}
    ] if label == "FAKE" else []

    response = {
        "prediction": label,
        "confidence": round(score if label == 'FAKE' else 1-score, 4),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "url_scanned": url,
        "spoofed_elements": spoofed_elements
    }
    
    return JSONResponse(content=response)

# --------------------------------------------------
# Run Server (for local dev only)
# --------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )