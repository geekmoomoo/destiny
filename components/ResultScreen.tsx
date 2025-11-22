import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Download, Sparkles, Share2, Palette, Hash, Compass, Key, MessageCircle, Send, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { GeneratedDestiny, FortuneCategory } from '../types';
import { chatWithOracle } from '../utils/aiService';

interface ResultScreenProps {
  destiny: GeneratedDestiny | null;
  onRetry: () => void;
  category: FortuneCategory | null;
}

interface ChatMessage {
    id: string; role: 'user' | 'model'; text: string;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ destiny, onRetry, category }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealedRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [showTiltGuide, setShowTiltGuide] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(3);

  if (!destiny) return null;

  useEffect(() => {
    setIsImageLoaded(false);
    setIsImageError(false);
    setIsRevealed(false);
    setIsFlipped(false);
    setIsScratching(false);
    revealedRef.current = false;
  }, [destiny]);

  // --- IMAGE PRELOAD (ensure onLoad fires for base64) ---
  useEffect(() => {
    if (!destiny?.imageBase64) return;
    setIsImageLoaded(false);
    setIsImageError(false);

    const img = new Image();
    const timer = setTimeout(() => setIsImageError(true), 10000); // fail safe

    img.onload = () => { clearTimeout(timer); setIsImageLoaded(true); };
    img.onerror = () => { clearTimeout(timer); setIsImageError(true); };
    img.src = destiny.imageBase64;

    return () => {
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };
  }, [destiny?.imageBase64]);

  // --- SCRATCH EFFECT ---
  useEffect(() => {
    if (!isImageLoaded) return;
    const canvas = canvasRef.current;
    const container = frontRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawMask = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width; canvas.height = height;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0a0a12'; 
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for(let i=0; i<120; i++) { ctx.beginPath(); ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2); ctx.fill(); }
    };

    drawMask();
    const handleResize = () => {
      if (revealedRef.current) {
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width; canvas.height = height;
        return;
      }
      drawMask();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [destiny, isImageLoaded]);

  useEffect(() => { revealedRef.current = isRevealed; }, [isRevealed]);

  // --- TILT NUDGE ---
  useEffect(() => {
    if (isRevealed) {
      setShowTiltGuide(true);
      const t = setTimeout(() => setShowTiltGuide(false), 1600);
      return () => clearTimeout(t);
    } else {
      setShowTiltGuide(false);
    }
  }, [isRevealed]);

  const handleScratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current; if (!canvas || isRevealed || !isImageLoaded) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();
      checkReveal();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isImageLoaded) return;
    e.preventDefault();
    setIsScratching(true);
    handleScratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    e.preventDefault();
    handleScratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => setIsScratching(false);

  useEffect(() => {
    const stop = () => setIsScratching(false);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  const checkReveal = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const imgData = ctx.getImageData(w*0.3, h*0.3, w*0.4, h*0.4);
    let transparent = 0;
    for (let i = 0; i < imgData.data.length; i += 40) { if (imgData.data[i + 3] < 128) transparent++; }
    if (transparent > (imgData.data.length / 40) * 0.4) setIsRevealed(true);
  };

  // --- SAVE FUNCTION (The Artifact) ---
  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsSaving(true);
    exportRef.current.style.display = 'block'; // Show hidden element
    
    try {
        const canvas = await html2canvas(exportRef.current, { 
            backgroundColor: null, scale: 2, useCORS: true, logging: false 
        });
        const link = document.createElement('a'); link.download = `Destiny_Card.png`;
        link.href = canvas.toDataURL('image/png'); link.click();
    } catch(e) { alert('저장에 실패했어요'); }
    
    exportRef.current.style.display = 'none'; // Hide again
    setIsSaving(false);
  };

  const handleShare = async () => {
    if (navigator.share) { try { await navigator.share({ title: '운명의 갈림길', text: destiny.fortuneText, url: window.location.href }); } catch (e) {} } 
    else { navigator.clipboard.writeText(window.location.href); alert('링크 복사 완료'); }
  };

  // --- CHAT ---
  const handleOpenChat = () => {
      if (!isChatOpen && chatMessages.length === 0) {
          setChatMessages([{ id: 'init', role: 'model', text: "운명의 목소리가 들리시나요? \n이 결과에 대해 3가지만 더 물어보실 수 있습니다." }]);
      }
      setIsChatOpen(true);
  };

  const handleSendChat = async () => {
      if (!inputText.trim() || isChatLoading || questionsLeft <= 0) return;
      const userMsg = inputText; setInputText(''); setIsChatLoading(true); setQuestionsLeft(p => p - 1);
      const newHistory = [...chatMessages, { id: Date.now().toString(), role: 'user' as const, text: userMsg }];
      setChatMessages(newHistory);
      const aiResponseText = await chatWithOracle(newHistory.map(m => ({ role: m.role, text: m.text })), userMsg, destiny.longInterpretation);
      setIsChatLoading(false);
      setChatMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'model', text: aiResponseText }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="flex flex-col items-center w-full h-full overflow-y-auto custom-scrollbar relative pb-40 pt-6 bg-[#050508]">
      
      {/* --- 3D CARD CONTAINER (Interactive) --- */}
      <div className="relative w-[90vw] sm:w-[80vw] max-w-[360px] md:max-w-[440px] lg:max-w-[520px] aspect-[9/16] perspective-1000 cursor-pointer z-20 mb-6" onClick={() => isRevealed && setIsFlipped(!isFlipped)}>
        
        <AnimatePresence>
            {!isRevealed && isImageLoaded && (
                <motion.canvas ref={canvasRef} className="absolute inset-0 z-50 rounded-2xl shadow-2xl touch-none cursor-crosshair"
                    initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 1.5 } }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                />
            )}
        </AnimatePresence>

        {/* Scratch guide */}
        {!isRevealed && isImageLoaded && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 px-5 py-2 rounded-full border border-white/20 text-[12px] tracking-[0.15em] text-white shadow-lg shadow-black/40">
              터치하여 이미지를 살펴보세요
            </div>
          </div>
        )}
        {isRevealed && showTiltGuide && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 px-5 py-2 rounded-full border border-white/20 text-[12px] tracking-[0.15em] text-white shadow-lg shadow-black/40">
              터치하여 해석보기
            </div>
          </div>
        )}

        {!isImageLoaded && !isImageError && (
          <div className="absolute inset-0 z-40 rounded-2xl bg-black/70 border border-white/5 flex flex-col items-center justify-center gap-3 text-white/70 text-sm">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-xs tracking-widest uppercase">Generating Image...</p>
          </div>
        )}
        {isImageError && (
          <div className="absolute inset-0 z-40 rounded-2xl bg-black/70 border border-red-500/20 flex flex-col items-center justify-center gap-2 text-red-200 text-sm text-center px-4">
            <p>이미지를 불러오지 못했어요.</p>
            <p className="text-xs text-white/60">다시 시도하거나 인터넷 연결을 확인해주세요.</p>
          </div>
        )}

        <motion.div 
            ref={cardRef} 
            className="relative w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ 
              rotateY: isFlipped ? 180 : 0,
              rotateZ: showTiltGuide ? [-8, 8, 0] : 0
            }} 
            transition={{ duration: showTiltGuide ? 1.2 : 0.8, ease: "easeInOut" }}
        >
          {/* --- FRONT: IMAGE ONLY --- */}
          <div
            ref={frontRef}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a12] border-4 border-[#1a1a2e]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="absolute inset-0">
                <img 
                  src={destiny.imageBase64} 
                  alt="Destiny" 
                  className="w-full h-full object-cover scale-[1.02]"
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => { setIsImageError(true); setIsImageLoaded(false); }}
                />
            </div>
            <div className="absolute inset-2 rounded-xl border border-gold-500/20 pointer-events-none" />
          </div>

          {/* --- BACK: DETAILS --- */}
          <div
            className="absolute inset-0 rounded-2xl bg-[#0f0f1a] border border-white/10 shadow-2xl overflow-hidden"
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
          >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
             <div className="relative h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
                <div className="text-center mb-6 pt-4">
                    <h3 className="text-gold-300 font-serif text-base tracking-widest uppercase border-b border-white/10 pb-2 inline-block">심층 해석</h3>
                </div>
                <div className="flex-1 text-xs md:text-sm text-gray-300 font-serif leading-loose text-justify whitespace-pre-line">
                    {destiny.longInterpretation}
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                        <PrescriptionItem icon={Palette} label="Color" value={destiny.luckyPrescription.color} />
                        <PrescriptionItem icon={Hash} label="Number" value={destiny.luckyPrescription.number} />
                        <PrescriptionItem icon={Compass} label="Direction" value={destiny.luckyPrescription.direction} />
                        <PrescriptionItem icon={Key} label="Item" value={destiny.luckyPrescription.item} />
                    </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* --- TEXT PANEL (after reveal) --- */}
      {isRevealed && (
        <div className="w-full max-w-[520px] px-6 text-center space-y-3 mb-8">
            <p className="text-white/90 font-serif text-sm md:text-base leading-relaxed tracking-wide break-keep">
                "{destiny.fortuneText}"
            </p>
            <div className="flex flex-col items-center gap-1 opacity-70">
                <div className="w-10 h-[1px] bg-gold-500/70" />
                <span className="text-[9px] tracking-[0.32em] text-gold-100 uppercase">Destiny Generated</span>
            </div>
        </div>
      )}

      {/* --- HIDDEN EXPORT CARD (The Artifact) --- */}
      <div 
        ref={exportRef} 
        style={{ display: 'none' }} 
        className="bg-[#0a0a12] w-full flex flex-col items-center"
      >
         <div className="w-full max-w-[520px]">
            <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden border-4 border-[#1a1a2e] shadow-2xl">
                <img src={destiny.imageBase64} className="w-full h-full object-cover" />
                <div className="absolute inset-2 rounded-xl border border-gold-500/20 pointer-events-none" />
            </div>
            <div className="w-full px-6 text-center space-y-3 mt-6 mb-10">
                <p className="text-white font-serif text-base leading-relaxed tracking-wide break-keep">
                    "{destiny.fortuneText}"
                </p>
                <div className="flex flex-col items-center gap-1 opacity-70">
                    <div className="w-10 h-[1px] bg-gold-500/70" />
                    <span className="text-[9px] tracking-[0.32em] text-gold-100 uppercase">Destiny Generated</span>
                </div>
            </div>
         </div>
      </div>

      {/* --- ACTION BUTTONS --- */}
      {isRevealed && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 z-30 w-full max-w-md mb-20 px-4"
        >
          <button onClick={handleOpenChat} className="glass-button flex-1 py-3 rounded-full flex items-center justify-center gap-2 text-purple-300 border-purple-500/30 hover:bg-purple-500/10">
              <MessageCircle className="w-4 h-4" /> <span className="text-xs font-bold tracking-widest">CHAT</span>
          </button>
          <button onClick={handleDownload} disabled={isSaving} className="glass-button flex-1 py-3 rounded-full flex items-center justify-center gap-2 text-gold-200 border-gold-500/30 hover:bg-gold-500/10">
              <Download className="w-4 h-4" /> <span className="text-xs font-bold tracking-widest">SAVE</span>
          </button>
          <div className="flex gap-2">
              <ControlButton icon={RefreshCw} onClick={onRetry} />
              <ControlButton icon={Share2} onClick={handleShare} />
          </div>
        </motion.div>
      )}

      {/* --- CHAT MODAL --- */}
      <AnimatePresence>
        {isChatOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center"
                onClick={() => setIsChatOpen(false)}
            >
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    className="bg-[#0a0a12] w-full md:max-w-md md:rounded-2xl rounded-t-2xl border-t md:border border-white/10 h-[60vh] flex flex-col shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h3 className="text-sm font-bold text-white">오라클의 사후질의<span className="text-gold-400 text-xs ml-2">({questionsLeft}/3)</span></h3>
                        <button onClick={() => setIsChatOpen(false)}><X className="w-5 h-5 text-white/50" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-purple-900/20 text-purple-100'
                                }`}>{msg.text}</div>
                            </div>
                        ))}
                        {isChatLoading && <div className="text-xs text-white/30 animate-pulse ml-4">...</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 bg-black border-t border-white/10">
                        {questionsLeft > 0 ? (
                            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="flex gap-2">
                                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="질문하기..." className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm text-white" />
                                <button type="submit" disabled={!inputText.trim() || isChatLoading} className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white"><Send className="w-4 h-4" /></button>
                            </form>
                        ) : <div className="text-center text-xs text-gray-500">질문 종료</div>}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ControlButton = ({ icon: Icon, onClick }: { icon: any, onClick: () => void }) => (
    <button onClick={onClick} className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white border-white/10">
        <Icon className="w-5 h-5" />
    </button>
);

const PrescriptionItem = ({ icon: Icon, label, value }: any) => (
    <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center text-center border border-white/5">
        <Icon className="w-3 h-3 mb-1 text-white/40" />
        <span className="text-[8px] text-white/30 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] text-gold-100 font-medium mt-0.5">{value}</span>
    </div>
);

export default ResultScreen;
