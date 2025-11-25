import React, { useMemo, useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { RoundInfo } from '../types';

interface SelectionScreenProps {
  roundInfo: RoundInfo;
  onSelect: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  hover: { scale: 1.03, y: -8, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.9, filter: 'blur(12px)', transition: { duration: 0.8, ease: 'easeInOut' } }
};

const SelectionScreen: React.FC<SelectionScreenProps> = ({ roundInfo, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const totalRounds = 4;

  // 라운드가 바뀔 때 선택 상태 초기화
  useEffect(() => {
    setSelectedId(null);
  }, [roundInfo.roundNumber, roundInfo.cards.length]);

  const bgPool = useMemo(() => [
    '/cards/bg_01.png',
    '/cards/bg_02.png',
    '/cards/bg_03.png',
    '/cards/bg_04.png',
  ], []);

  const cardBackgrounds = useMemo(() => {
    const shuffled = [...bgPool].sort(() => Math.random() - 0.5);
    const needed = roundInfo.cards.length;
    if (needed <= shuffled.length) return shuffled.slice(0, needed);
    const extended: string[] = [];
    while (extended.length < needed) extended.push(...shuffled);
    return extended.slice(0, needed);
  }, [bgPool, roundInfo.cards.length, roundInfo.roundNumber]);

  return (
    <div className="flex flex-col items-center w-full h-full px-3 pt-6 pb-12 overflow-y-auto relative z-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 flex-shrink-0 space-y-2"
      >
        <p className="text-[10px] uppercase tracking-[0.45em] text-white/40">
          Round {roundInfo.roundNumber}
        </p>
        <h2 className="text-2xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-100">
          {roundInfo.title}
        </h2>
        <p className="text-sm text-white/50 max-w-3xl px-4 mx-auto leading-relaxed">
          {roundInfo.description}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          {Array.from({ length: totalRounds }).map((_, idx) => {
            const isActive = roundInfo.roundNumber === idx + 1;
            return (
              <span
                key={idx}
                className="h-2.5 w-2.5 rounded-full transition-all duration-300"
                style={{
                  background: isActive ? '#fbbf24' : 'rgba(255,255,255,0.16)',
                  boxShadow: isActive ? '0 0 12px rgba(251,191,36,0.7)' : 'none',
                  transform: isActive ? 'scale(1.2)' : 'scale(1)'
                }}
              />
            );
          })}
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 w-full max-w-6xl px-1 md:px-2"
      >
        <AnimatePresence mode="wait">
          {roundInfo.cards.map((card, idx) => {
            const displayText = (card.text && card.text.trim().length > 0)
              ? card.text.trim()
              : "고요한 기운";
            const summary = (card.summary && card.summary.trim().length > 0)
              ? card.summary.trim()
              : displayText;
            const bgImage = cardBackgrounds[idx % cardBackgrounds.length];
            const isSelected = selectedId === card.id;

            return (
              <motion.button
                key={card.id}
                variants={cardVariants}
                initial="hidden"
                animate={
                  selectedId
                    ? isSelected
                      ? { scale: 1.08, zIndex: 10, boxShadow: '0 24px 60px rgba(0,0,0,0.55)', opacity: 1 }
                      : { opacity: 0, scale: 0.9, filter: 'blur(8px)' }
                    : 'visible'
                }
                exit="exit"
                whileHover={!selectedId ? 'hover' : undefined}
                whileTap={!selectedId ? { scale: 0.97 } : undefined}
                onClick={() => {
                  if (selectedId) return;
                  setSelectedId(card.id);
                  setTimeout(onSelect, 2000); // 2s spotlight before transition
                }}
                className="group relative w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-[#0d0d16] shadow-[0_12px_35px_rgba(0,0,0,0.3)] focus:outline-none"
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 1.0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/55 to-black/70" />

                <div className="absolute inset-[8px] flex flex-col items-center justify-center p-3 text-center gap-4">
                  <p className="text-sm md:text-base text-white leading-relaxed">
                    {displayText}
                  </p>
                  <p className="text-[11px] md:text-xs text-white leading-snug text-center break-words">
                    {summary}
                  </p>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SelectionScreen;
