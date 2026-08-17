import React, { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export const ParticleBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = {
    background: {
      color: {
        value: '#121212'
      }
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab'
        }
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.35,
            color: '#00E5FF'
          }
        }
      }
    },
    particles: {
      color: {
        value: ['#00E5FF', '#00FFCC', '#FFEA00', '#9D00FF']
      },
      links: {
        color: '#334155',
        distance: 130,
        enable: true,
        opacity: 0.18,
        width: 1
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce'
        },
        random: false,
        speed: 0.8,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 900
        },
        value: 45
      },
      opacity: {
        value: 0.3
      },
      shape: {
        type: 'circle'
      },
      size: {
        value: { min: 1, max: 3 }
      }
    },
    detectRetina: true
  };

  if (!init) {
    return <div className="particle-canvas-wrapper" />;
  }

  return (
    <div className="particle-canvas-wrapper">
      <Particles id="tsparticles" options={particlesOptions} />
    </div>
  );
};
