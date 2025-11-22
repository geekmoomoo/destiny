import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import type { User } from 'firebase/auth';

interface LandingScreenProps {
  onStart: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, user, onLogin, onLogout }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden px-6 pb-20">
      
      {/* AI Logo Animation */}
      <div className="mb-12 relative w-40 h-40 flex items-center justify-center">
         <div className="absolute inset-0 bg-gold-500/10 blur-3xl rounded-full animate-pulse-slow" />
         
         {/* Outer Ring */}
         <div className="absolute w-32 h-32 border border-gold-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
         <div className="absolute w-28 h-28 border border-dashed border-gold-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
         
         {/* Center Star */}
         <Star className="w-12 h-12 text-gold-100 fill-gold-100/20 animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
         
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