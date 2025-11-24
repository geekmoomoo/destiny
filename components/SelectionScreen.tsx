import React from 'react';
import { motion, Variants } from 'framer-motion';
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
  hover: { scale: 1.03, y: -8, transition: { duration: 0.2 } }
};

const SelectionScreen: React.FC<SelectionScreenProps> = ({ roundInfo, onSelect }) => {
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
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 w-full max-w-6xl px-1 md:px-2"
      >
        {roundInfo.cards.map((card) => (
          (() => {
            const displayText = (card.text && card.text.trim().length > 0)
              ? card.text.trim()
              : "고요한 기운";
            const summary = (card.summary && card.summary.trim().length > 0)
              ? card.summary.trim()
              : displayText;
            return (
          <motion.button
            key={card.id}
            variants={cardVariants}
            whileHover="hover"
                whileTap={{ scale: 0.97 }}
                onClick={onSelect}
                className="group relative w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-[#0d0d16] shadow-[0_12px_35px_rgba(0,0,0,0.3)] focus:outline-none"
              >
                <div className={`absolute inset-0 ${card.bgClass}`} />
                <div
                  className="absolute inset-0 opacity-30 mix-blend-screen"
                  style={{ backgroundImage: card.pattern }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />

            <div className={`absolute inset-[8px] rounded-lg border ${card.borderClass} bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center gap-2`}>
              <p className="text-sm md:text-base text-white/90 leading-relaxed">
                {displayText}
              </p>
              <p className="text-[11px] md:text-xs text-white/60 leading-snug text-center break-words">
                {summary}
              </p>
            </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                  <div className="absolute -inset-1 rounded-xl border border-gold-400/40 blur-[2px]" />
                </div>
              </motion.button>
            );
          })()
        ))}
      </motion.div>
    </div>
  );
};

export default SelectionScreen;
