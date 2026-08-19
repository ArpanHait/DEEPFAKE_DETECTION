<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/FastAPI-2.0-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/ONNX_Runtime-1.27-005CED?style=for-the-badge&logo=onnx&logoColor=white" alt="ONNX Runtime" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

# DeepGuard — AI Deepfake Detection System

**DeepGuard** is a full-stack, multi-modal deepfake and manipulation detection platform. It analyzes **images**, **videos**, **audio**, and **websites** for synthetic artifacts, delivering real-time diagnostic reports through a premium dark-themed React interface.

The backend runs an ultra-lightweight **MobileNetV3-Small** classifier exported to **ONNX** format, achieving **< 10 ms** average inference latency on CPU — purpose-built for deployment on free-tier cloud platforms like Render (512 MB RAM limit).

---

## ✨ Key Features

### Multi-Modal Detection Engine
| Mode | Input | Detection Method |
|---|---|---|
| **Image** | `.jpg`, `.png` | MobileNetV3-Small ONNX classifier with dual-pass face crop + full-scene analysis |
| **Video** | `.mp4`, `.mov` | Keyframe sampling at 2–3 fps, per-frame ONNX inference with temporal consistency checks |
| **Audio** | `.wav`, `.mp3` | Spectral analysis via librosa — MFCC, pitch tracking, spectral flatness, splicing detection |
| **Website** | URL | DNS resolution, SSL verification, HTML heuristic scanning, phishing indicator detection |

### Intelligent Image & Video Pipeline
- **MTCNN Face Detection** — Biometric face localization with configurable expansion factor for robust face-crop extraction.
- **Dual-Pass Classification** — Full-scene analysis combined with face-crop verification using independent confidence thresholds (50% global, 85% face crop).
- **Temporal Consistency Analysis** — Video keyframes are individually classified, with results aggregated to detect frame-level manipulation artifacts.
- **Defect Frame Gallery** — Flagged video frames are base64-encoded with timestamps and returned to the frontend for visual timeline rendering.

### Security Hardening
- **SSRF Protection** — All outgoing requests in the `/analyze/website` endpoint resolve DNS first and block private, loopback, link-local, multicast, and reserved IP ranges.
- **Restricted CORS** — Origins explicitly allowlisted for development (`localhost:5173`, `localhost:3000`) instead of wildcard `*`.
- **Upload Limits** — Image uploads capped at 10 MB; video and audio files streamed via `shutil.copyfileobj` to prevent RAM-based denial of service.
- **Secure TLS** — Legacy unsafe SSL renegotiation flags removed from the HTTP adapter.

### Premium Frontend
- **Glassmorphism UI** — Sleek backdrop-blurred panels with animated mesh gradients.
- **Real-Time Scanning Theater** — Live terminal feed simulating facial geometry mapping and CNN confidence scoring during analysis.
- **Animated Result Dashboard** — SVG progress rings, confidence metrics, and itemized anomaly breakdowns.
- **Interactive Particle Background** — Dynamic tsParticles canvas behind all views.

---

## 🏗️ Architecture

```
deepfake-detection/
├── src/                          # React frontend (Vite)
│   ├── components/
│   │   ├── LandingPage.jsx       # Hero section & feature cards
│   │   ├── MainApplication.jsx   # Upload workspace, scanning theater, result dashboard
│   │   └── ParticleBackground.jsx
│   ├── services/
│   │   ├── apiService.js         # Axios wrapper with unified upload helper
│   │   └── apiService.test.js    # Node-native test runner tests
│   ├── App.jsx                   # Root component & page routing
│   └── index.css                 # Global styles & Tailwind imports
│
├── BACKEND/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py               # API routes: /analyze/image, /video, /audio, /website
│   │   ├── model/
│   │   │   ├── load_model.py     # Singleton ONNX Runtime session loader (self-healing)
│   │   │   ├── inference.py      # NumPy-based ONNX inference with softmax
│   │   │   ├── export_onnx.py    # MobileNetV3-Small → ONNX export script
│   │   │   └── weights/          # model.onnx + model.onnx.data (~6 MB)
│   │   └── utils/
│   │       ├── face_detection.py # MTCNN face detection & crop extraction
│   │       └── preprocessing.py  # ImageNet-normalized tensor transform pipeline
│   ├── test_main.py              # Backend unit tests (unittest + TestClient)
│   ├── Dockerfile                # Production container (python:3.10-slim)
│   ├── requirements.txt
│   └── .env.example
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── LICENSE                       # MIT
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI architecture |
| **Vite 5** | Lightning-fast dev server and build tool |
| **Tailwind CSS 3** | Utility-first styling with curated dark-mode design tokens |
| **Framer Motion** | Declarative animations, spring transitions, layout morphing |
| **Axios** | HTTP client with upload progress tracking |
| **Lucide React** | Consistent SVG iconography |
| **tsParticles** | Interactive particle canvas background |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async Python API framework |
| **ONNX Runtime** | Optimized CPU inference engine (~10 ms/image) |
| **MobileNetV3-Small** | Ultra-lightweight classifier (2.5M parameters, ~6 MB) |
| **MTCNN** (facenet-pytorch) | Face detection and biometric crop extraction |
| **OpenCV** | Video frame extraction with optimized `grab()`/`retrieve()` |
| **librosa** | Audio spectral analysis (MFCC, pitch, flatness, centroid) |
| **BeautifulSoup** | HTML parsing for website phishing heuristics |
| **Pillow** | Image I/O and preprocessing |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm — [nodejs.org](https://nodejs.org/)
- **Python** 3.10+ — [python.org](https://www.python.org/)

### 1. Clone the Repository

```bash
git clone https://github.com/ArpanHait/DEEPFAKE_DETECTION.git
cd DEEPFAKE_DETECTION
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:5173`.

### 3. Backend Setup

```bash
cd BACKEND
pip install -r requirements.txt
```

Copy the environment template and add your Hugging Face token (optional, for higher rate limits):

```bash
cp .env.example .env
```

Start the API server:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

> **Note:** On first startup, if the ONNX model file is missing, the backend will automatically export `MobileNetV3-Small` to ONNX format. This is a one-time operation.

---

## 🧪 Running Tests

### Backend Tests

```bash
cd BACKEND
python test_main.py
```

Runs 6 tests covering:
- Health check endpoint
- Image invalid content-type rejection
- SSRF IP blocking (private/loopback ranges)
- Face detection bounding box logic (mocked MTCNN)

### Frontend Tests

```bash
node --test src/services/apiService.test.js
```

Covers:
- Axios call construction and FormData generation
- Upload progress callback calculation
- Error handler branching (server error, network error, request setup error)

---

## 🐳 Docker Deployment

Build and run the backend container:

```bash
cd BACKEND
docker build -t deepguard-api .
docker run -p 10000:10000 deepguard-api
```

The Dockerfile uses `python:3.10-slim`, installs CPU-only PyTorch wheels, and exposes port `10000` for Render compatibility.

---

## ⚡ Performance

Benchmarked on a standard development CPU (no GPU):

| Metric | Value |
|---|---|
| ONNX model size | ~6 MB |
| Model parameters | 2.5M |
| Average image inference | **9.87 ms** |
| Min / Max inference | 7.99 ms / 13.74 ms |
| Memory footprint | Well within 512 MB |

---

## 🎨 Design System

- **Color Palette** — Deep slates (`slate-950`, `slate-900`) with vibrant accent colors (`blue-500`, `red-500`, `green-500`) for status indicators and data visualization.
- **Typography** — System font stack with clean, modern rendering.
- **Animations** — Framer Motion spring transitions, CSS keyframe pulsing backgrounds, and smooth layout morphing between scanning states.
- **Glassmorphism** — Backdrop-blurred panels with subtle borders for depth and layering.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
