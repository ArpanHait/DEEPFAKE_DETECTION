import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertOctagon, FileVideo, Fingerprint, RefreshCw, ShieldCheck, Terminal, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { detectDeepfake } from '../services/apiService';

const terminalSteps = [
  "Initializing temporal analysis engine...",
  "Extracting multi-frame sequences...",
  "Running facial geometry mapping...",
  "Analyzing sub-pixel artifacts...",
  "Computing CNN confidence scores...",
  "Compiling final verdict..."
];

const MainApplication = ({ onBack }) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'analyzing' | 'result'
  const [terminalFeed, setTerminalFeed] = useState([]);
  const [isFake, setIsFake] = useState(true); // Toggle for demo purposes
  const [confidence, setConfidence] = useState(0);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Real Upload Handler
  const handleUpload = async (file) => {
    setStatus('analyzing');
    setTerminalFeed([terminalSteps[0]]);
    
    // Simulate terminal feed
    let stepIndex = 1;
    const interval = setInterval(() => {
      if (stepIndex < terminalSteps.length - 1) {
        setTerminalFeed(prev => [...prev, terminalSteps[stepIndex]]);
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    try {
      const result = await detectDeepfake(file);
      clearInterval(interval);
      setTerminalFeed(prev => [...prev, terminalSteps[terminalSteps.length - 1]]);
      
      setIsFake(result.prediction === "FAKE");
      setConfidence(result.confidence);
      
      setTimeout(() => {
        setStatus('result');
      }, 800);
    } catch (error) {
      clearInterval(interval);
      setTerminalFeed(prev => [...prev, `[ERROR] ${error.message}`]);
      setTimeout(() => {
        alert(error.message);
        resetState();
      }, 3000);
    }
  };

  const resetState = () => {
    setStatus('idle');
    setTerminalFeed([]);
    setPreviewUrl('');
    setFileType('');
    setFileName('');
    setConfidence(0);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center relative overflow-y-auto min-h-[600px] h-full">
      
      {/* Top Navigation */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800 backdrop-blur-md hover:bg-slate-800"
        >
          &larr; Exit Workspace
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ===================== STATE A: IDLE (DROPZONE) ===================== */}
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Glass Highlights */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Begin Analysis</h2>
              <p className="text-slate-400">Upload a video or image file to scan for deepfake anomalies.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-2xl p-12 text-center transition-all bg-slate-800/20 hover:bg-blue-900/10"
            >
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*,image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                    setFileType(file.type.startsWith('video/') ? 'video' : 'image');
                    setFileName(file.name);
                    
                    console.log(file.name);
                    handleUpload(file);
                  }
                }}
              />
              <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors pointer-events-none opacity-0 group-hover:opacity-100"></div>
              
              <UploadCloud className="w-16 h-16 text-slate-400 group-hover:text-blue-400 mx-auto mb-4 transition-colors relative z-10" />
              <p className="text-lg font-medium text-slate-300 group-hover:text-blue-300 transition-colors mb-2 relative z-10">
                Drag & Drop or <span className="text-blue-500 underline decoration-blue-500/30">Browse</span>
              </p>
              <p className="text-sm text-slate-500 relative z-10">Supports .mp4, .mov, .jpg, .png (Max 50MB)</p>
            </div>
          </motion.div>
        )}

        {/* ===================== STATE B: ANALYZING ===================== */}
        {status === 'analyzing' && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Scanning Theater */}
            <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 lg:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative flex flex-col items-center justify-center min-h-[500px]">
              
              <div className="absolute top-4 left-4 flex items-center gap-2 text-blue-400 text-sm font-semibold tracking-wider">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>ANALYSIS IN PROGRESS</span>
              </div>

              {/* Scanning Mesh Container */}
              <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[#00FFFF]/40 aspect-video bg-[#050505] mt-8 group ring-1 ring-[#00FFFF]/30 shadow-[0_0_50px_-10px_rgba(0,255,255,0.4)] flex items-center justify-center p-2 sm:p-4 md:p-4">
                {/* Dynamically Rendered Uploaded File - Partially Grayscale */}
                <div className="relative w-full h-full z-0 flex items-center justify-center grayscale-[80%]">
                  {fileType === 'video' ? (
                    <video src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-contain drop-shadow-2xl" />
                  ) : (
                    <img src={previewUrl} className="w-full h-full object-contain drop-shadow-2xl" />
                  )}
                </div>
                
                {/* High-tech Facial Mapping Mesh Outline w/ Generous Bounding Box */}
                <svg className="absolute inset-0 w-full h-full text-[#00FFFF] pointer-events-none drop-shadow-[0_0_8px_rgba(0,255,255,1)] mix-blend-screen z-10" viewBox="0 0 160 90" preserveAspectRatio="none">
                  {/* Outer Targeting Corners */}
                  <path d="M 15 25 L 15 15 L 25 15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                  <path d="M 145 25 L 145 15 L 135 15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                  <path d="M 15 65 L 15 75 L 25 75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                  <path d="M 145 65 L 145 75 L 135 75" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />

                  {/* Nodes & Eyes */}
                  <circle cx="65" cy="35" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.7" className="animate-pulse" />
                  <circle cx="95" cy="35" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.7" className="animate-pulse" />
                  <circle cx="80" cy="50" r="1.5" fill="currentColor" className="animate-ping" />
                  
                  {/* Expanded Face Mesh Lines */}
                  <path d="M 80 10 L 55 25 L 45 45 L 60 70 L 80 80 L 100 70 L 115 45 L 105 25 Z" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.9" />
                  
                  {/* Inner Structural Connections */}
                  <path d="M 80 10 L 80 80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,2" />
                  <path d="M 45 45 L 115 45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,2" />
                  <path d="M 55 25 L 105 25" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,2" />
                  <path d="M 60 70 L 100 70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,2" />
                  
                  {/* Diagonal crosshairs */}
                  <path d="M 55 25 L 15 15" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" strokeDasharray="2,2" />
                  <path d="M 105 25 L 145 15" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" strokeDasharray="2,2" />
                  <path d="M 60 70 L 15 75" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" strokeDasharray="2,2" />
                  <path d="M 100 70 L 145 75" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" strokeDasharray="2,2" />

                  {/* Mouth Box */}
                  <rect x="65" y="60" width="30" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.9" />
                  <line x1="68" y1="64" x2="92" y2="64" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" />

                  {/* Sci-fi Overlay Decor */}
                  <text x="8" y="85" fill="currentColor" fontSize="3" fontFamily="monospace" opacity="0.6">SYS.SCAN.ACTIVE // ML-VER.9</text>
                  <text x="115" y="85" fill="currentColor" fontSize="3" fontFamily="monospace" opacity="0.6">COORD: 80.45.Z-X</text>
                  <path d="M 5 5 L 5 85" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                  <path d="M 155 5 L 155 85" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                </svg>

                {/* Scanning Laser Line */}
                <motion.div 
                  initial={{ top: '-10%' }}
                  animate={{ top: '110%' }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                  className="absolute left-0 right-0 h-[2px] bg-[#00FFFF] shadow-[0_0_20px_6px_rgba(0,255,255,0.8)] z-10"
                ></motion.div>
                
                {/* High-tech overlay grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none mix-blend-screen"></div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <FileVideo className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 font-mono text-sm">{fileName || "target_subject_01.mp4"}</span>
              </div>
            </div>

            {/* Terminal Feed */}
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl font-mono text-sm relative flex flex-col h-[400px] lg:h-auto lg:min-h-[500px]">
              <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-slate-800 pb-3">
                <Terminal className="w-5 h-5 text-slate-400" />
                <span className="uppercase tracking-wider text-xs font-semibold text-slate-400">System Logs / Verbose</span>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto w-full pr-2 container-scroll">
                {terminalFeed.map((step, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                  >
                    <span className="text-blue-500/70 select-none">&gt;</span> 
                    <span className="text-emerald-400/90">{step}</span>
                  </motion.div>
                ))}
                {terminalFeed.length < terminalSteps.length && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-slate-500 inline-block h-4 w-2 bg-slate-500 ml-5"
                  ></motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== STATE C: RESULT DASHBOARD ===================== */}
        {status === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <div className={`w-full max-w-3xl backdrop-blur-2xl border-2 rounded-3xl p-8 relative overflow-hidden transition-colors duration-500 ${
              isFake 
              ? 'bg-red-950/30 border-red-900/60 shadow-[0_0_60px_-15px_rgba(220,38,38,0.3)]' 
              : 'bg-green-950/30 border-green-900/60 shadow-[0_0_60px_-15px_rgba(22,163,74,0.3)]'
            }`}>
              
              {/* Background Glow */}
              <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px] pointer-events-none mix-blend-screen transition-colors duration-500 ${
                isFake ? 'bg-red-600/20' : 'bg-green-600/20'
              }`}></div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                
                {/* Verdict Indicator */}
                <div className="flex-1 text-center md:text-left">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", delay: 0.2 }}
                    className={`inline-flex items-center justify-center p-4 rounded-full mb-6 ${
                      isFake ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                    }`}
                  >
                    {isFake ? <AlertOctagon className="w-12 h-12 md:w-16 md:h-16" /> : <ShieldCheck className="w-12 h-12 md:w-16 md:h-16" />}
                  </motion.div>
                  
                  <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight mb-2 uppercase ${
                    isFake ? 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.4)]' : 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                  }`}>
                    {isFake ? "DEEPFAKE DETECTED" : "VERIFIED AUTHENTIC"}
                  </h2>
                  <p className="text-slate-300 text-lg max-w-md mx-auto md:mx-0">
                    {isFake 
                      ? "Severe temporal anomalies and blending artifacts found matching Generative Adversarial Network signatures." 
                      : "No signs of synthetic face-swapping manipulation or generative anomalies detected."}
                  </p>
                </div>

                {/* Confidence Score Ring */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center justify-center p-8 bg-slate-900/80 rounded-2xl border border-slate-700/50 min-w-[220px] shadow-lg"
                >
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                      <motion.circle 
                        cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="8" 
                        strokeDasharray="263.89"
                        initial={{ strokeDashoffset: 263.89 }}
                        animate={{ strokeDashoffset: 263.89 - (263.89 * confidence) }}
                        transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
                        className={isFake ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <motion.span 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                        className="text-3xl font-bold text-white"
                      >
                        {Math.round(confidence * 100)}%
                      </motion.span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Confidence</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Breakdown List (Only show if fake) */}
              {isFake && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-10 border-t border-red-900/40 pt-6"
                >
                  <h4 className="text-sm font-semibold text-red-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" />
                    Flagged Anomalies
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["Facial and Anatomical Incosistancies", "VIsual Flaws detected", "Edge-blending artifacts on lower jawline", "Inconsistent specular reflections on pupil"].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-red-200/90 bg-red-950/40 p-3 rounded-lg border border-red-900/40 shadow-inner">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 shadow-[0_0_5px_rgba(239,68,68,1)]"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Reset Button */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="mt-10 flex justify-center w-full"
              >
                <button 
                  onClick={resetState}
                  className="flex items-center justify-center gap-2 px-8 py-3 w-full md:w-auto bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-xl transition-all border border-slate-600 hover:border-slate-400 font-medium group"
                >
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  Scan Another File
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default MainApplication;
