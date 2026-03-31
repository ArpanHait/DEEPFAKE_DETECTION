from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import uvicorn
import time
import io
from PIL import Image

# Internal modules
from app.model.inference import predict_image
from app.utils.face_detection import extract_face
from app.utils.preprocessing import preprocess_image

# --------------------------------------------------
# App Initialization
# --------------------------------------------------
app = FastAPI(
    title="Deepfake Detection API",
    description="Enterprise-grade face swap detection system",
    version="1.0.0"
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

# --------------------------------------------------
# Health Check Endpoint
# --------------------------------------------------
@app.get("/")
def health_check():
    return {
        "status": "OK",
        "message": "Deepfake Detection API is running"
    }

# --------------------------------------------------
# Core Detection Endpoint
# --------------------------------------------------
@app.post("/detect")
def detect_deepfake(file: UploadFile = File(...)):
    start_time = time.time()

    # ---------- Validation ----------
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    contents = file.file.read()

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # ---------- Load Image ----------
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # ---------- Face Extraction ----------
    face = extract_face(image)

    if face is None:
        raise HTTPException(
            status_code=422,
            detail="No face detected in the image"
        )

    # ---------- Preprocessing ----------
    input_tensor = preprocess_image(face)

    # ---------- Inference ----------
    try:
        score = predict_image(input_tensor)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {str(e)}"
        )

    # ---------- Decision ----------
    label = "FAKE" if score > 0.5 else "REAL"

    # Optional: calibrated confidence later
    confidence = float(score) if label=='FAKE' else float(1-score)

    # ---------- Response ----------
    response = {
        "prediction": label,
        "confidence": round(confidence, 4),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2)
    }

    return JSONResponse(content=response)


# --------------------------------------------------
# Optional: Batch Endpoint (future scaling)
# --------------------------------------------------
@app.post("/detect-batch")
def detect_batch(files: list[UploadFile] = File(...)):
    results = []

    for file in files:
        try:
            contents = file.file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")

            face = extract_face(image)
            if face is None:
                results.append({"file": file.filename, "error": "No face"})
                continue

            input_tensor = preprocess_image(face)
            score = predict_image(input_tensor)

            label = "FAKE" if score > 0.5 else "REAL"

            results.append({
                "file": file.filename,
                "prediction": label,
                "confidence": round(float(score), 4)
            })

        except Exception as e:
            results.append({
                "file": file.filename,
                "error": str(e)
            })

    return {"results": results}


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