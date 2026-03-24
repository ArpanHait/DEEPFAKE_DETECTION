# AI Deepfake Detection System

An enterprise-grade, high-fidelity React frontend for an AI/ML Face-Swap Deepfake Detection System. Built with a focus on modern, dark-themed aesthetics, this project features interactive animations, glassmorphism UI elements, and a multi-state scanning workspace.

## 🚀 Features

### 1. Striking Landing Page
- **Hero Section**: High-impact headline with dynamic text gradients and glow effects.
- **Feature Highlights**: Informative cards detailing core capabilities (Biometric Mapping, Artifact Detection) with hover interactions.
- **Glassmorphism Design**: Sleek, backdrop-blurred elements providing depth and a modern aesthetic.

### 2. Interactive Workspace (Multi-State)
- **Idle Dropzone**: An intuitive drag-and-drop interface accepting `.mp4`, `.mov`, `.jpg`, and `.png` files, complete with hover states and subtle glow effects.
- **Analyzing Theater**: A simulated real-time analysis environment featuring:
  - A scanning mesh overlay mimicking facial geometry mapping.
  - A live terminal feed component displaying mock system logs (temporal analysis, sub-pixel artifact detection, CNN confidence scoring).
- **Result Dashboard**: High-contrast, dynamic outcome representation:
  - **Verdict Indicator**: Clear visual cues (Red for Detected, Green for Authentic).
  - **Confidence Metrics**: An animated SVG progress ring detailing the detection confidence percentage.
  - **Anomaly Breakdown**: Itemized list of flagged anomalies (e.g., unnatural eye blinking latency, edge-blending artifacts) when a deepfake is detected.

### 3. Modern Tech Stack
- **React.js 18**: Robust component-based architecture.
- **Vite 5**: Lightning-fast build tool and development server.
- **Tailwind CSS 3**: Utility-first styling for rapid UI development and customized design tokens (dark mode curated).
- **Framer Motion**: Smooth, declarative animations and gesture handling tailored for layout transitions and micro-interactions.
- **Lucide React**: Clean, consistent SVG iconography.

## 🛠️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (Version 18+ recommended) and npm installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-github-repo-url>
   cd deepfake-detection
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

## 📁 Project Structure
- `src/components/LandingPage.jsx` - The introductory hero section and feature cards.
- `src/components/MainApplication.jsx` - The core interactive workspace handling file upload, the scanning simulation, and verdict dashboard.
- `src/App.jsx` - Root component handling state switching between the landing page and the main application with animated mesh gradients.
- `src/index.css` - Global CSS containing custom fonts and Tailwind imports.

## 🎨 Design System
- **Color Palette**: Curated dark theme focused on deep slates (`slate-950`, `slate-900`) contrasted by vibrant accents (`blue-500`, `red-500`, `green-500`) for data visualization and status indicators.
- **Animations**: Extensive use of Framer Motion for component mounts, spring animations for result pop-ups, and CSS keyframes for background pulsing.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
