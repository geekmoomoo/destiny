import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

const LOADING_MESSAGES = [
  "별들의 위치를 재배열하고 있습니다...",
  "당신의 무의식 속 파동을 해석합니다...",
  "시공간 너머의 메시지를 수신 중...",
  "운명의 실타래가 엮어지고 있습니다...",
  "단 하나뿐인 진실이 드러납니다..."
];

const LoadingScreen: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 4000); // Slowed down
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10 px-6 text-center overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-mystic-glow/5 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Central Alignment Animation */}
      <div className="relative mb-16">
        {/* Rotating Rings - Slower */}
        <motion.div 
            className="w-48 h-48 border border-white/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
            <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gold-300 rounded-full shadow-[0_0_10px_#fcd34d]" />
        </motion.div>
        <motion.div 
            className="w-32 h-32 border border-gold-500/30 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
            <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_#a855f7]" />
        </motion.div>

        {/* Center Star */}
        <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
        >
            <Star className="w-16 h-16 text-white fill-white/20" />
        </motion.div>
      </div>
      
      <div className="space-y-6 h-32 z-10">
        <h3 className="text-2xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-white to-gold-200 tracking-widest drop-shadow-lg">
          운명 생성 중
        </h3>
        
        <div className="relative w-full h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              className="text-sm md:text-base text-purple-200/80 tracking-widest absolute w-full font-light"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 1.5 }}
            >
              {LOADING_MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;