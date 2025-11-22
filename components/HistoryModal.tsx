
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Calendar, Trash2, Sparkles, ChevronLeft, Palette, Hash, Compass, Key, Cloud, User as UserIcon, Loader2 } from 'lucide-react';
import { HistoryItem } from '../types';
import type { User } from 'firebase/auth';

interface HistoryModalProps {
  onClose: () => void;
  history: HistoryItem[];
  onClear: () => void;
  user: User | null;
  isLoading: boolean;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, history, onClear, user, isLoading }) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleBack = () => {
    setSelectedItem(null);
    setIsFlipped(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md h-[85vh] bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-black/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {selectedItem ? (
              <button onClick={handleBack} className="p-1 hover:bg-white/10 rounded-full mr-1">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            ) : (
              <History className="w-5 h-5 text-purple-300" />
            )}
            <div className="flex flex-col">
                <h3 className="text-lg font-bold text-purple-100">{selectedItem ? '운명 상세 기록' : '운명 보관함'}</h3>
                {user ? (
                    <span className="text-[10px] text-blue-300 flex items-center gap-1">
                        <Cloud className="w-3 h-3" /> Cloud Synced
                    </span>
                ) : (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" /> Guest Mode (Local Storage)
                    </span>
                )}
            </div>
          </div>
          <div className="flex gap-2">
            {!selectedItem && history.length > 0 && (
                <button 
                    onClick={onClear}
                    className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-900/20 rounded-full transition-colors"
                    title="기록 삭제"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            <button 
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-900 relative">
           <AnimatePresence mode="wait">
             {isLoading ? (
                 <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full space-y-3"
                 >
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    <p className="text-sm text-purple-300/50 animate-pulse">운명의 기록을 찾는 중...</p>
                 </motion.div>
             ) : !selectedItem ? (
               /* LIST VIEW */
               <motion.div 
                 key="list"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="p-4 space-y-4"
               >
                 {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-white/30 space-y-3 mt-10">
                        <Sparkles className="w-10 h-10 opacity-20" />
                        <p className="text-sm font-light">저장된 운명의 기록이 없습니다.</p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <motion.div 
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-4 items-center hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black border border-white/10">
                            <img src={item.imageBase64} alt="card" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                                    {item.categoryName}
                                </span>
                                <div className="flex items-center text-[10px] text-gray-500 gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                            <p className="text-sm text-white/90 font-serif line-clamp-2 leading-relaxed">
                                "{item.shortFortune}"
                            </p>
                        </div>
                      </motion.div>
                    ))
                  )}
               </motion.div>
             ) : (
               /* DETAIL VIEW (Card Flip) */
               <motion.div
                 key="detail"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="p-4 flex flex-col items-center"
               >
                  <p className="text-white/60 text-xs mb-4 animate-pulse">카드를 터치하여 뒷면의 해석을 확인하세요</p>
                  
                  <div className="w-full max-w-xs perspective-1000 cursor-pointer mb-6" onClick={() => setIsFlipped(!isFlipped)}>
                    <motion.div 
                      className="relative preserve-3d"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* FRONT */}
                        <div className="relative backface-hidden bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 p-1 rounded-2xl shadow-lg">
                           <div className="relative rounded-xl border border-white/10 p-4 flex flex-col items-center overflow-hidden bg-black h-[500px]">
                              <div className="w-full aspect-[9/14] rounded-lg overflow-hidden shadow-lg mb-4 relative border border-white/10">
                                 <img src={selectedItem.imageBase64} alt="Destiny" className="w-full h-full object-cover" />
                              </div>
                              <div className="relative w-full text-center flex-1 flex flex-col justify-center">
                                 <Sparkles className="w-4 h-4 text-amber-200 mx-auto mb-2" />
                                 <p className="text-base font-serif text-[#FEF3C7] font-medium leading-relaxed break-keep">
                                   "{selectedItem.shortFortune}"
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* BACK */}
                        <div 
                            className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-amber-500/30 p-1 rounded-2xl shadow-lg"
                            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                        >
                            <div className="relative rounded-xl border border-white/10 p-4 flex flex-col h-[500px] bg-black/90 text-amber-50 overflow-y-auto custom-scrollbar">
                                <h3 className="text-amber-200 font-serif text-base tracking-widest uppercase text-center mb-4 border-b border-amber-500/20 pb-2">심층 해석</h3>
                                <p className="text-sm leading-relaxed font-serif font-light opacity-90 text-justify whitespace-pre-line mb-6">
                                    {selectedItem.longInterpretation || "상세 해석 정보가 저장되지 않았습니다."}
                                </p>
                                
                                {selectedItem.luckyPrescription && (
                                    <div className="mt-auto pt-4 border-t border-amber-500/20">
                                        <h4 className="text-center text-amber-300 font-bold text-xs mb-3 uppercase tracking-widest">행운의 처방전</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white/5 p-2 rounded border border-white/10 text-center">
                                                <Palette className="w-3 h-3 text-pink-300 mx-auto mb-1" />
                                                <div className="text-[10px] text-white/50">Color</div>
                                                <div className="text-xs text-pink-100">{selectedItem.luckyPrescription.color}</div>
                                            </div>
                                            <div className="bg-white/5 p-2 rounded border border-white/10 text-center">
                                                <Hash className="w-3 h-3 text-blue-300 mx-auto mb-1" />
                                                <div className="text-[10px] text-white/50">Number</div>
                                                <div className="text-xs text-blue-100">{selectedItem.luckyPrescription.number}</div>
                                            </div>
                                            <div className="bg-white/5 p-2 rounded border border-white/10 text-center">
                                                <Compass className="w-3 h-3 text-green-300 mx-auto mb-1" />
                                                <div className="text-[10px] text-white/50">Direction</div>
                                                <div className="text-xs text-green-100">{selectedItem.luckyPrescription.direction}</div>
                                            </div>
                                            <div className="bg-white/5 p-2 rounded border border-white/10 text-center">
                                                <Key className="w-3 h-3 text-yellow-300 mx-auto mb-1" />
                                                <div className="text-[10px] text-white/50">Item</div>
                                                <div className="text-xs text-yellow-100">{selectedItem.luckyPrescription.item}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Styles */}
        <style>{`
            .perspective-1000 { perspective: 1000px; }
            .preserve-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; }
        `}</style>

      </motion.div>
    </motion.div>
  );
};

export default HistoryModal;
