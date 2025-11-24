import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { User } from 'firebase/auth';

interface LandingScreenProps {
  onStart: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

// Simple custom sigil to replace the plain star icon.
const MysticSigil = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sigilGlow" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
        <stop offset="45%" stopColor="#C084FC" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#0B0B16" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="sigilStroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#A78BFA" />
      </linearGradient>
    </defs>
    <circle cx="48" cy="48" r="36" fill="url(#sigilGlow)" />
    <path
      d="M48 14 L56 38 L82 38 L60 52 L68 78 L48 62 L28 78 L36 52 L14 38 L40 38 Z"
      fill="none"
      stroke="url(#sigilStroke)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="48" cy="48" r="6" fill="#FDE68A" />
    <circle cx="48" cy="48" r="16" stroke="url(#sigilStroke)" strokeWidth="1.5" strokeDasharray="4 4" />
    <circle cx="48" cy="48" r="24" stroke="url(#sigilStroke)" strokeWidth="1" strokeDasharray="2 6" opacity="0.6" />
  </svg>
);

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, user, onLogin, onLogout }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden px-6 pb-20">
      
      {/* AI Logo Animation */}
      <div className="mb-12 relative w-40 h-40 flex items-center justify-center">
         <div className="absolute inset-0 bg-gold-500/10 blur-3xl rounded-full animate-pulse-slow" />
         
         {/* Outer Ring */}
         <div className="absolute w-32 h-32 border border-gold-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
         <div className="absolute w-28 h-28 border border-dashed border-gold-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
         
         {/* Orbiting Particles */}
         <div className="absolute top-0 left-1/2 w-1 h-1 bg-gold-100 rounded-full shadow-[0_0_5px_white] animate-ping" />
      </div>

      <motion.div
        className="z-10 flex flex-col items-center text-center max-w-lg w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-gold-100 to-gold-600/50 leading-tight tracking-tight font-serif drop-shadow-2xl">
          운명의<br/>갈림길
        </h1>

        <p className="text-xs md:text-sm text-white/50 font-light mb-16 leading-7 tracking-wide">
          별들의 속삭임이 당신의 길을 비춥니다.<br/>
          당신만의 이야기를 시작하세요.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-[200px]">
            <motion.button
                onClick={onStart}
                className="group relative px-8 py-4 w-full rounded-full overflow-hidden bg-void-800 border border-gold-500/30 hover:border-gold-400 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-center gap-3 text-gold-100 font-bold tracking-[0.2em] text-xs">
                    <span>운명 확인하기</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
