import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileVideo, ShieldCheck, AlertOctagon, RefreshCw, Activity, Terminal } from 'lucide-react';

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

  // Mock Upload Handler
  const handleUpload = () => {
    setStatus('analyzing');
    setTerminalFeed([terminalSteps[0]]);
    
    // Simulate terminal feed
    let stepIndex = 1;
    const interval = setInterval(() => {
      if (stepIndex < terminalSteps.length) {
        setTerminalFeed(prev => [...prev, terminalSteps[stepIndex]]);
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    // Transition to result after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      // setIsFake(Math.random() > 0.5); // Can randomize, but let's keep it dramatic with true for the demo effect
      setStatus('result');
    }, 5000);
  };

  const resetState = () => {
    setStatus('idle');
    setTerminalFeed([]);
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
              onClick={handleUpload}
              className="relative group cursor-pointer border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-2xl p-12 text-center transition-all bg-slate-800/20 hover:bg-blue-900/10"
            >
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
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Scanning Theater */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative flex flex-col items-center justify-center min-h-[400px]">
              
              <div className="absolute top-4 left-4 flex items-center gap-2 text-blue-400 text-sm font-semibold tracking-wider">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>ANALYSIS IN PROGRESS</span>
              </div>

              {/* Dummy Thumbnail with Scanning Overlay */}
              <div className="relative w-full max-w-xs rounded-lg overflow-hidden border border-slate-600 aspect-[3/4] bg-slate-800 mt-8 group">
                {/* Placeholder Image/Video bg */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                
                {/* Facial Mapping Mesh Outline (Fake) */}
                <svg className="absolute inset-0 w-full h-full text-blue-500/40 pointer-events-none drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Eyes */}
                  <circle cx="35" cy="40" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse" />
                  <circle cx="65" cy="40" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse" />
                  {/* Face Mesh Lines */}
                  <path d="M 50 15 L 35 25 L 25 40 L 30 60 L 50 80 L 70 60 L 75 40 L 65 25 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M 50 15 L 50 80" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1,1" />
                  <path d="M 25 40 L 75 40" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1,1" />
                  <path d="M 35 25 L 65 25" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1,1" />
                  {/* Mouth Box */}
                  <rect x="40" y="65" width="20" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>

                {/* Scanning Laser Line */}
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_15px_3px_rgba(59,130,246,1)] z-10"
                ></motion.div>
                
                {/* High-tech overlay grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <FileVideo className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 font-mono text-sm">target_subject_01.mp4</span>
              </div>
            </div>

            {/* Terminal Feed */}
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl font-mono text-sm relative flex flex-col h-[400px]">
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
                        animate={{ strokeDashoffset: 263.89 - (263.89 * (isFake ? 0.94 : 0.98)) }}
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
                        {isFake ? "94%" : "98%"}
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
                    {["Unnatural eye blinking latency detected", "Mouth-to-audio sync error (124ms offset)", "Edge-blending artifacts on lower jawline", "Inconsistent specular reflections on pupil"].map((item, i) => (
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
