import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, History, Sparkles, X, LogIn, LogOut, User as UserIcon, Loader2, CheckCircle, AlertCircle, ExternalLink, Copy, BrainCircuit, Zap } from 'lucide-react'; 
import LandingScreen from './components/LandingScreen';
import CategorySelectionScreen from './components/CategorySelectionScreen';
import SelectionScreen from './components/SelectionScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';
import HistoryModal from './components/HistoryModal';
import { GameStep, RoundInfo, GeneratedDestiny, Theme, FortuneCategory, RoundContent, HistoryItem } from './types';
import { generateRoundTexts, getGameThemes, generateCategoryStyles } from './data/fortuneData';
import { generateDestiny, generateGameSession } from './utils/aiService';
import { useAuth } from './hooks/useAuth';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

// --- BACKGROUND (Slow & Deep) ---
const Starfield = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#050508]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#121220_0%,#000000_100%)]" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      <ShootingStars />
      
      {/* Slow moving nebula */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-900/10 rounded-full blur-[150px] animate-float-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-blue-900/10 rounded-full blur-[150px] animate-[float_10s_ease-in-out_infinite_reverse]" />
    </div>
  );
};

// Shooting star layer inspired by the requested aesthetic
const ShootingStars = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 12 }, (_, idx) => ({
        id: idx,
        top: `${Math.random() * 120 - 10}%`,
        left: `${Math.random() * 80 - 20}%`,
        delay: `${2 + Math.random() * 10}s`,
        duration: `${4.5 + Math.random() * 2.5}s`,
      })),
    []
  );

  return (
    <div className="shooting-stars">
      {stars.map((star) => (
        <span
          key={star.id}
          className="shooting-star"
          style={{
            top: star.top,
            left: star.left,
            // CSS custom props for animation timing
            ['--delay' as any]: star.delay,
            ['--duration' as any]: star.duration,
          }}
        />
      ))}
    </div>
  );
};

// --- INTRO PORTAL (Slow & Majestic) ---
const MysticPortal = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[180vw] h-[180vw] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(212,175,55,0.05)_360deg)] animate-[spin_30s_linear_infinite]" />
            </div>
            
            {/* Core */}
            <div className="relative z-10 flex flex-col items-center gap-10">
                <div className="relative w-40 h-40">
                    <motion.div 
                        className="absolute inset-0 bg-gold-500/10 blur-3xl rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 6, repeat: Infinity }}
                    />
                    <div className="relative w-full h-full rounded-full flex items-center justify-center border border-gold-500/20">
                        <div className="absolute inset-0 border-t border-gold-300/40 rounded-full animate-[spin_8s_linear_infinite]" />
                        <div className="absolute inset-4 border-b border-purple-400/30 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
                        <Sparkles className="w-12 h-12 text-gold-200/80 animate-pulse" />
                    </div>
                </div>
                
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-100 to-gold-600/50 tracking-wide">
                        운명의 흐름을 읽는 중
                    </h2>
                    <p className="text-[10px] text-gold-200/30 tracking-[0.5em] uppercase animate-pulse">
                        Connecting to the Void
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- BROWSER GUIDE ---
const InAppBrowserGuide = ({ onClose }: { onClose: () => void }) => {
  const handleCopy = () => { navigator.clipboard.writeText(window.location.href); alert('주소 복사 완료'); };
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6">
      <div className="bg-void-900 border border-white/10 rounded-xl max-w-xs w-full p-8 text-center shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
        <ExternalLink className="w-10 h-10 text-gold-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">외부 브라우저 권장</h3>
        <button onClick={handleCopy} className="w-full py-3 mt-4 bg-white/10 rounded-lg text-white text-xs font-bold">주소 복사하기</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { user, login: authLogin, logout, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<GameStep>('landing');
  const [currentRound, setCurrentRound] = useState(1);
  const [generatedDestiny, setGeneratedDestiny] = useState<GeneratedDestiny | null>(null);
  
  // UI State
  const [isAboutOpen, setIsAboutOpen] = useState(false); 
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showInAppGuide, setShowInAppGuide] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Session Data
  const [selectedCategory, setSelectedCategory] = useState<FortuneCategory | null>(null);
  const [sessionThemes, setSessionThemes] = useState<Theme[]>([]);
  const [currentRoundInfo, setCurrentRoundInfo] = useState<RoundInfo | null>(null);
  const [aiSessionData, setAiSessionData] = useState<RoundContent[] | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxSelectRef = useRef<HTMLAudioElement | null>(null);
  const sfxResultRef = useRef<HTMLAudioElement | null>(null);

  const handleLoginClick = async () => {
    const result = await authLogin();
    if (result === 'IN_APP_BROWSER') setShowInAppGuide(true);
  };

  useEffect(() => {
    bgmRef.current = new Audio(''); bgmRef.current.loop = true; bgmRef.current.volume = 0.2;
    sfxSelectRef.current = new Audio(''); sfxSelectRef.current.volume = 0.3;
    sfxResultRef.current = new Audio(''); sfxResultRef.current.volume = 0.4;
    return () => { if (bgmRef.current) bgmRef.current = null; }
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/kakaotalk/i.test(ua) && /android/i.test(ua)) {
        const url = window.location.href.replace(/^https?:\/\//, '');
        window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end`;
    }
  }, []);

  useEffect(() => {
    if (authLoading) return; 
    const loadHistory = async () => {
        setIsHistoryLoading(true);
        if (user) {
            const localData = localStorage.getItem('destiny_history');
            if (localData) {
                try {
                    const localItems: HistoryItem[] = JSON.parse(localData);
                    if (Array.isArray(localItems) && localItems.length > 0) {
                        await Promise.all(localItems.map(item => setDoc(doc(db, "users", user.uid, "history", item.id.toString()), item)));
                        localStorage.removeItem('destiny_history'); 
                    }
                } catch (e) {}
            }
            try {
                const q = await getDocs(collection(db, "users", user.uid, "history"));
                const cloudHistory: HistoryItem[] = [];
                q.forEach((doc) => cloudHistory.push(doc.data() as HistoryItem));
                cloudHistory.sort((a, b) => b.timestamp - a.timestamp);
                setHistory(cloudHistory);
            } catch (error) {}
        } else {
            const saved = localStorage.getItem('destiny_history');
            if (saved) setHistory(JSON.parse(saved));
        }
        setIsHistoryLoading(false);
    };
    loadHistory();
  }, [user, authLoading]); 

  useEffect(() => {
    if (bgmRef.current && bgmRef.current.src) {
        bgmRef.current.muted = isMuted;
        if (!isMuted && currentStep !== 'landing') bgmRef.current.play().catch(() => {});
    }
  }, [isMuted, currentStep]);

  const playSfx = (type: 'select' | 'result') => {
    if (isMuted) return;
    const audio = type === 'select' ? sfxSelectRef.current : sfxResultRef.current;
    if (audio && audio.src) { audio.currentTime = 0; audio.play().catch(() => {}); }
  };

  const saveToHistory = async (destiny: GeneratedDestiny, category: FortuneCategory) => {
    setSaveStatus('saving');
    const newItem: HistoryItem = {
        id: Date.now(), timestamp: Date.now(), categoryName: category.name,
        shortFortune: destiny.fortuneText, longInterpretation: destiny.longInterpretation,
        luckyPrescription: destiny.luckyPrescription, imageBase64: destiny.imageBase64, sentiment: destiny.sentiment
    };
    const updated = [newItem, ...history].slice(0, 20);
    setHistory(updated);
    if (user) {
        try {
            await setDoc(doc(db, "users", user.uid, "history", newItem.id.toString()), newItem);
            setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error: any) { setSaveStatus('error'); }
    } else {
        localStorage.setItem('destiny_history', JSON.stringify(updated));
        setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const clearHistory = async () => {
      if (window.confirm("모든 기록을 지우시겠습니까?")) {
          setHistory([]);
          if (!user) localStorage.removeItem('destiny_history');
          else alert("클라우드 삭제는 현재 개별 삭제만 지원합니다.");
      }
  };

  const handleStart = () => { playSfx('select'); setCurrentStep('category'); };
  const handleCategorySelect = (category: FortuneCategory) => {
    setSelectedCategory(category); playSfx('select'); setCurrentRound(1);
    setGeneratedDestiny(null); setAiSessionData(null); setSessionThemes(getGameThemes()); setCurrentStep('intro');
  };
  const handleSelection = () => { playSfx('select'); if (currentRound < 4) setCurrentRound(prev => prev + 1); else setCurrentStep('loading'); };
  const handleRetry = () => {
    setCurrentStep('landing'); setCurrentRound(1); setGeneratedDestiny(null);
    setCurrentRoundInfo(null); setSelectedCategory(null); setSessionThemes([]); setAiSessionData(null); setSaveStatus('idle');
  };

  useEffect(() => {
    if (currentStep === 'intro' && selectedCategory) {
      let isMounted = true;
      const init = async () => {
        const p1 = new Promise(r => setTimeout(r, 4600));
        const p2 = generateGameSession(selectedCategory);
        try {
          const [_, data] = await Promise.all([p1, p2]);
          if (isMounted) {
            if (data && data.length) setAiSessionData(data);
            setCurrentStep('playing');
          }
        } catch (e) { if (isMounted) setCurrentStep('playing'); }
      };
      init(); return () => { isMounted = false; };
    }
  }, [currentStep, selectedCategory]);

  useEffect(() => {
    if (currentStep === 'loading' && selectedCategory) {
      generateDestiny(sessionThemes, selectedCategory)
        .then(res => {
            setGeneratedDestiny(res); saveToHistory(res, selectedCategory); playSfx('result'); setCurrentStep('result');
        })
        .catch(() => {
            const fallback: GeneratedDestiny = {
                fortuneText: "운명의 빛이 잠시 흐려졌습니다.", longInterpretation: "잠시 후 다시 시도해주세요.",
                luckyPrescription: { color: "White", number: "0", direction: "Center", item: "Breath" },
                imageBase64: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80', sentiment: 'positive'
            };
            setGeneratedDestiny(fallback); saveToHistory(fallback, selectedCategory); setCurrentStep('result');
        });
    }
  }, [currentStep, selectedCategory]);

  useEffect(() => {
    if (currentStep !== "playing" || !selectedCategory) return;
    const styles = generateCategoryStyles(selectedCategory).slice(0, 4);
    let title = "", desc = "", txts: string[] = [], summaries: string[] = [];
    if (aiSessionData && aiSessionData[currentRound - 1]) {
        const d = aiSessionData[currentRound - 1]; title = d.title; desc = d.question; txts = d.cardTexts; summaries = d.cardSummaries || [];
        setSessionThemes(p => { const n = [...p]; n[currentRound-1] = {title, desc}; return n; });
    } else {
        const f = getGameThemes()[currentRound - 1]; title = f.title; desc = selectedCategory.focusQuestions[currentRound-1] || f.desc;
        txts = generateRoundTexts(currentRound, 4, selectedCategory.id);
        summaries = txts;
    }
    setCurrentRoundInfo({
        roundNumber: currentRound, title, description: desc,
        cards: styles.map((s, i) => ({ ...s, id: `${s.id}_r${currentRound}`, text: txts[i] || "고요", summary: summaries[i] || "" }))
    });
  }, [currentRound, currentStep, selectedCategory, aiSessionData]);


  if (authLoading) {
    return (
      <div className="w-full h-[100dvh] bg-void-950 flex items-center justify-center">
         <Loader2 className="w-10 h-10 text-gold-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#050508] text-gold-100 font-serif select-none flex flex-col">
      
      {/* EMERGENCY STYLES */}
      <style>{`
        body { margin: 0; background-color: #050508; color: #fef3c7; overflow: hidden; }
        button { background: none; border: none; padding: 0; cursor: pointer; color: inherit; font-family: inherit; }
        .hidden-force { display: none !important; }
      `}</style>

      {showInAppGuide && <InAppBrowserGuide onClose={() => setShowInAppGuide(false)} />}

      <Starfield />

      {/* --- MAIN LAYOUT --- */}
      <main className="relative z-10 flex-1 w-full h-full overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 'landing' && (
            <motion.div
              key="landing"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <LandingScreen onStart={handleStart} user={user} onLogin={handleLoginClick} onLogout={logout} />
            </motion.div>
          )}
          {currentStep === 'category' && (
            <motion.div
              key="category"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <CategorySelectionScreen onSelect={handleCategorySelect} />
            </motion.div>
          )}
          {currentStep === 'intro' && (
            <motion.div
              key="intro"
              className="w-full h-full flex items-center justify-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
               <MysticPortal />
            </motion.div>
          )}
          {currentStep === 'playing' && currentRoundInfo && (
            <motion.div
              key="playing"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <SelectionScreen roundInfo={currentRoundInfo} onSelect={handleSelection} />
            </motion.div>
          )}
          {currentStep === 'loading' && (
            <motion.div
              key="loading"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <LoadingScreen />
            </motion.div>
          )}
          {currentStep === 'result' && (
            <motion.div
              key="result"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <ResultScreen destiny={generatedDestiny} onRetry={handleRetry} category={selectedCategory} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- BOTTOM CONTROL DOCK (Visible Only on Landing) --- */}
      <AnimatePresence>
        {currentStep === 'landing' && (
            <motion.nav 
                initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center pb-8 pointer-events-none"
            >
                <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl">
                    <button onClick={() => setIsHistoryOpen(true)} className="flex flex-col items-center gap-1 text-white/50 hover:text-gold-300 transition-colors">
                        <History className="w-5 h-5" />
                        <span className="text-[8px] uppercase tracking-wider">Journal</span>
                    </button>
                    
                    <div className="w-[1px] h-6 bg-white/10" />
                    
                    <button onClick={() => setIsAboutOpen(true)} className="flex flex-col items-center gap-1 text-white/50 hover:text-gold-300 transition-colors">
                        <BrainCircuit className="w-5 h-5" />
                        <span className="text-[8px] uppercase tracking-wider">About</span>
                    </button>

                    <div className="w-[1px] h-6 bg-white/10" />

                    <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center gap-1 text-white/50 hover:text-gold-300 transition-colors">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        <span className="text-[8px] uppercase tracking-wider">Sound</span>
                    </button>

                    <div className="w-[1px] h-6 bg-white/10" />

                    {user ? (
                        <button onClick={logout} className="flex flex-col items-center gap-1 text-white/50 hover:text-red-400 transition-colors">
                            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/30">
                                {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-1" />}
                            </div>
                            <span className="text-[8px] uppercase tracking-wider">Logout</span>
                        </button>
                    ) : (
                        <button onClick={handleLoginClick} className="flex flex-col items-center gap-1 text-gold-400 hover:text-gold-200 transition-colors">
                            <LogIn className="w-5 h-5" />
                            <span className="text-[8px] uppercase tracking-wider">Login</span>
                        </button>
                    )}
                </div>
            </motion.nav>
        )}
      </AnimatePresence>

      {/* --- SAVE STATUS INDICATOR --- */}
      <AnimatePresence>
        {saveStatus !== 'idle' && (
            <motion.div 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
            >
                <div className="px-5 py-2 rounded-full bg-void-900/90 border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-2xl">
                    {saveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin text-gold-400" />}
                    {saveStatus === 'success' && <CheckCircle className="w-3 h-3 text-green-400" />}
                    {saveStatus === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
                    <span className="text-[10px] font-bold tracking-widest text-white uppercase">
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved' : 'Failed'}
                    </span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {isAboutOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
            onClick={() => setIsAboutOpen(false)}
          >
            <div className="bg-[#0a0a12] w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
               <div className="p-6 text-center border-b border-white/5">
                  <h2 className="text-xl font-serif text-gold-100 mb-1">운명의 갈림길</h2>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">Celestial Void Edition</p>
               </div>
               <div className="p-6 space-y-6 text-left">
                  <AboutItem icon={BrainCircuit} title="무의식의 거울" desc="당신의 선택이 곧 당신의 운명입니다." />
                  <AboutItem icon={Zap} title="AI Oracle" desc="Gemini AI가 당신만을 위한 해석을 생성합니다." />
               </div>
               <button onClick={() => setIsAboutOpen(false)} className="w-full py-4 text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest">CLOSE</button>
            </div>
          </motion.div>
        )}
        {isHistoryOpen && <HistoryModal onClose={() => setIsHistoryOpen(false)} history={history} onClear={clearHistory} user={user} isLoading={isHistoryLoading} />}
      </AnimatePresence>
    </div>
  );
};

const AboutItem = ({ icon: Icon, title, desc }: any) => (
    <div className="flex gap-4 items-start">
        <Icon className="w-5 h-5 text-gold-500/70 shrink-0 mt-0.5" />
        <div>
            <h3 className="text-sm font-bold text-white/90 mb-1">{title}</h3>
            <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default App;

