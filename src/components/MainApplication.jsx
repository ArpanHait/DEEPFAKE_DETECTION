import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertOctagon, FileAudio, FileImage, FileVideo, Fingerprint, Globe, RefreshCw, ShieldCheck, Terminal, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { analyzeImage, analyzeVideo, analyzeAudio, analyzeWebsite } from '../services/apiService';

const terminalSteps = [
  "Initializing temporal analysis engine...",
  "Extracting multi-frame sequences...",
  "Running facial geometry mapping...",
  "Analyzing sub-pixel artifacts...",
  "Computing CNN confidence scores...",
  "Compiling final verdict..."
];

const MainApplication = ({ onBack }) => {
  const [activeMode, setActiveMode] = useState(null); // 'image' | 'video' | 'audio' | 'website'
  const [status, setStatus] = useState('idle'); // 'idle' | 'analyzing' | 'result'
  
  const [terminalFeed, setTerminalFeed] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);
  
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const fileInputRef = useRef(null);

  const handleImageLoad = (e) => {
    const { width, height } = e.target.getBoundingClientRect();
    setImageDimensions({ width, height });
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle generic upload based on mode
  const handleUpload = async (file, mode) => {
    setStatus('analyzing');
    setActiveMode(mode);
    setTerminalFeed([`Initializing ${mode} analysis engine...`]);
    
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
      let result;
      if (mode === 'image') result = await analyzeImage(file);
      else if (mode === 'video') result = await analyzeVideo(file);
      else if (mode === 'audio') result = await analyzeAudio(file);

      clearInterval(interval);
      setTerminalFeed(prev => [...prev, "Analysis complete. Rendering results..."]);
      
      setPredictionResult(result);
      setTimeout(() => setStatus('result'), 800);
    } catch (error) {
      clearInterval(interval);
      setTerminalFeed(prev => [...prev, `[ERROR] ${error.message}`]);
      setTimeout(() => {
        alert(error.message);
        resetState();
      }, 3000);
    }
  };

  const handleWebsiteScan = async () => {
    if (!targetUrl) return;
    setStatus('analyzing');
    setActiveMode('website');
    setTerminalFeed(["Initializing DOM structure analysis...", "Checking WHOIS records..."]);

    const interval = setInterval(() => {
      setTerminalFeed(prev => [...prev, "Scanning for obfuscated scripts...", "Comparing layout hashes..."]);
      clearInterval(interval);
    }, 1500);

    try {
      const result = await analyzeWebsite(targetUrl);
      setTerminalFeed(prev => [...prev, "Analysis complete. Rendering results..."]);
      setPredictionResult(result);
      setTimeout(() => setStatus('result'), 800);
    } catch (error) {
      setTerminalFeed(prev => [...prev, `[ERROR] ${error.message}`]);
      setTimeout(() => {
        alert(error.message);
        resetState();
      }, 3000);
    }
  };

  const resetState = () => {
    setStatus('idle');
    setActiveMode(null);
    setTerminalFeed([]);
    setPredictionResult(null);
    setPreviewUrl('');
    setFileName('');
    setTargetUrl('');
  };

  const onFileChange = (e, mode) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileName(file.name);
      handleUpload(file, mode);
    }
  };

  const triggerFileInput = (mode) => {
    setActiveMode(mode);
    if (fileInputRef.current) {
      fileInputRef.current.accept = mode === 'image' ? 'image/*' : mode === 'video' ? 'video/*' : 'audio/*';
      fileInputRef.current.click();
    }
  };

  const isFake = predictionResult?.prediction === 'FAKE';
  const confidence = predictionResult?.confidence || 0;

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

      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => onFileChange(e, activeMode)}
      />

      <AnimatePresence mode="wait">
        
        {/* ===================== STATE A: IDLE (GRID) ===================== */}
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <div className="text-center mb-12 relative z-10">
              <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Select Target Modality</h2>
              <p className="text-slate-400 text-lg">Choose the type of media or URL to scan for manipulation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
              {/* IMAGE UPLOAD */}
              <div 
                onClick={() => triggerFileInput('image')}
                className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 cursor-pointer hover:bg-blue-900/20 hover:border-blue-500/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <FileImage className="w-12 h-12 text-slate-400 group-hover:text-blue-400 mb-4 transition-colors relative z-10" />
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">Image Analysis</h3>
                <p className="text-sm text-slate-400 relative z-10">Detect face swaps, morphing, and GAN artifacts in static images. (JPEG/PNG)</p>
              </div>

              {/* VIDEO UPLOAD */}
              <div 
                onClick={() => triggerFileInput('video')}
                className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 cursor-pointer hover:bg-purple-900/20 hover:border-purple-500/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <FileVideo className="w-12 h-12 text-slate-400 group-hover:text-purple-400 mb-4 transition-colors relative z-10" />
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">Video Deepfakes</h3>
                <p className="text-sm text-slate-400 relative z-10">Temporal analysis for flickering, blending errors, and lip-sync issues. (MP4/MOV)</p>
              </div>

              {/* AUDIO UPLOAD */}
              <div 
                onClick={() => triggerFileInput('audio')}
                className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 cursor-pointer hover:bg-emerald-900/20 hover:border-emerald-500/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <FileAudio className="w-12 h-12 text-slate-400 group-hover:text-emerald-400 mb-4 transition-colors relative z-10" />
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">Voice Cloning</h3>
                <p className="text-sm text-slate-400 relative z-10">Detect AI-synthesized voices, unnatural prosody, and vocoder artifacts. (MP3/WAV)</p>
              </div>

              {/* WEBSITE SCAN */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:bg-amber-900/20 hover:border-amber-500/50 transition-all relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div>
                  <Globe className="w-12 h-12 text-slate-400 group-hover:text-amber-400 mb-4 transition-colors relative z-10" />
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">Website Spoofing</h3>
                  <p className="text-sm text-slate-400 mb-4 relative z-10">Analyze URL DOM structure for cloned phishing layouts.</p>
                </div>
                <div className="flex gap-2 relative z-10">
                  <input 
                    type="url" 
                    placeholder="https://example.com" 
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWebsiteScan()}
                  />
                  <button 
                    onClick={handleWebsiteScan}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Scan
                  </button>
                </div>
              </div>
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
                <span>ANALYSIS IN PROGRESS [{activeMode.toUpperCase()}]</span>
              </div>

              {/* Media Preview Box */}
              <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[#00FFFF]/40 aspect-video bg-[#050505] mt-8 group ring-1 ring-[#00FFFF]/30 shadow-[0_0_50px_-10px_rgba(0,255,255,0.4)] flex items-center justify-center p-2 sm:p-4">
                <div className="relative w-full h-full z-0 flex items-center justify-center grayscale-[80%]">
                  {activeMode === 'video' && <video src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-contain" />}
                  {activeMode === 'image' && <img src={previewUrl} className="w-full h-full object-contain" />}
                  {activeMode === 'audio' && (
                    <div className="flex flex-col items-center">
                      <FileAudio className="w-24 h-24 text-emerald-500/50 mb-4 animate-pulse" />
                      <audio src={previewUrl} controls className="opacity-50" />
                    </div>
                  )}
                  {activeMode === 'website' && (
                    <div className="text-center">
                      <Globe className="w-24 h-24 text-amber-500/50 mb-4 mx-auto animate-pulse" />
                      <p className="text-amber-500/80 font-mono">{targetUrl}</p>
                    </div>
                  )}
                </div>
                
                {/* Scanning Laser Line */}
                <motion.div 
                  initial={{ top: '-10%' }}
                  animate={{ top: '110%' }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                  className="absolute left-0 right-0 h-[2px] bg-[#00FFFF] shadow-[0_0_20px_6px_rgba(0,255,255,0.8)] z-10"
                ></motion.div>
                
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none mix-blend-screen"></div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <span className="text-slate-300 font-mono text-sm">{fileName || targetUrl}</span>
              </div>
            </div>

            {/* Terminal Feed */}
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl font-mono text-sm relative flex flex-col h-[400px] lg:h-auto lg:min-h-[500px]">
              <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-slate-800 pb-3">
                <Terminal className="w-5 h-5 text-slate-400" />
                <span className="uppercase tracking-wider text-xs font-semibold text-slate-400">System Logs / Verbose</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto w-full pr-2">
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
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== STATE C: RESULT DASHBOARD ===================== */}
        {status === 'result' && predictionResult && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="w-full flex flex-col gap-8"
          >
            {/* Top Verdict Banner */}
            <div className={`w-full backdrop-blur-2xl border-2 rounded-3xl p-8 relative overflow-hidden transition-colors duration-500 ${
              isFake ? 'bg-red-950/30 border-red-900/60' : 'bg-green-950/30 border-green-900/60'
            }`}>
              <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px] pointer-events-none mix-blend-screen transition-colors duration-500 ${
                isFake ? 'bg-red-600/20' : 'bg-green-600/20'
              }`}></div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="flex-1 text-center md:text-left">
                  <div className={`inline-flex items-center justify-center p-4 rounded-full mb-6 ${
                    isFake ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                  }`}>
                    {isFake ? <AlertOctagon className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
                  </div>
                  <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight mb-2 uppercase ${
                    isFake ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {isFake ? "MANIPULATION DETECTED" : "VERIFIED AUTHENTIC"}
                  </h2>
                  <p className="text-slate-300 text-lg">
                    {isFake ? `High probability of synthetic manipulation found in ${activeMode}.` : `No anomalies detected in ${activeMode}.`}
                  </p>
                </div>
                
                {/* Confidence Score */}
                <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 rounded-2xl border border-slate-700/50 min-w-[220px]">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                      <circle 
                        cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="8" 
                        strokeDasharray="263.89"
                        strokeDashoffset={263.89 - (263.89 * confidence)}
                        className={isFake ? "text-red-500" : "text-green-500"}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-bold text-white">{Math.round(confidence * 100)}%</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Granular Evidence View */}
            {(isFake || activeMode === 'website' || activeMode === 'image' || activeMode === 'audio') && (
              <div className={`w-full bg-slate-900/50 border rounded-3xl p-8 transition-all duration-500 ${
                isFake ? 'border-slate-700/50' : 'border-green-800/40 shadow-[0_0_50px_rgba(34,197,94,0.08)]'
              }`}>
                <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4 flex items-center gap-2">
                  {isFake ? (
                    <Fingerprint className="text-red-400" />
                  ) : (
                    <ShieldCheck className="text-green-400" />
                  )} 
                  {isFake ? "Evidence & Analysis Report" : "Trust & Security Report"}
                </h3>
                
                {/* IMAGE EVIDENCE */}
                {activeMode === 'image' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Image Preview with Bounding Boxes */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 flex justify-center items-center bg-black/50 p-4 min-h-[300px]">
                      <div className="relative" style={{ width: imageDimensions.width || 'auto', height: imageDimensions.height || 'auto' }}>
                        <img 
                           src={previewUrl} 
                           alt="Analyzed" 
                           onLoad={handleImageLoad}
                           className="max-h-[400px] object-contain opacity-70" 
                        />
                        {/* Red Manipulation Bounding Boxes (for FAKE) */}
                        {isFake && imageDimensions.width > 0 && predictionResult.original_width && (
                          predictionResult.manipulated_boxes?.map((box, i) => {
                            const scaleX = imageDimensions.width / predictionResult.original_width;
                            const scaleY = imageDimensions.height / predictionResult.original_height;
                            return (
                              <div 
                                key={i} 
                                className="absolute border-2 border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"
                                style={{
                                  left: `${box.x * scaleX}px`,
                                  top: `${box.y * scaleY}px`,
                                  width: `${box.width * scaleX}px`,
                                  height: `${box.height * scaleY}px`
                                }}
                              >
                                <span className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap font-sans">
                                  Defect Area {i+1}
                                </span>
                              </div>
                            );
                          })
                        )}
                        {/* Green Biometric Alignment Bounding Box (for REAL with detected face) */}
                        {!isFake && imageDimensions.width > 0 && predictionResult.original_width && predictionResult.image_details?.face_box && (
                          (() => {
                            const box = predictionResult.image_details.face_box;
                            const scaleX = imageDimensions.width / predictionResult.original_width;
                            const scaleY = imageDimensions.height / predictionResult.original_height;
                            return (
                              <div 
                                className="absolute border-2 border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                style={{
                                  left: `${box.x * scaleX}px`,
                                  top: `${box.y * scaleY}px`,
                                  width: `${box.width * scaleX}px`,
                                  height: `${box.height * scaleY}px`
                                }}
                              >
                                <span className="absolute -top-6 left-0 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap font-sans flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> Face Crop Secured
                                </span>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    </div>

                    {/* Right Column: Scan Diagnostics & Logs */}
                    <div className="space-y-6">
                      {/* Image Profile Card */}
                      {predictionResult.image_details && (
                        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                          <h4 className="text-slate-300 font-bold uppercase text-sm tracking-wider flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
                            <FileImage className="w-5 h-5 text-blue-400" /> Image Scan Profile
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-slate-400">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Dimensions</span>
                              <span className="text-white font-semibold text-sm">{predictionResult.image_details.dimensions}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Biometric Lock</span>
                              <span className="text-emerald-400 font-semibold text-sm">
                                {predictionResult.image_details.face_detected ? "Verified (Face Extracted)" : "Not Found (Global Only)"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Analysis Mode</span>
                              <span className="text-purple-400 font-semibold text-sm">
                                {predictionResult.image_details.face_detected ? "Dual-Engine Ensemble" : "Single-Engine Full Scene"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Processing Speed</span>
                              <span className="text-amber-400 font-semibold text-sm">{predictionResult.processing_time_ms} ms</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Diagnostic Scan Logs */}
                      {predictionResult.diagnostic_checks && predictionResult.diagnostic_checks.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-slate-300 font-semibold uppercase text-sm tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-400" /> Neural Network Verification Logs
                          </h4>
                          <div className="space-y-3">
                            {predictionResult.diagnostic_checks.map((item, i) => {
                              const isPassed = item.status === "PASSED";
                              const isWarning = item.status === "WARNING";
                              const isInfo = item.status === "INFO";
                              return (
                                <div key={i} className={`border rounded-xl p-4 flex gap-4 items-start ${
                                  isPassed ? 'bg-green-950/10 border-green-900/30' : isWarning ? 'bg-amber-950/10 border-amber-900/30' : isInfo ? 'bg-blue-950/10 border-blue-900/30' : 'bg-red-950/15 border-red-900/40'
                                }`}>
                                  <div className={`p-2 rounded-lg shrink-0 ${
                                    isPassed ? 'bg-green-500/10 text-green-400' : isWarning ? 'bg-amber-500/10 text-amber-400' : isInfo ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {isPassed || isInfo ? <ShieldCheck className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-1">
                                    <span className={`block font-semibold mb-1 text-sm ${
                                      isPassed ? 'text-green-400' : isWarning ? 'text-amber-400' : isInfo ? 'text-blue-400' : 'text-red-400'
                                    }`}>{item.name}</span>
                                    <p className="text-slate-300 text-xs leading-relaxed">{item.message}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* VIDEO EVIDENCE */}
                {activeMode === 'video' && (
                  <div className="space-y-6">
                    <h4 className="text-red-400 font-semibold uppercase text-sm tracking-wider">Flagged Temporal Frames</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {predictionResult.defect_frames?.map((frame, i) => (
                        <div key={i} className="min-w-[280px] bg-red-950/30 border border-red-900/50 rounded-xl p-4 shrink-0">
                          <div className="w-full h-32 bg-black/60 rounded-lg mb-3 flex items-center justify-center border border-red-500/30 overflow-hidden">
                            {frame.frame_base64 ? (
                              <img src={frame.frame_base64} alt={`Frame at ${frame.timestamp}`} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-red-500/50 font-mono text-sm">[FRAME DATA AT {frame.timestamp}]</span>
                            )}
                          </div>
                          <span className="block text-red-300 font-mono text-lg mb-1">{frame.timestamp}</span>
                          <span className="text-slate-400 text-sm">{frame.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AUDIO EVIDENCE */}
                {activeMode === 'audio' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Audio Profile Card */}
                    {predictionResult.audio_details && (
                      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        <h4 className="text-slate-300 font-bold uppercase text-sm tracking-wider flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
                          <FileAudio className="w-5 h-5 text-emerald-400" /> Audio Scan Profile
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-slate-400">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block mb-1">Vocal Duration</span>
                            <span className="text-white font-semibold text-sm">{predictionResult.audio_details.duration_seconds} seconds</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block mb-1">Sample Rate</span>
                            <span className="text-emerald-400 font-semibold text-sm">{predictionResult.audio_details.sample_rate} Hz</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block mb-1">Mean Spectral Centroid</span>
                            <span className="text-purple-400 font-semibold text-sm">{predictionResult.audio_details.average_spectral_centroid} Hz</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block mb-1">Analysis Model</span>
                            <span className="text-blue-400 font-semibold text-sm">{predictionResult.audio_details.model_name}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Right Column: Scan Diagnostics & Manipulated Segments */}
                    <div className="space-y-6">
                      {/* Diagnostic Scan Logs */}
                      {predictionResult.diagnostic_checks && predictionResult.diagnostic_checks.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-slate-300 font-semibold uppercase text-sm tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" /> Acoustic Consistency Logs
                          </h4>
                          <div className="space-y-3">
                            {predictionResult.diagnostic_checks.map((item, i) => {
                              const isPassed = item.status === "PASSED";
                              return (
                                <div key={i} className={`border rounded-xl p-4 flex gap-4 items-start ${
                                  isPassed ? 'bg-green-950/10 border-green-900/30' : 'bg-red-950/15 border-red-900/40'
                                }`}>
                                  <div className={`p-2 rounded-lg shrink-0 ${
                                    isPassed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {isPassed ? <ShieldCheck className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-1">
                                    <span className={`block font-semibold mb-1 text-sm ${
                                      isPassed ? 'text-green-400' : 'text-red-400'
                                    }`}>{item.name}</span>
                                    <p className="text-slate-300 text-xs leading-relaxed">{item.message}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Flagged Manipulated Vocal Segments */}
                      {isFake && predictionResult.manipulated_segments && predictionResult.manipulated_segments.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-red-400 font-semibold uppercase text-sm tracking-wider flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4" /> Flagged Temporal Discontinuities
                          </h4>
                          <div className="space-y-3">
                            {predictionResult.manipulated_segments.map((seg, i) => (
                              <div key={i} className="flex items-center gap-4 bg-red-950/20 border border-red-900/40 rounded-xl p-4 hover:bg-red-950/30 transition-colors">
                                <div className="px-3 py-1 bg-red-900/50 rounded-md text-red-300 font-mono text-sm">
                                  {seg.start} - {seg.end}
                                </div>
                                <span className="text-slate-300 text-sm flex-1">{seg.reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* WEBSITE EVIDENCE & TRUST REPORT */}
                {activeMode === 'website' && (
                  <div className="space-y-8">
                    {/* Website Profile Card */}
                    {predictionResult.website_details && (
                      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        <h4 className="text-slate-300 font-bold uppercase text-sm tracking-wider flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
                          <Globe className="w-5 h-5 text-blue-400" /> Website Profile & Metadata
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Left Details */}
                          <div className="md:col-span-2 space-y-4">
                            <div>
                              <span className="text-xs text-slate-500 uppercase font-mono">Site Title</span>
                              <span className="block text-white text-lg font-bold mt-1 leading-snug">
                                {predictionResult.website_details.title}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500 uppercase font-mono">Meta Description</span>
                              <span className="block text-slate-300 text-sm mt-1 leading-relaxed">
                                {predictionResult.website_details.description}
                              </span>
                            </div>
                            {predictionResult.website_details.primary_purpose && (
                              <div>
                                <span className="text-xs text-slate-500 uppercase font-mono">Parsed Site Focus</span>
                                <span className="block text-slate-300 text-sm mt-1 leading-relaxed italic border-l-2 border-blue-500/40 pl-3">
                                  "{predictionResult.website_details.primary_purpose}"
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Right Details (Server info) */}
                          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 space-y-4 font-mono text-xs text-slate-400">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Scanned Host</span>
                              <span className="text-blue-400 font-semibold text-sm break-all">
                                {predictionResult.url_scanned ? new URL(predictionResult.url_scanned).hostname : targetUrl}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">IP Address</span>
                              <span className="text-emerald-400 font-semibold text-sm">{predictionResult.website_details.ip_address}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Server Software</span>
                              <span className="text-purple-400 font-semibold text-sm">{predictionResult.website_details.server}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Spoofed Elements (Errors/Phishing indicators) */}
                    {predictionResult.spoofed_elements && predictionResult.spoofed_elements.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-red-400 font-semibold uppercase text-sm tracking-wider flex items-center gap-2">
                          <AlertOctagon className="w-4 h-4" /> Spoofed DOM Elements & Risks
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {predictionResult.spoofed_elements.map((item, i) => (
                            <div key={i} className="bg-red-950/20 border border-red-900/40 rounded-xl p-5 hover:bg-red-950/30 transition-colors">
                              <div className="bg-black/50 p-3 rounded-lg border border-red-500/20 font-mono text-xs text-red-400 mb-3 overflow-x-auto">
                                {item.element}
                              </div>
                              <span className="text-slate-300 text-sm font-medium">{item.issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Genuine Indicators (Passed security criteria) */}
                    {predictionResult.genuine_indicators && predictionResult.genuine_indicators.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-green-400 font-semibold uppercase text-sm tracking-wider flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Verified Safety Indicators
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {predictionResult.genuine_indicators.map((item, i) => (
                            <div key={i} className="bg-green-950/10 border border-green-900/30 rounded-xl p-5 hover:bg-green-950/20 transition-all flex gap-4 items-start">
                              <div className="p-2 bg-green-500/10 rounded-lg text-green-400 shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="block text-green-400 font-semibold mb-1 text-base">{item.check}</span>
                                <span className="text-slate-300 text-sm leading-relaxed">{item.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reset Button */}
            <div className="flex justify-center mt-4">
              <button 
                onClick={resetState}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium group shadow-lg shadow-blue-900/20"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Detect More (Reset Session)
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default MainApplication;
