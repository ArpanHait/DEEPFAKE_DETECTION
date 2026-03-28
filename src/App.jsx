import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import MainApplication from './components/MainApplication';
import ParticleBackground from './components/ParticleBackground';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden relative selection:bg-blue-500/30">
      {/* Dark Animated Mesh Gradient semi-transparent global background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px] mix-blend-screen animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-slate-800/40 blur-[100px] mix-blend-screen"></div>
        <div className="absolute -bottom-[30%] left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-950/40 blur-[150px] mix-blend-screen animate-[pulse_6s_ease-in-out_infinite]"></div>
      </div>

      {/* Particle Network Animation Background */}
      <ParticleBackground />
      
      {/* Main Content Viewport */}
      <div className="relative z-10 flex-1 flex flex-col h-screen">
        {currentPage === 'landing' ? (
          <LandingPage onStart={() => setCurrentPage('app')} />
        ) : (
          <MainApplication onBack={() => setCurrentPage('landing')} />
        )}
      </div>
    </div>
  );
}

export default App;
