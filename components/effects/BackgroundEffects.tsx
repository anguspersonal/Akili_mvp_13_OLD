import React from 'react';
import { motion } from 'motion/react';

// Advanced Multi-Layer Particle System
export function AdvancedParticleSystem({ theme }: { theme: string }) {
  const primaryParticleCount = 12;
  const secondaryParticleCount = 8;
  const accentParticleCount = 6;
  
  const primaryParticles = Array.from({ length: primaryParticleCount }, (_, i) => i);
  const secondaryParticles = Array.from({ length: secondaryParticleCount }, (_, i) => i);
  const accentParticles = Array.from({ length: accentParticleCount }, (_, i) => i);

  const getParticleColors = (theme: string) => {
    switch (theme) {
      case 'light':
        return {
          primary: ['#4ecdc4', '#ff6b9d', '#ffe66d', '#a8e6cf'],
          secondary: ['#00cec9', '#fd79a8', '#e17055', '#74b9ff'],
          accent: ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e']
        };
      case 'darker':
        return {
          primary: ['#a8e6cf', '#4ecdc4', '#ff6b9d', '#74b9ff'],
          secondary: ['#00cec9', '#6c5ce7', '#fd79a8', '#fdcb6e'],
          accent: ['#e17055', '#a29bfe', '#ff7675', '#55a3ff']
        };
      default: // dark
        return {
          primary: ['#4ecdc4', '#a8e6cf', '#ff6b9d', '#ffe66d'],
          secondary: ['#74b9ff', '#6c5ce7', '#fd79a8', '#00cec9'],
          accent: ['#fdcb6e', '#e17055', '#a29bfe', '#ff7675']
        };
    }
  };

  const colors = getParticleColors(theme);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary Particle Layer */}
      {primaryParticles.map((particle) => (
        <motion.div
          key={`primary-${particle}`}
          className="absolute rounded-full opacity-15"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            backgroundColor: colors.primary[particle % colors.primary.length],
            boxShadow: `0 0 8px ${colors.primary[particle % colors.primary.length]}`,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            scale: [0.3, 1.5, 0.8, 1.2, 0.6],
            rotate: [0, 180, 360, 540, 720],
          }}
          transition={{
            duration: Math.random() * 25 + 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}

      {/* Secondary Particle Layer */}
      {secondaryParticles.map((particle) => (
        <motion.div
          key={`secondary-${particle}`}
          className="absolute rounded-full blur-sm opacity-10"
          style={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            backgroundColor: colors.secondary[particle % colors.secondary.length],
            boxShadow: `0 0 12px ${colors.secondary[particle % colors.secondary.length]}`,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.8 + 0.4,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            scale: [0.4, 1.8, 0.6, 1.4, 0.8],
            opacity: [0.05, 0.15, 0.08, 0.12, 0.06],
          }}
          transition={{
            duration: Math.random() * 30 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Accent Particle Layer */}
      {accentParticles.map((particle) => (
        <motion.div
          key={`accent-${particle}`}
          className="absolute rounded-full opacity-8"
          style={{
            width: Math.random() * 2 + 0.5 + 'px',
            height: Math.random() * 2 + 0.5 + 'px',
            backgroundColor: colors.accent[particle % colors.accent.length],
            boxShadow: `0 0 6px ${colors.accent[particle % colors.accent.length]}`,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.3 + 0.2,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            scale: [0.2, 1.0, 0.4],
            rotate: [0, 720],
          }}
          transition={{
            duration: Math.random() * 35 + 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 12,
          }}
        />
      ))}
    </div>
  );
}

// Enhanced Gradient Mesh Background
export function GradientMeshBackground({ theme }: { theme: string }) {
  const meshCount = 4;
  const meshElements = Array.from({ length: meshCount }, (_, i) => i);

  const getGradientColors = (theme: string) => {
    switch (theme) {
      case 'light':
        return [
          'radial-gradient(circle at 20% 30%, rgba(78, 205, 196, 0.08) 0%, transparent 70%)',
          'radial-gradient(circle at 80% 70%, rgba(255, 107, 157, 0.06) 0%, transparent 70%)',
          'radial-gradient(circle at 50% 50%, rgba(255, 230, 109, 0.04) 0%, transparent 80%)',
          'radial-gradient(circle at 30% 80%, rgba(168, 230, 207, 0.05) 0%, transparent 75%)',
        ];
      case 'darker':
        return [
          'radial-gradient(circle at 25% 25%, rgba(168, 230, 207, 0.04) 0%, transparent 65%)',
          'radial-gradient(circle at 75% 75%, rgba(255, 107, 157, 0.03) 0%, transparent 65%)',
          'radial-gradient(circle at 50% 20%, rgba(116, 185, 255, 0.02) 0%, transparent 75%)',
          'radial-gradient(circle at 80% 40%, rgba(108, 92, 231, 0.025) 0%, transparent 70%)',
        ];
      default: // dark
        return [
          'radial-gradient(circle at 30% 40%, rgba(168, 230, 207, 0.05) 0%, transparent 60%)',
          'radial-gradient(circle at 70% 60%, rgba(255, 107, 157, 0.04) 0%, transparent 60%)',
          'radial-gradient(circle at 20% 80%, rgba(78, 205, 196, 0.03) 0%, transparent 70%)',
          'radial-gradient(circle at 90% 20%, rgba(116, 185, 255, 0.035) 0%, transparent 65%)',
        ];
    }
  };

  const gradients = getGradientColors(theme);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {meshElements.map((mesh, index) => (
        <motion.div
          key={`mesh-${mesh}`}
          className="absolute inset-0"
          style={{
            background: gradients[index % gradients.length],
          }}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.4, 0.6, 0.3],
            scale: [0.8, 1.2, 0.9, 1.1, 0.8],
            rotate: [0, 10, -5, 8, 0],
          }}
          transition={{
            duration: Math.random() * 40 + 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 15,
          }}
        />
      ))}
    </div>
  );
}

// Enhanced Floating Orbs with More Sophisticated Animation
export function EnhancedFloatingOrbs({ theme }: { theme: string }) {
  const orbCount = 8;
  const orbs = Array.from({ length: orbCount }, (_, i) => i);

  const getOrbGradients = (theme: string) => {
    switch (theme) {
      case 'light':
        return [
          'linear-gradient(45deg, #4ecdc4, #ff6b9d)',
          'linear-gradient(135deg, #ffe66d, #ff8c42)',
          'linear-gradient(225deg, #a8e6cf, #74b9ff)',
          'linear-gradient(315deg, #fd79a8, #6c5ce7)',
        ];
      case 'darker':
        return [
          'linear-gradient(45deg, #a8e6cf, #4ecdc4)',
          'linear-gradient(135deg, #ff6b9d, #74b9ff)',
          'linear-gradient(225deg, #6c5ce7, #fd79a8)',
          'linear-gradient(315deg, #00cec9, #e17055)',
        ];
      default: // dark
        return [
          'linear-gradient(45deg, #4ecdc4, #a8e6cf)',
          'linear-gradient(135deg, #ff6b9d, #ffe66d)',
          'linear-gradient(225deg, #74b9ff, #6c5ce7)',
          'linear-gradient(315deg, #fd79a8, #00cec9)',
        ];
    }
  };

  const gradients = getOrbGradients(theme);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbs.map((orb) => (
        <motion.div
          key={`orb-${orb}`}
          className="absolute rounded-full blur-2xl opacity-8"
          style={{
            width: `${Math.random() * 250 + 150}px`,
            height: `${Math.random() * 250 + 150}px`,
            background: gradients[orb % gradients.length],
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            scale: [1, 1.4, 0.6, 1.2, 0.8, 1],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.05, 0.12, 0.08, 0.15, 0.06, 0.1],
          }}
          transition={{
            duration: Math.random() * 50 + 40,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 20,
          }}
        />
      ))}
    </div>
  );
}