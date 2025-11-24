import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Download, Sparkles, Share2, Palette, Hash, Compass, Key, EyeOff, MessageCircle, Send, X, Lock } from 'lucide-react';
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

// Helper to get 2D context with correct typing
const get2dCtx = (canvas: HTMLCanvasElement) =>
  canvas.getContext('2d', { willReadFrequently: true } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null;

const ResultScreen: React.FC<ResultScreenProps> = ({ destiny, onRetry, category }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(3);

  if (!destiny) return null;

  // Reset state when a new destiny arrives or on mount
  useEffect(() => {
    setIsFlipped(false);
    setIsRevealed(false);
    setIsScratching(false);
  }, [destiny]);

  useEffect(() => {
    setIsFlipped(false);
    setIsRevealed(false);
    setIsScratching(false);
  }, []);

  // Ensure scratch cover is repainted when not revealed
  useEffect(() => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    const container = frontRef.current;
    if (!canvas || !container) return;
    const ctx = get2dCtx(canvas);
    if (!ctx) return;
    const { width, height } = container.getBoundingClientRect();
    canvas.width = width; canvas.height = height;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for(let i=0; i<80; i++) { ctx.beginPath(); ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2); ctx.fill(); }
  }, [isRevealed]);

  // --- SCRATCH EFFECT ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = frontRef.current;
    if (!canvas || !container) return;
    const ctx = get2dCtx(canvas);
    if (!ctx) return;
    const { width, height } = container.getBoundingClientRect();
    canvas.width = width; canvas.height = height;
    
    // Dark Cover
    ctx.fillStyle = '#0a0a12'; 
    ctx.fillRect(0, 0, width, height);
    
    // Mystic Pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for(let i=0; i<100; i++) { ctx.beginPath(); ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2); ctx.fill(); }
  }, [destiny]);

  const handleScratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current; if (!canvas || isRevealed) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = get2dCtx(canvas);
    if (ctx) {
      ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath();
      ctx.arc(clientX - rect.left, clientY - rect.top, 40, 0, Math.PI * 2); ctx.fill();
      checkReveal();
    }
  };

  const checkReveal = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = get2dCtx(canvas); if (!ctx) return;
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
    } catch(e) { alert('저장 실패'); }
    
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
    <div className="flex flex-col items-center w-full h-full overflow-hidden relative pb-40 pt-6">
      
      <div className="h-10 mb-4 text-center z-10 pointer-events-none">
         <AnimatePresence mode="wait">
            {isRevealed ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 className="text-gold-300 text-[10px] tracking-[0.3em] uppercase">ORACLE REVEALED</h3>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <p className="text-white/50 text-xs tracking-widest animate-pulse">화면을 문질러 운명을 확인하세요</p>
                </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* --- 3D CARD CONTAINER (Interactive) --- */}
      <div className="relative w-[85vw] max-w-[320px] aspect-[9/16] perspective-1000 cursor-pointer z-20 mb-8" onClick={() => isRevealed && setIsFlipped(!isFlipped)}>
        
        <AnimatePresence>
            {!isRevealed && (
                <motion.canvas ref={canvasRef} className="absolute inset-0 z-50 rounded-2xl shadow-2xl cursor-crosshair"
                    initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 1.5 } }}
                    onMouseDown={() => setIsScratching(true)} onMouseUp={() => setIsScratching(false)}
                    onMouseMove={(e) => isScratching && handleScratch(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                    onTouchMove={(e) => {
                        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
                        handleScratch(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
                    }}
                    style={{ display: isRevealed ? 'none' : 'block', pointerEvents: isRevealed ? 'none' : 'auto' }}
                />
            )}
        </AnimatePresence>
        {!isRevealed && (
          <div className="absolute inset-0 z-40 rounded-2xl bg-[#0a0a12] opacity-90 pointer-events-none" />
        )}
        <motion.div 
            ref={cardRef} 
            className="relative w-full h-full preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }} 
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* --- FRONT: DISPLAY CARD (Same as Export) --- */}
          <div ref={frontRef} className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a12] border-4 border-[#1a1a2e] destiny-glow">
             <div className="absolute inset-0 flex flex-col">
                {/* Image Part (Top 70%) */}
                <div className="relative h-[70%] w-full overflow-hidden border-b border-gold-500/20">
                    <img src={destiny.imageBase64} alt="Destiny" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent opacity-50" />
                </div>
                
                {/* Text Part (Bottom 30%) */}
                <div className="flex-1 bg-[#0a0a12] p-6 flex flex-col items-center justify-center text-center relative">
                    <div className="absolute -top-6">
                        <div className="w-10 h-10 bg-[#0a0a12] border border-gold-500/30 rounded-full flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-gold-300" />
                        </div>
                    </div>
                    
                    <p className="text-white/90 font-serif text-sm md:text-base leading-relaxed tracking-wide break-keep">
                        "{destiny.fortuneText}"
                    </p>
                    
                    <div className="mt-4 flex flex-col items-center gap-1 opacity-50">
                        <div className="w-8 h-[1px] bg-gold-500/50" />
                        <span className="text-[8px] tracking-[0.3em] text-gold-100 uppercase">Destiny Generated</span>
                    </div>
                </div>
             </div>
             
             {/* Inner Gold Border */}
             <div className="absolute inset-2 rounded-xl border border-gold-500/20 pointer-events-none" />
          </div>

          {/* --- BACK: DETAILS --- */}
          <div className="absolute inset-0 backface-hidden rounded-2xl bg-[#0f0f1a] border border-white/10 shadow-2xl overflow-hidden" style={{ transform: 'rotateY(180deg)', display: isFlipped ? 'block' : 'none' }}>
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

      {/* --- HIDDEN EXPORT CARD (The Artifact) --- */}
      <div 
        ref={exportRef} 
        style={{ display: 'none', width: '600px', height: '1000px' }} 
        className="bg-[#0a0a12]"
      >
         <div className="w-full h-full relative flex flex-col border-[24px] border-[#151520]">
            {/* Image Area */}
            <div className="h-[700px] w-full relative overflow-hidden border-b-4 border-[#2a2a3d]">
                <img src={destiny.imageBase64} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent opacity-40" />
            </div>

            {/* Text Area */}
            <div className="flex-1 bg-[#0a0a12] flex flex-col items-center justify-center p-10 text-center relative">
                <div className="absolute -top-10 w-20 h-20 bg-[#0a0a12] rounded-full border-4 border-[#2a2a3d] flex items-center justify-center">
                    {/* Simple SVG Star icon for export compatibility */}
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                </div>
                
                <p className="text-white font-serif text-2xl leading-relaxed tracking-wide break-keep px-4 mt-6">
                    "{destiny.fortuneText}"
                </p>
                
                <div className="mt-8 flex flex-col items-center gap-2 opacity-60">
                    <div className="w-16 h-[1px] bg-[#d4af37]" />
                    <span className="text-sm tracking-[0.4em] text-[#d4af37] uppercase font-sans">Destiny Generated</span>
                </div>
            </div>

            {/* Inner Gold Line */}
            <div className="absolute inset-4 border border-[#d4af37] opacity-30 rounded-lg pointer-events-none" />
         </div>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0 }}
        className="flex flex-wrap justify-center gap-3 z-30 w-full max-w-md mb-20 px-4"
        style={{ pointerEvents: isRevealed ? 'auto' : 'none' }}
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
                    {/* Chat UI omitted for brevity, same as before */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h3 className="text-sm font-bold text-white">오라클의 속삭임 <span className="text-gold-400 text-xs ml-2">({questionsLeft}/3)</span></h3>
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
