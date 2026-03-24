import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Crosshair, Fingerprint, ArrowRight } from 'lucide-react';

const LandingPage = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-24 h-full relative overflow-y-auto">
      {/* Header Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-950/30 backdrop-blur-sm mb-8 mt-12 md:mt-0"
      >
        <ShieldAlert className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Enterprise-Grade Detection System</span>
      </motion.div>

      {/* Main Headline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-slate-100 via-blue-100 to-slate-500 [text-shadow:0_0_30px_rgba(59,130,246,0.2)]">
          Unmask the Truth. <br className="hidden md:block"/>
          Detect Deepfakes in <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]">Real-Time.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Powered by advanced CNN-based temporal analysis. We extract facial geometry, map micro-expressions, and analyze pixel-level artifacts to instantly identify AI-generated face-swaps.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col md:flex-row gap-6 mb-16 w-full max-w-4xl mx-auto"
      >
        {[
          { icon: <Fingerprint className="text-blue-400"/>, title: "Biometric Mapping", desc: "Sub-pixel motion and expression analysis." },
          { icon: <Crosshair className="text-green-400"/>, title: "Artifact Detection", desc: "Identify blending boundaries and GAN signatures." },
        ].map((feature, i) => (
          <div key={i} className="flex-1 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex items-start gap-4 hover:bg-slate-800/50 transition-colors shadow-xl">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              {feature.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-sans rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 focus:ring-offset-blue-600 hover:bg-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] hover:shadow-[0_0_45px_-5px_rgba(59,130,246,0.8)] border border-blue-400/50"
      >
        <span className="mr-3 text-lg">Let's Check</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        
        {/* Button Inner Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity blur-md pointer-events-none"></div>
      </motion.button>
    </div>
  );
};

export default LandingPage;
