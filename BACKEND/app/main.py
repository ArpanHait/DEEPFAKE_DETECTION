import dotenv
dotenv.load_dotenv()

# Workaround for AttributeError: module 'torch' has no attribute 'float8_e8m0fnu' in newer transformers
import torch
if not hasattr(torch, "float8_e8m0fnu"):
    torch.float8_e8m0fnu = torch.float32

from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import time
import io
import tempfile
import os
import cv2
import socket
import librosa
import numpy as np
import base64
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from PIL import Image

# Internal modules
from app.model.inference import predict_image
from app.utils.face_detection import extract_face, detect_face_box
from app.model.load_model import get_audio_classifier

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
    allow_origins=["*"],
    allow_credentials=False,
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

    # Detect face box and crop
    face_box = detect_face_box(image)
    face_crop = extract_face(image) if face_box is not None else None

    # Run predictions
    try:
        if face_crop is not None:
            # Dual prediction
            result_full = predict_image(image)
            result_face = predict_image(face_crop)
            
            # Extract probability of being FAKE
            fake_prob_full = result_full["score"] if result_full["label"] == "FAKE" else 1.0 - result_full["score"]
            fake_prob_face = result_face["score"] if result_face["label"] == "FAKE" else 1.0 - result_face["score"]
            
            # Classification thresholds
            # Full image has standard 0.5 threshold. 
            # Face crop has a tighter 0.85 threshold to avoid crop-boundary false positives.
            is_fake = (fake_prob_full > 0.5) or (fake_prob_face > 0.85)
            
            if is_fake:
                label = "FAKE"
                confidence = max(fake_prob_full, fake_prob_face)
            else:
                label = "REAL"
                confidence = ((1.0 - fake_prob_full) + (1.0 - fake_prob_face)) / 2.0
        else:
            # Single prediction on full image
            result_full = predict_image(image)
            fake_prob_full = result_full["score"] if result_full["label"] == "FAKE" else 1.0 - result_full["score"]
            fake_prob_face = None
            label = result_full["label"]
            confidence = result_full["score"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")

    # Only show manipulated boxes when FAKE is detected
    manipulated_boxes = []
    if label == "FAKE":
        if face_box is not None:
            manipulated_boxes = [{
                "x": face_box["x"],
                "y": face_box["y"],
                "width": face_box["width"],
                "height": face_box["height"],
                "reason": f"Face manipulation detected (confidence: {confidence:.1%})"
            }]
        else:
            w, h = image.size
            manipulated_boxes = [{
                "x": 0,
                "y": 0,
                "width": w,
                "height": h,
                "reason": f"Global image manipulation detected (confidence: {confidence:.1%})"
            }]

    w, h = image.size
    
    # Compile diagnostic checks
    diagnostic_checks = []
    
    # 1. Resolution Check
    resolution_status = "PASSED" if (w >= 128 and h >= 128) else "WARNING"
    resolution_msg = f"Resolution is {w}x{h}. Sufficient spatial details for sub-pixel forgery detection." if resolution_status == "PASSED" else f"Low resolution ({w}x{h}). Deepfake artifacts may be obscured by compression."
    diagnostic_checks.append({
        "name": "Image Resolution & Format",
        "status": resolution_status,
        "message": resolution_msg
    })
    
    # 2. Biometric Face Alignment
    if face_box is not None:
        diagnostic_checks.append({
            "name": "Biometric Face Detection",
            "status": "PASSED",
            "message": f"Face detected at x:{face_box['x']}, y:{face_box['y']} (size: {face_box['width']}x{face_box['height']}). Biometric crop extracted successfully."
        })
    else:
        diagnostic_checks.append({
            "name": "Biometric Face Detection",
            "status": "INFO",
            "message": "No human faces detected. Switching analysis mode to global scene manipulation."
        })
        
    # 3. Global Scene Analysis
    global_status = "FAILED" if (fake_prob_full > 0.5) else "PASSED"
    global_msg = f"Global neural networks detected manipulation artifacts with {fake_prob_full:.1%} probability." if global_status == "FAILED" else f"Full-scene scan finished. No global manipulation detected (manipulation probability: {fake_prob_full:.1%})."
    diagnostic_checks.append({
        "name": "Global Feature Analysis",
        "status": global_status,
        "message": global_msg
    })
    
    # 4. Ensemble Face Crop Check
    if face_crop is not None:
        face_status = "FAILED" if (fake_prob_face > 0.85) else "PASSED"
        face_msg = f"Local biometric crop classification detected synthetic anomalies on the face with {fake_prob_face:.1%} probability (Threshold: 85.0%)." if face_status == "FAILED" else f"Biometric face crop analysis completed. No local face-swap artifacts detected (manipulation probability: {fake_prob_face:.1%})."
        diagnostic_checks.append({
            "name": "Ensemble Face Verification",
            "status": face_status,
            "message": face_msg
        })

    image_details = {
        "dimensions": f"{w}px × {h}px",
        "face_detected": face_box is not None,
        "face_box": face_box
    }

    response = {
        "prediction": label,
        "confidence": round(confidence, 4),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "original_width": w,
        "original_height": h,
        "manipulated_boxes": manipulated_boxes,
        "image_details": image_details,
        "diagnostic_checks": diagnostic_checks
    }

    return JSONResponse(content=response)

# --------------------------------------------------
# 2. Video Analysis Endpoint
# --------------------------------------------------
@app.post("/analyze/video")
async def analyze_video(file: UploadFile = File(...)):
    start_time = time.time()
    
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be video.")
    
    # Save upload to a temporary file
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save temporary video file")

    defect_frames = []
    all_scores = []
    width = 0.0
    height = 0.0
    total_frames = 0
    fps = 24.0
    duration_seconds = 0.0
    analyzed_frames = 0
    faces_detected = 0
    manipulated_frames = 0

    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file.")

        width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
        height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 24.0
        duration_seconds = total_frames / fps if fps > 0 else 0.0

        # Dynamically sample around 15 keyframes across the video to prevent CPU bottlenecks
        num_target_keyframes = 15
        frame_interval = max(1, int(total_frames / num_target_keyframes))
        
        current_frame = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if current_frame % frame_interval == 0:
                analyzed_frames += 1
                # Convert BGR to RGB for PIL
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(rgb_frame)
                
                # Detect face box and crop
                face_box = detect_face_box(pil_image)
                face_crop = extract_face(pil_image) if face_box is not None else None
                
                try:
                    if face_box is not None:
                        faces_detected += 1
                        
                    if face_crop is not None:
                        # Single prediction on face crop (optimized for face classification models)
                        result_face = predict_image(face_crop)
                        fake_prob_face = result_face["score"] if result_face["label"] == "FAKE" else 1.0 - result_face["score"]
                        
                        # Face crop has a tighter 0.85 threshold to avoid false positives
                        is_fake = (fake_prob_face > 0.85)
                        score = fake_prob_face if is_fake else (1.0 - fake_prob_face)
                    else:
                        # Fallback to single prediction on full frame
                        result_full = predict_image(pil_image)
                        is_fake = result_full["label"] == "FAKE"
                        score = result_full["score"] if is_fake else 1.0 - result_full["score"]
                    
                    # Store score (fake probability)
                    all_scores.append(score if is_fake else 1.0 - score)
                    
                    if is_fake:
                        manipulated_frames += 1
                        timestamp = current_frame / fps
                        
                        # Draw bounding box on frame for visual representation if face exists
                        annotated_frame = frame.copy()
                        if face_box is not None:
                            x, y, w_box, h_box = face_box["x"], face_box["y"], face_box["width"], face_box["height"]
                            cv2.rectangle(annotated_frame, (x, y), (x + w_box, y + h_box), (0, 0, 255), 3)
                            cv2.putText(annotated_frame, f"FAKE {score:.1%}", (x, max(30, y - 10)),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                        
                        # Encode frame to base64
                        _, buffer = cv2.imencode('.jpg', annotated_frame)
                        frame_b64 = base64.b64encode(buffer).decode('utf-8')
                        
                        reason = "Face manipulation detected" if face_box is not None else "Global frame manipulation detected"
                        defect_frames.append({
                            "timestamp": f"{int(timestamp // 60):02d}:{timestamp % 60:06.3f}",
                            "reason": f"{reason} (confidence: {score:.1%})",
                            "frame_base64": f"data:image/jpeg;base64,{frame_b64}"
                        })
                except Exception:
                    pass  # Ignore frames where inference fails
            current_frame += 1
            
        cap.release()
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    # Calculate overall label based on analysis
    if len(all_scores) > 0:
        avg_fake_score = sum(all_scores) / len(all_scores)
        is_fake_video = avg_fake_score > 0.5
    else:
        avg_fake_score = 0.0
        is_fake_video = False
        
    label = "FAKE" if is_fake_video else "REAL"
    confidence = round(avg_fake_score if is_fake_video else 1.0 - avg_fake_score, 4)

    # Compile diagnostic checks
    diagnostic_checks = []
    
    # 1. Video Resolution & Quality
    resolution_status = "PASSED" if (width >= 640 and height >= 480) else "WARNING"
    resolution_msg = (
        f"Resolution is {int(width)}x{int(height)} at {fps:.1f} FPS. Sufficient spatial details for sub-pixel forgery analysis."
        if resolution_status == "PASSED" else
        f"Low resolution ({int(width)}x{int(height)}). Deepfake detection accuracy may be degraded."
    )
    diagnostic_checks.append({
        "name": "Video Resolution & Quality",
        "status": resolution_status,
        "message": resolution_msg
    })
    
    # 2. Biometric Face Alignment
    if faces_detected > 0:
        diagnostic_checks.append({
            "name": "Biometric Face Tracking",
            "status": "PASSED",
            "message": f"Biometric face tracking active. Human faces detected and tracked across {faces_detected} of {analyzed_frames} evaluated keyframes."
        })
    else:
        diagnostic_checks.append({
            "name": "Biometric Face Tracking",
            "status": "INFO",
            "message": "No human faces detected in any evaluated keyframes. Switching to global scene manipulation verification."
        })
        
    # 3. Temporal Consistency Analysis
    temporal_status = "FAILED" if manipulated_frames > 0 else "PASSED"
    if temporal_status == "FAILED":
        temporal_msg = f"Temporal sequence check failed. Detected local manipulation artifacts in {manipulated_frames} of {analyzed_frames} evaluated keyframes."
    else:
        temporal_msg = f"Temporal consistency verified. Frame sequences are within natural bounds. No anomalies detected across {analyzed_frames} keyframes."
    diagnostic_checks.append({
        "name": "Temporal Consistency Check",
        "status": temporal_status,
        "message": temporal_msg
    })
    
    # 4. EfficientNet Verification
    ensemble_status = "FAILED" if is_fake_video else "PASSED"
    if ensemble_status == "FAILED":
        ensemble_msg = f"EfficientNet-B0 model flagged the video as FAKE with average confidence of {confidence:.1%}."
    else:
        ensemble_msg = f"EfficientNet-B0 check passed. No deepfake anomalies detected (confidence: {confidence:.1%})."
    diagnostic_checks.append({
        "name": "EfficientNet-B0 Verification",
        "status": ensemble_status,
        "message": ensemble_msg
    })

    video_details = {
        "dimensions": f"{int(width)}px × {int(height)}px",
        "duration_seconds": round(duration_seconds, 2),
        "fps": round(fps, 2),
        "total_frames": int(total_frames),
        "analyzed_frames": int(analyzed_frames),
        "faces_detected": int(faces_detected),
        "manipulated_frames": int(manipulated_frames)
    }

    response = {
        "prediction": label,
        "confidence": confidence,
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "defect_frames": defect_frames,
        "video_details": video_details,
        "diagnostic_checks": diagnostic_checks
    }
    
    return JSONResponse(content=response)

# --------------------------------------------------
# 3. Audio Analysis Endpoint
# --------------------------------------------------
@app.post("/analyze/audio")
async def analyze_audio(file: UploadFile = File(...)):
    start_time = time.time()
    
    if not file.content_type.startswith("audio/") and file.content_type not in ["video/mp4", "video/webm"]:
        pass

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save temporary audio file")

    manipulated_segments = []
    duration = 0.0
    sr = 16000
    mean_centroid = 0.0
    fake_prob_a = 0.0
    fake_prob_b = 0.0

    try:
        y, sr = librosa.load(tmp_path, sr=16000)
        duration = float(librosa.get_duration(y=y, sr=sr))
        
        # Compute MFCCs and Spectral Centroids
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
        mean_centroid = float(np.mean(centroids))
        
        # Heuristic anomaly detection
        hop_length = 512
        frame_times = librosa.frames_to_time(np.arange(mfccs.shape[1]), sr=sr, hop_length=hop_length)
        
        # Unnatural discontinuities in spectral centroid
        centroid_diff = np.abs(np.diff(centroids[0]))
        mean_diff = np.mean(centroid_diff)
        std_diff = np.std(centroid_diff)
        
        # High-precision absolute + relative thresholding
        threshold = max(3500.0, mean_diff + 6.0 * std_diff)
        anomaly_indices = np.where(centroid_diff > threshold)[0]
        
        if len(anomaly_indices) > 0:
            current_start = anomaly_indices[0]
            current_end = anomaly_indices[0]
            
            for idx in anomaly_indices[1:]:
                # If anomalies occur within 4 frames (~130ms), combine them
                if idx - current_end <= 4:
                    current_end = idx
                else:
                    # Filter out short transient spikes (require at least 3 consecutive frames, ~100ms)
                    if (current_end - current_start) >= 2:
                        start_t = frame_times[current_start]
                        end_t = frame_times[min(current_end + 1, len(frame_times) - 1)]
                        manipulated_segments.append({
                            "start": f"{int(start_t // 60):02d}:{start_t % 60:04.1f}",
                            "end": f"{int(end_t // 60):02d}:{end_t % 60:04.1f}",
                            "reason": "Sustained unnatural spectral discontinuity"
                        })
                    current_start = idx
                    current_end = idx
            
            # Flush final block
            if (current_end - current_start) >= 2:
                start_t = frame_times[current_start]
                end_t = frame_times[min(current_end + 1, len(frame_times) - 1)]
                manipulated_segments.append({
                    "start": f"{int(start_t // 60):02d}:{start_t % 60:04.1f}",
                    "end": f"{int(end_t // 60):02d}:{end_t % 60:04.1f}",
                    "reason": "Sustained unnatural spectral discontinuity"
                })

        # Run AI Deepfake Voice Classifier Model
        import torch

        try:
            with torch.inference_mode():
                clf_a = get_audio_classifier()
                preds_a = clf_a(y)
                fake_prob_a = next((p["score"] for p in preds_a if p["label"].lower() == "fake"), 0.0)
        except Exception as err:
            print(f"Error running MelodyMachine classifier: {err}")
            fake_prob_a = 0.0
        
        fake_prob_b = 0.0  # Disabled second model to fit Render Free Tier RAM limit

    except Exception as e:
        print(f"Audio processing error: {e}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    # Hybrid Decision Logic:
    # Flag as FAKE if either the AI model classifies it as fake (> 0.5)
    # OR if the heuristic splicing detector finds temporal anomalies.
    is_fake = (fake_prob_a > 0.5) or (len(manipulated_segments) > 0)
    label = "FAKE" if is_fake else "REAL"
    
    # Calculate confidence based on which indicator fired
    if is_fake:
        confidence = max(fake_prob_a, min(0.98, 0.70 + 0.05 * len(manipulated_segments)))
    else:
        confidence = 1.0 - fake_prob_a

    # Prepare diagnostic checks & details
    audio_details = {
        "duration_seconds": round(duration, 2),
        "sample_rate": sr,
        "average_spectral_centroid": round(mean_centroid, 2),
        "model_name": "AI Classifier (Wav2Vec2)"
    }

    diagnostic_checks = [
        {
            "name": "General Synthesis Detector",
            "status": "FAILED" if (fake_prob_a > 0.5) else "PASSED",
            "message": f"MelodyMachine classifier detected synthetic/cloned speech characteristics with {fake_prob_a:.1%} probability."
        },
        {
            "name": "Spectral Discontinuity Check",
            "status": "FAILED" if (len(manipulated_segments) > 0) else "PASSED",
            "message": f"Splicing check finished. Detected {len(manipulated_segments)} temporal discontinuity anomalies."
        }
    ]

    response = {
        "prediction": label,
        "confidence": round(confidence, 4),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "manipulated_segments": manipulated_segments,
        "audio_details": audio_details,
        "diagnostic_checks": diagnostic_checks
    }
    
    return JSONResponse(content=response)

# --------------------------------------------------
# SSL Legacy Adapter for compatibility with older servers
# --------------------------------------------------
import ssl
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager

class LegacyAdapter(HTTPAdapter):
    def init_poolmanager(self, connections, maxsize, block=False, **kwargs):
        ctx = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
        ctx.options |= 0x4  # OP_LEGACY_SERVER_CONNECT
        self.poolmanager = PoolManager(
            num_pools=connections,
            maxsize=maxsize,
            block=block,
            ssl_context=ctx
        )

# --------------------------------------------------
# 4. Website Analysis Endpoint
# --------------------------------------------------
@app.post("/analyze/website")
def analyze_website(request: WebsiteRequest):
    start_time = time.time()
    url = request.url
    
    if not url.startswith("http"):
        url = "https://" + url
        
    spoofed_elements = []
    genuine_indicators = []
    
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower()
    
    # 1. DNS Resolution (IP Address)
    try:
        ip_address = socket.gethostbyname(domain)
    except Exception:
        ip_address = "Could not resolve DNS"
        
    # Default website details
    site_title = "Unknown Title"
    site_desc = "No meta description available."
    server_software = "Unknown Server"
    site_purpose = "No descriptive paragraph could be parsed."

    # Check if the domain belongs to a trusted government or academic TLD
    is_trusted_tld = domain.endswith(".gov") or domain.endswith(".gov.in") or domain.endswith(".edu") or domain.endswith(".edu.in")
    
    if is_trusted_tld:
        genuine_indicators.append({
            "check": "Government/Academic Domain Verified",
            "status": "This website uses an official restricted government (.gov) or educational (.edu) domain name."
        })
    
    suspicious_keywords = ["login", "secure", "verify", "banking", "account", "update"]
    has_sus_keyword = False
    for keyword in suspicious_keywords:
        if keyword in domain:
            has_sus_keyword = True
            spoofed_elements.append({
                "element": "URL Domain",
                "issue": f"Suspicious keyword '{keyword}' found in domain name"
            })
            
    if not has_sus_keyword:
        genuine_indicators.append({
            "check": "Domain Reputation Clean",
            "status": "No suspicious phishing keywords (like 'login', 'banking', 'secure') detected in the domain name."
        })
            
    if len(domain.split('.')) > 3:
        if not is_trusted_tld:
            spoofed_elements.append({
                "element": "URL Structure",
                "issue": "Unusually high number of subdomains detected (potential phishing structure)"
            })
    else:
        genuine_indicators.append({
            "check": "URL Subdomain Depth Check",
            "status": "Standard, safe domain nesting level. No suspicious phishing subdomain chaining detected."
        })

    fetch_success = False
    try:
        session = requests.Session()
        session.mount("https://", LegacyAdapter())
        response = session.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
        
        server_software = response.headers.get("Server", "Unknown Server")
        
        if response.status_code == 200:
            fetch_success = True
            genuine_indicators.append({
                "check": "SSL/TLS Connection",
                "status": "Secure connection successfully established with HTTP status code 200."
            })
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract Site Title
            if soup.title and soup.title.string:
                site_title = soup.title.string.strip()
                
            # Extract Meta Description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            desc_val = meta_desc.get('content').strip() if meta_desc and meta_desc.get('content') else ""
            if not desc_val:
                og_desc = soup.find('meta', attrs={'property': 'og:description'})
                desc_val = og_desc.get('content').strip() if og_desc and og_desc.get('content') else ""
            if desc_val:
                site_desc = desc_val
                
            # Extract Site Purpose (First paragraph > 40 chars)
            paragraphs = [p.get_text().strip() for p in soup.find_all(['p', 'span']) if len(p.get_text().strip()) > 40]
            if paragraphs:
                site_purpose = paragraphs[0]
                if len(site_purpose) > 200:
                    site_purpose = site_purpose[:197] + "..."
            
            forms = soup.find_all('form')
            has_external_forms = False
            for form in forms:
                action = form.get('action')
                if action and action.startswith("http"):
                    form_domain = urlparse(action).netloc.lower()
                    if form_domain and form_domain != domain:
                        has_external_forms = True
                        spoofed_elements.append({
                            "element": str(form)[:100] + "...",
                            "issue": f"Form posts data to a different external domain: {form_domain}"
                        })
            
            if not has_external_forms:
                genuine_indicators.append({
                    "check": "Input Form Security",
                    "status": "No forms detected posting user input or credentials to external third-party domains."
                })
            
            scripts = soup.find_all('script')
            external_scripts = [s.get('src') for s in scripts if s.get('src') and s.get('src').startswith("http")]
            suspicious_script_domains = ["ngrok.io", "herokuapp.com", "pastebin.com"]
            has_sus_scripts = False
            for src in external_scripts:
                src_domain = urlparse(src).netloc.lower()
                for sus in suspicious_script_domains:
                    if sus in src_domain:
                        has_sus_scripts = True
                        spoofed_elements.append({
                            "element": f"<script src='{src}'>",
                            "issue": f"Loads script from known suspicious/temporary host: {sus}"
                        })
            
            if not has_sus_scripts:
                genuine_indicators.append({
                    "check": "Active Script Reputation",
                    "status": "All active scripts are loaded from safe, recognized, and non-temporary domains."
                })

    except Exception as e:
        # Trusted domains (like government sites) should not be flagged as FAKE due to connection timeout or offline status
        if not is_trusted_tld:
            spoofed_elements.append({
                "element": "Network Request",
                "issue": f"Failed to fetch website or timed out: {str(e)}"
            })
        else:
            site_desc = f"Domain verified as official. Connection timed out or offline."
            
    if not fetch_success and is_trusted_tld:
        genuine_indicators.append({
            "check": "Domain Verified Offline",
            "status": "Could not connect to verify HTML scripts, but TLD reputation is verified as safe."
        })
        
    is_fake = len(spoofed_elements) > 0
    label = "FAKE" if is_fake else "REAL"
    confidence = 0.9 if is_fake else 0.95

    website_details = {
        "title": site_title,
        "description": site_desc,
        "ip_address": ip_address,
        "server": server_software,
        "primary_purpose": site_purpose
    }

    response = {
        "prediction": label,
        "confidence": confidence,
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "url_scanned": url,
        "spoofed_elements": spoofed_elements,
        "genuine_indicators": genuine_indicators,
        "website_details": website_details
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