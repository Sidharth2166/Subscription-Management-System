import React from 'react';
import { motion } from 'framer-motion';

export const CssGlassPlatesFallback: React.FC = () => {
  return (
    <div className="relative w-full h-[450px] sm:h-[520px] flex items-center justify-center select-none overflow-hidden">
      {/* Concentric Orbit Rings */}
      <div className="orbit-ring w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] animate-spin-slow opacity-30" />
      <div className="orbit-ring w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] opacity-20" />
      <div className="orbit-ring w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] opacity-25" />

      {/* Central Volumetric Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-neon/20 blur-[80px] pointer-events-none" />

      {/* Stacked Fanned Glass Slabs (matching Reference Image 1) */}
      <div className="relative w-64 h-80 sm:w-80 sm:h-96" style={{ perspective: '1000px' }}>
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const zOffset = index * 24;
          const rotateZ = -22 + index * 4;
          const rotateY = -28 + index * 2;
          const rotateX = 35 - index * 3;
          const opacity = 0.5 + index * 0.08;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: opacity,
                y: [0, -12, 0],
                rotateX: [rotateX, rotateX + 2, rotateX],
                rotateY: [rotateY, rotateY - 2, rotateY],
                rotateZ: [rotateZ, rotateZ + 1, rotateZ],
              }}
              transition={{
                duration: 6 + index * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.15,
              }}
              style={{
                position: 'absolute',
                top: `${index * 14}px`,
                left: `${index * 16}px`,
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                background: `linear-gradient(135deg, rgba(85, 255, 118, ${0.12 - index * 0.015}) 0%, rgba(18, 201, 75, 0.04) 40%, rgba(255, 255, 255, 0.03) 100%)`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(85, 255, 118, 0.35)',
                boxShadow: `
                  0 20px 50px rgba(0, 0, 0, 0.8),
                  inset 0 1px 2px rgba(255, 255, 255, 0.25),
                  0 0 25px rgba(85, 255, 118, ${0.25 - index * 0.03})
                `,
                transformStyle: 'preserve-3d',
                transform: `translateZ(${zOffset}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
              }}
            >
              {/* Inner Rim Light Streak */}
              <div className="absolute top-2 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-neon/40 to-transparent rounded-full" />
              <div className="absolute bottom-3 left-4 text-[10px] font-mono tracking-widest text-neon/40">
                0{index + 1} // REVENUE_LAYER
              </div>
            </motion.div>
          );
        })}

        {/* Floating Glass Geometric Objects (Torus, Cross, Cube - Reference Image 3) */}
        {/* Floating Glass Cube */}
        <motion.div
          animate={{
            y: [-15, 15, -15],
            rotateX: [0, 360],
            rotateY: [0, 180],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-10 -right-8 w-12 h-12 rounded-xl bg-gradient-to-br from-neon/25 to-surface/80 border border-neon/50 shadow-[0_0_20px_rgba(85,255,118,0.4)] backdrop-blur-md"
        />

        {/* Floating Glass Cross */}
        <motion.div
          animate={{
            y: [12, -12, 12],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-6 -left-6 w-10 h-10 flex items-center justify-center text-neon font-black text-2xl filter drop-shadow-[0_0_12px_rgba(85,255,118,0.7)]"
        >
          +
        </motion.div>

        {/* Floating Mini Glowing Ring / Torus */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            y: [-8, 8, -8],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-6 -left-8 w-10 h-10 rounded-full border-2 border-neon/60 shadow-[0_0_18px_rgba(85,255,118,0.5)]"
        />
      </div>
    </div>
  );
};
