import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { FortuneCategory } from '../types';
import { FORTUNE_CATEGORIES } from '../data/fortuneData';

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
  }
};

const CARD_GRADIENTS: Record<string, { start: string; end: string }> = {
  general: { start: '#4f46e5', end: '#06b6d4' },
  love: { start: '#ec4899', end: '#fb7185' },
  wealth: { start: '#f59e0b', end: '#f97316' },
  social: { start: '#22d3ee', end: '#2563eb' },
  growth: { start: '#22c55e', end: '#15803d' },
  career: { start: '#60a5fa', end: '#2563eb' },
};

const TAROT_DECK = [
  '/cards/the_fool_crop.jpg',
  '/cards/the_magician_crop.jpg',
  '/cards/the_high_priestess_crop.jpg',
  '/cards/the_empress_crop.jpg',
  '/cards/the_emperor_crop.jpg',
  '/cards/the_hierophant_crop.jpg',
  '/cards/the_hermit_crop.jpg',
  '/cards/the_tower_crop.jpg',
  '/cards/temperance_crop.jpg'
];

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

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="category-swiper">
        <Swiper
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 260,
            modifier: 2.4,
            slideShadows: true
          }}
          keyboard={{ enabled: true }}
          mousewheel={{ thresholdDelta: 10 }}
          spaceBetween={60}
          loop
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination, Keyboard, Mousewheel]}
          className="swiper-root"
        >
          {FORTUNE_CATEGORIES.map((cat) => {
            const grad = CARD_GRADIENTS[cat.id] || { start: '#0ea5e9', end: '#6366f1' };
            const randomImage = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
            return (
              <SwiperSlide key={cat.id} className="category-slide">
                <button
                  onClick={() => onSelect(cat)}
                  className="category-slide-card"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(6,8,18,0.14), rgba(12,14,20,0.4)), url(${randomImage || `linear-gradient(135deg, ${grad.start}, ${grad.end})`})`
                  }}
                >
                  <div className="category-slide-content">
                    <span>{cat.name}</span>
                    <h3>{cat.description}</h3>
                  </div>
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </motion.div>
    </div>
  );
};

export default CategorySelectionScreen;
