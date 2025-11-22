export interface CardBackStyle {
  id: string;
  name: string; 
  bgClass: string; 
  borderClass: string; 
  accentClass: string; 
  iconName: string; 
  pattern: string; 
}

export interface RoundCardData extends CardBackStyle {
  text: string; 
}

export interface LuckyPrescription {
  color: string;     
  number: string;    
  direction: string; 
  item: string;      
}

export interface GeneratedDestiny {
  fortuneText: string; 
  longInterpretation: string; 
  luckyPrescription: LuckyPrescription; 
  imageBase64: string; 
  sentiment: 'positive' | 'cautionary'; 
}

export type GameStep = 'landing' | 'category' | 'intro' | 'playing' | 'loading' | 'result';

export interface Theme {
  title: string;
  desc: string;
}

export interface FortuneCategory {
  // ADDED 'career' to the union type
  id: 'general' | 'love' | 'wealth' | 'social' | 'growth' | 'career';
  name: string;
  description: string;
  themeColor: string; 
  gradientClass: string; 
  particleColor: string; 
  focusQuestions: string[]; 
  imageKeywords: string; 
}

export interface RoundInfo {
  roundNumber: number; 
  title: string;
  description: string; 
  cards: RoundCardData[]; 
}

export interface RoundContent {
  roundNumber: number;
  title: string;
  question: string;
  cardTexts: string[]; 
}

export interface HistoryItem {
  id: number;
  timestamp: number;
  categoryName: string;
  shortFortune: string;
  longInterpretation: string;
  luckyPrescription: LuckyPrescription;
  imageBase64: string;
  sentiment: 'positive' | 'cautionary';
}