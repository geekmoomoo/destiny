import React from 'react';
import { motion, Variants } from 'framer-motion';
import { FortuneCategory } from '../types';
import { FORTUNE_CATEGORIES } from '../data/fortuneData';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CategorySelectionScreenProps {
  onSelect: (category: FortuneCategory) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  },
  hover: { 
    scale: 1.03,
    y: -10,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center w-full h-full px-4 pt-10 pb-32 overflow-y-auto custom-scrollbar relative z-20">
      
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}
        className="text-center mb-12 flex-shrink-0"
      >
        <h2 className="text-2xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-100 mb-3">
          운명의 영역
        </h2>
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mx-auto mb-4" />
        <p className="text-[10px] text-white/40 tracking-[0.4em] uppercase">Select Your Domain</p>
      </motion.div>

      {/* Grid Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8 w-full max-w-5xl pb-20"
      >
        {FORTUNE_CATEGORIES.map((cat) => (
          <motion.div
            key={cat.id}
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(cat)}
            className="group cursor-pointer relative w-full aspect-[3/5] perspective-1000"
          >
            {/* Card Container (Tarot Back Style) */}
            <div className="absolute inset-0 rounded-xl border-2 border-[#2a2a3d] bg-[#151520] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:border-gold-500/40 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500">
                
                {/* Pattern Texture */}
                <div className="absolute inset-2 border border-white/5 rounded-lg opacity-50">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-40" />
                    <div className={`absolute inset-0 bg-gradient-to-b ${cat.gradientClass} opacity-20 mix-blend-overlay`} />
                </div>

                {/* Inner Frame */}
                <div className="absolute inset-4 border border-gold-500/20 rounded flex flex-col items-center justify-between p-4 z-10">
                    
                    {/* Top Decoration */}
                    <div className="w-full flex justify-center">
                        <div className="w-1 h-8 bg-gradient-to-b from-gold-500/0 via-gold-500/30 to-gold-500/0" />
                    </div>

                    {/* Center Symbol */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 border border-gold-500/10 rounded-full animate-spin-slow" />
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold-500/50 transition-colors duration-500">
                                <Sparkles className="w-6 h-6 text-gold-200/70 group-hover:text-gold-100" />
                            </div>
                        </div>
                        <h3 className="text-lg md:text-xl font-serif font-bold text-gold-100 tracking-widest text-center group-hover:text-white transition-colors">
                            {cat.name}
                        </h3>
                    </div>

                    {/* Bottom Description */}
                    <div className="text-center">
                        <p className="text-[10px] text-white/40 line-clamp-2 font-light tracking-wide group-hover:text-white/60 transition-colors">
                            {cat.description}
                        </p>
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                            <ArrowRight className="w-4 h-4 text-gold-400 mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CategorySelectionScreen;