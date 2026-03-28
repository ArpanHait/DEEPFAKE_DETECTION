import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ParticleBackground = () => {
  // useCallback prevents unnecessary re-initializations of the engine
  const particlesInit = useCallback(async (engine) => {
    // loadSlim initializes only the core features needed for this effect
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      // Tailwind classes. 'absolute inset-0' stretches it across the parent
      // '-z-10 bg-transparent' keeps it behind while showing any background behind it
      className="absolute inset-0 z-0" 
      options={{
        background: {
          color: {
            value: "#1A202C", // Solid dark slate-grey background
          },
        },
        fpsLimit: 120, // High FPS for smooth animations
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse", // Gently push particles away on hover
            },
            resize: true, // Automatically handle window resizing
          },
          modes: {
            repulse: {
              distance: 120, // Radius of the repulsion effect
              duration: 0.4, // Smooth transition back to original path
              speed: 0.05, // Slows down the speed of particles moving away
              // factor: 0.1, // Decreases the force of the repulsion
            },
          },
        },
        particles: {
          color: {
            value: "#00FFFF", // Neon cyan/electric blue
          },
          links: {
            color: "#00FFFF",
            distance: 150, // Create connections when within 150px
            enable: true,
            opacity: 0.23, // Thin, subtle lines
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce", // Keep particles within the screen softly bouncing off edges
            },
            random: true, 
            speed: 1, // Slow, peaceful, smooth floating
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800, // Regulate particle count based on screen size
            },
            value: 70, // Balanced density modifier
          },
          opacity: {
            value: 0.7, 
          },
          shape: {
            type: "circle",
          },
          size: {
          value: { min: 1, max: 2.5 }, // Increased particle size
          },
        },
        detectRetina: true, // Auto-scale for high-resolution displays
      }}
    />
  );
};

export default ParticleBackground;
