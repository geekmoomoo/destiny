import { CardBackStyle, FortuneCategory, Theme } from '../types';

// Background Image
export const MAIN_BG = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1920&q=80';

// --- 1. CATEGORY DEFINITIONS ---
export const FORTUNE_CATEGORIES: FortuneCategory[] = [
  {
    id: 'general',
    name: '오늘의 흐름',
    description: '하루의 운세와 에너지',
    themeColor: 'purple',
    gradientClass: 'from-violet-900 via-purple-900 to-indigo-950',
    particleColor: '#A855F7',
    imageKeywords: "Mystical Galaxy, Purple and Silver tones, Nebula",
    focusQuestions: [
      "마음을 채우는 감정은?", "가로막는 장애물은?", "기대하는 변화는?", "운명에게 묻고 싶은 것은?"
    ]
  },
  {
    id: 'love',
    name: '사랑의 행방',
    description: '연인, 짝사랑, 인연',
    themeColor: 'rose',
    gradientClass: 'from-rose-900 via-pink-900 to-red-950',
    particleColor: '#FB7185',
    imageKeywords: "Romantic, Soft Pink and Red tones, Roses, Heart threads",
    focusQuestions: [
      "떠오르는 그 사람은?", "두려워하는 이별은?", "꿈꾸는 사랑은?", "사랑을 위한 결단은?"
    ]
  },
  {
    id: 'wealth',
    name: '부의 기운',
    description: '재물, 사업, 금전운',
    themeColor: 'amber',
    gradientClass: 'from-amber-900 via-yellow-900 to-orange-950',
    particleColor: '#FBBF24',
    imageKeywords: "Luxury, Gold and Amber tones, Coins, Golden light",
    focusQuestions: [
      "현재의 재정 상황은?", "버려야 할 소비 습관은?", "진정한 부의 의미는?", "풍요의 사용처는?"
    ]
  },
  {
    id: 'social',
    name: '사람과 인연',
    description: '친구, 동료, 대인관계',
    themeColor: 'cyan',
    gradientClass: 'from-cyan-900 via-teal-900 to-blue-950',
    particleColor: '#22D3EE',
    imageKeywords: "Connection, Deep Ocean, Teal and Cyan tones, Threads",
    focusQuestions: [
      "떠오르는 얼굴들은?", "상처가 된 말은?", "전하고 싶은 진심은?", "기억되고 싶은 모습은?"
    ]
  },
  {
    id: 'growth',
    name: '나의 잠재력',
    description: '성장, 학업, 자기계발',
    themeColor: 'emerald',
    gradientClass: 'from-emerald-900 via-green-900 to-teal-950',
    particleColor: '#34D399',
    imageKeywords: "Nature, Forest, Green and Gold tones, Tree of life",
    focusQuestions: [
      "숨겨진 재능은?", "넘어야 할 벽은?", "도달하고 싶은 곳은?", "성장을 위한 준비는?"
    ]
  },
  {
    id: 'career',
    name: '직업과 진로',
    description: '취업, 이직, 비즈니스',
    themeColor: 'blue',
    gradientClass: 'from-blue-900 via-indigo-900 to-slate-950',
    particleColor: '#60A5FA',
    imageKeywords: "Structure, Blue and Silver tones, Geometric, Architectural",
    focusQuestions: [
      "현재의 만족도는?", "변화를 막는 것은?", "꿈꾸는 성취는?", "내일의 목표는?"
    ]
  }
];


// --- 2. ASSETS POOL ---
const PATTERNS = [
  'radial-gradient(circle, rgba(255,255,255,0.05) 2px, transparent 2.5px)',
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 10px)',
  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)',
  'conic-gradient(from 90deg at 2px 2px, transparent 90deg, rgba(255,255,255,0.03) 0) 0 0/20px 20px',
  'repeating-radial-gradient(circle at 0 0, transparent 0, rgba(255,255,255,0.02) 10px)',
];

const ICONS_LIST = [
  'Sun', 'Moon', 'Star', 'Cloud', 'Wind', 'Zap', 'Snowflake', 'Flame', 
  'Flower', 'Leaf', 'Mountain', 'Anchor', 'Compass', 'Map', 'Globe',
  'Key', 'Lock', 'Shield', 'Sword', 'Crown', 'Trophy', 'Award',
  'Diamond', 'Gem', 'Heart', 'Eye', 'Feather', 'Bell', 'Hourglass', 'Watch'
];

// --- 3. STYLE GENERATOR ---
export const generateCategoryStyles = (category: FortuneCategory): CardBackStyle[] => {
  const styles: CardBackStyle[] = [];
  
  let baseColors: { border: string, accent: string } = { border: 'border-purple-500/30', accent: 'text-purple-200' };
  
  if (category.id === 'love') baseColors = { border: 'border-rose-500/30', accent: 'text-rose-200' };
  if (category.id === 'wealth') baseColors = { border: 'border-amber-500/30', accent: 'text-amber-200' };
  if (category.id === 'social') baseColors = { border: 'border-cyan-500/30', accent: 'text-cyan-200' };
  if (category.id === 'growth') baseColors = { border: 'border-emerald-500/30', accent: 'text-emerald-200' };
  if (category.id === 'career') baseColors = { border: 'border-blue-500/30', accent: 'text-blue-200' };

  for (let i = 0; i < 50; i++) {
    const icon = ICONS_LIST[i % ICONS_LIST.length];
    const pattern = PATTERNS[i % PATTERNS.length];
    
    styles.push({
      id: `style_${category.id}_${i + 1}`,
      name: `${category.name} ${icon}`,
      bgClass: `bg-gradient-to-br ${category.gradientClass}`,
      borderClass: baseColors.border,
      accentClass: baseColors.accent,
      iconName: icon,
      pattern: pattern
    });
  }
  
  return styles.sort(() => Math.random() - 0.5);
};

// --- 4. PROCEDURAL TEXT ---
type WordBank = { modifiers: string[]; subjects: string[]; predicates: string[]; };
type CategoryWords = { [round: number]: WordBank; };

const GENERAL_WORDS: CategoryWords = {
  1: { modifiers: ['희미한', '깊은', '고요한'], subjects: ['울림이', '목소리가'], predicates: ['들려옵니다', '깨어납니다'] },
  2: { modifiers: ['감춰진', '무거운', '흐릿한'], subjects: ['그림자가', '장벽이'], predicates: ['드리웁니다', '다가옵니다'] },
  3: { modifiers: ['찬란한', '새로운', '따스한'], subjects: ['빛이', '희망이'], predicates: ['비칩니다', '솟아납니다'] },
  4: { modifiers: ['결정적', '진정한', '마지막'], subjects: ['해답이', '진실이'], predicates: ['기다립니다', '완성됩니다'] }
};

const CATEGORY_WORDS: Record<string, CategoryWords> = {
  general: GENERAL_WORDS,
  love: GENERAL_WORDS, wealth: GENERAL_WORDS, social: GENERAL_WORDS, growth: GENERAL_WORDS, career: GENERAL_WORDS 
};

export const generateRoundTexts = (roundNum: number, count: number = 4, categoryId: string = 'general'): string[] => {
  const categoryDict = CATEGORY_WORDS[categoryId] || GENERAL_WORDS;
  const theme = categoryDict[roundNum] || GENERAL_WORDS[1];
  const uniqueSet = new Set<string>();
  let attempts = 0;
  while (uniqueSet.size < count && attempts < 50) {
    const mod = theme.modifiers[Math.floor(Math.random() * theme.modifiers.length)];
    const sub = theme.subjects[Math.floor(Math.random() * theme.subjects.length)];
    const pred = theme.predicates[Math.floor(Math.random() * theme.predicates.length)];
    uniqueSet.add(`${mod}\n${sub} ${pred}`);
    attempts++;
  }
  const results = Array.from(uniqueSet);
  while (results.length < count) results.push(results[0]);
  return results;
};

export const getGameThemes = (): Theme[] => {
  return [
    { title: 'Round I : Awakening', desc: '감각을 깨우는 신호' },
    { title: 'Round II : Shadow', desc: '마음 깊은 곳의 그림자' },
    { title: 'Round III : Dawn', desc: '희망이 비추는 길' },
    { title: 'Round IV : Destiny', desc: '운명이 전하는 메시지' }
  ];
};