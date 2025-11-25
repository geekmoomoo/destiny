import { GoogleGenAI, Modality, Type } from "@google/genai";
import { GeneratedDestiny, Theme, FortuneCategory, RoundContent, LuckyPrescription } from "../types";

// --- ROBUST API KEY RETRIEVAL ---
const getApiKey = () => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
      return (import.meta as any).env.VITE_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Environment variable read error:", e);
  }
  return "";
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy_key_for_init" });

if (!apiKey) {
  console.warn("?좑툘 API Key is missing. AI features will use fallback data.");
}

// --- HELPER: IMAGE COMPRESSION (HIGH QUALITY) ---
async function compressBase64Image(base64Str: string, maxWidth: number = 1024, quality: number = 0.9): Promise<string> {
  if (typeof window === 'undefined') return base64Str; 

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = base64Str;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
           resolve(base64Str);
           return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        // Increased quality for better artifact look
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (e) {
        console.warn("Image compression failed", e);
        resolve(base64Str);
      }
    };
    img.onerror = (e) => {
        console.warn("Image load error during compression", e);
        resolve(base64Str);
    };
  });
}

// --- RANDOMNESS VARIABLES ---
const VISUAL_SEEDS = [
  "Crimson and Gold lighting", "Deep Azure and Silver", "Emerald glowing mist", "Obsidian and Violet", 
  "Warm Sunset hues", "Cold Moonlight", "Neon bioluminescence", "Sepia vintage tone", "Prismatic refraction",
  "Foggy and mysterious", "Sparkling and ethereal", "Stormy and intense", "Calm and serene", "Dusty and ancient",
  "Underwater distortion", "Cosmic stardust", "Wind-blown motion",
  "Floating crystals", "Blooming ancient flowers", "Twisted roots", "Geometric constellations", "Falling feathers",
  "Rising smoke", "Shattered glass", "Flowing water ribbons", "Burning embers", "Golden chains",
  "Dreamlike surrealism", "Intricate stained glass", "Watercolor bleed", "Oil painting texture", "Cinematic lighting"
];

function getRandomVisualSeeds(count: number = 3): string {
  const shuffled = [...VISUAL_SEEDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join(", ");
}

// --- CLEANUP FOR CARD TEXTS ---
const IMPERATIVE_PATTERNS = [
  /더\s*깊[이히]\s*(느껴보세요|바라보세요|바라보라|살펴보세요|들여다보세요)/gi,
  /\s*(보세요|바라보라|바라보세요|느껴보세요)$/gi
];

function sanitizeCardText(text: string): string {
  if (!text) return "";
  let cleaned = text;
  for (const re of IMPERATIVE_PATTERNS) {
    cleaned = cleaned.replace(re, "");
  }
  cleaned = cleaned.replace(/[.?!]+$/, "").trim();
  return cleaned || "고요한 기운";
}

function sanitizeSummary(text: string): string {
  if (!text) return "";
  let cleaned = text.replace(/[.?!]+$/, "").trim();
  if (cleaned.length > 30) cleaned = cleaned.slice(0, 30) + "…";
  return cleaned || "짧은 속삭임";
}

// --- MAIN FUNCTIONS ---

export async function generateGameSession(category: FortuneCategory): Promise<RoundContent[]> {
  if (!apiKey) {
    console.warn("Skipping AI generation due to missing API Key.");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      Role: You are a grand mystic Tarot Master designing a spiritual journey.
      Topic: ${category.name} (${category.description})
      Task: Create content for 4 rounds of tarot reading.
      
      Structure: 
      Round 1: The Awakening (Current State)
      Round 2: The Shadow (Obstacles)
      Round 3: The Dawn (Hope)
      Round 4: The Destiny (Final Answer)
      
      Requirements: 
      - Language: Korean.
      - Tone: Extremely mystical, poetic, deep, slightly archaic but understandable.
      - For 'question', write ONE concise sentence (no multiple questions chained).
      - For 'cardTexts', give 4 distinct, short metaphoric noun or declarative phrases (max 15 chars) that ANSWER the question directly (예: "바다가 흐르듯", "은빛 안개줄기", "담금질된 검"). 금지: "~보세요", "~바라보라", "~느껴보세요", 물음표. 문장 끝은 평서형/명사형으로.
      - For 'cardSummaries', give 4 one-line summaries (max 40 chars) explaining briefly why that cardText appears / what it hints at. Tone: 서정적 설명, 평서문.
      
      Output JSON Schema: Array of 4 objects (roundNumber, title, question, cardTexts, cardSummaries).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              roundNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              question: { type: Type.STRING },
              cardTexts: { type: Type.ARRAY, items: { type: Type.STRING } },
              cardSummaries: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["roundNumber", "title", "question", "cardTexts"]
          }
        }
      }
    });

    const jsonString = response.text;
    if (!jsonString) throw new Error("Empty response from AI");
    const parsed = JSON.parse(jsonString) as RoundContent[];
    return parsed.map(item => ({
      ...item,
      cardTexts: (item.cardTexts || []).map((txt: string) => sanitizeCardText(txt)),
      cardSummaries: (item.cardSummaries || (item.cardTexts || [])).map((txt: string) => sanitizeSummary(txt))
    }));

  } catch (error) {
    console.warn("Game Session Generation Failed. Using Fallback.", error);
    return []; 
  }
}

async function generateFortuneText(themes: Theme[], category: FortuneCategory): Promise<{short: string, long: string, prescription: LuckyPrescription, sentiment: 'positive' | 'cautionary'}> {
  if (!apiKey) throw new Error("API Key missing");

  const themeContext = themes.map(t => t.title).join(" -> ");
  const isPositive = Math.random() > 0.3;
  const sentiment = isPositive ? 'positive' : 'cautionary';
  const tone = isPositive ? "?щ쭩李④퀬 諛앹?, 湲띿젙?곸씤 ?먮꼫吏" : "吏곸꽕?곸씠怨? 議곗떖?댁빞 ??遺遺꾩쓣 吏싳뼱二쇰뒗, 寃쎄퀬? 議곗뼵";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      Role: You are a legendary Tarot Oracle.
      Topic: ${category.name} (${category.description})
      Tone: ${tone}
      Context: The user navigated this journey: [ ${themeContext} ].
      
      Task: Generate a 'Destiny Reading' consisting of THREE parts.
      Part 1 (shortFortune): A single, impactful, mystical sentence that sounds like a prophecy.
      Part 2 (longInterpretation): A detailed, empathetic essay (20-30 sentences). Use metaphors of nature, cosmos, and light.
      Part 3 (luckyPrescription): luckyColor, luckyNumber, luckyDirection, luckyItem.
            - Language: Korean.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortFortune: { type: Type.STRING },
            longInterpretation: { type: Type.STRING },
            luckyPrescription: {
              type: Type.OBJECT,
              properties: {
                luckyColor: { type: Type.STRING },
                luckyNumber: { type: Type.STRING },
                luckyDirection: { type: Type.STRING },
                luckyItem: { type: Type.STRING }
              },
              required: ["luckyColor", "luckyNumber", "luckyDirection", "luckyItem"]
            },
            sentiment: { type: Type.STRING, enum: ['positive', 'cautionary'] }
          },
          required: ["shortFortune", "longInterpretation", "luckyPrescription"]
        }
      }
    });
    
    const result = JSON.parse(response.text!);
    return {
        short: result.shortFortune || "?뱀떊???욊만??諛앹? 鍮쏆씠 鍮꾩묩?덈떎.",
        long: result.longInterpretation || "?대챸??蹂꾩씠 ?뱀떊??吏耳쒕낫怨??덉뒿?덈떎.",
        prescription: {
            color: result.luckyPrescription?.luckyColor || "Gold",
            number: result.luckyPrescription?.luckyNumber || "7",
            direction: result.luckyPrescription?.luckyDirection || "East",
            item: result.luckyPrescription?.luckyItem || "Mirror"
        },
        sentiment: sentiment
    };
  } catch (error) {
    console.error("Text Generation Error:", error);
    throw error; 
  }
}

async function generateFortuneImage(fortuneText: string, category: FortuneCategory): Promise<string> {
  if (!apiKey) return 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80';

  try {
    const randomSeeds = getRandomVisualSeeds(2);
    const timestamp = Date.now(); 

    const paletteHint = {
      general: "mystical purples and silvers",
      love: "romantic pinks and reds, warm glow",
      wealth: "opulent gold and amber, sapphire accents",
      social: "teal and cyan threads of light",
      growth: "emerald greens with golden sunrays",
      career: "deep blues and steel silver, architectural lines"
    }[(category.id as string)] || "mystical jewel tones";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `
            Tarot card illustration, vertical 9:16, cinematic lighting.
            Theme: ${category.name} (${category.description}).
            Core mood: ${paletteHint}, ${category.imageKeywords}. Visuals: ${randomSeeds}.
            Variation cues: weave in symbols that match "${fortuneText}" and ${category.focusQuestions?.slice(0,2).join(", ") || "the user's focus"}.
            Style: high-fantasy illustration, soft painterly edges, crisp details, varied composition per request.
            Card edges: seamless bleed to black background, no bright/white frame, no glow border.
            Background outside card: pure black; avoid white, gray, or light margins.
            Absolutely no text, no captions, no runes, no labels, no handwriting on the card or borders.
            Entropy: ${timestamp}
            `
          }
        ]
      },
      config: {
        responseModalities: [Modality.IMAGE],
      }
    });

    const candidates = response?.candidates || [];
    let base64Image = null;
    if (candidates.length > 0) {
      const parts = candidates[0]?.content?.parts || [];
      for (const part of parts) {
        if ((part as any)?.inlineData?.data) {
          base64Image = (part as any).inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) throw new Error("No image generated");
    const rawBase64 = `data:image/jpeg;base64,${base64Image}`;
    return await compressBase64Image(rawBase64, 1024, 0.85); // High Quality

  } catch (error) {
    console.error("Image Generation Error:", error);
    return 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80'; 
  }
}

export async function generateDestiny(themes: Theme[], category: FortuneCategory): Promise<GeneratedDestiny> {
  const { short, long, prescription, sentiment } = await generateFortuneText(themes, category);
  const imageBase64 = await generateFortuneImage(short, category);

  return {
    fortuneText: short,
    longInterpretation: long,
    luckyPrescription: prescription,
    imageBase64,
    sentiment
  };
}

// --- ORACLE CHAT FUNCTION ---
export async function chatWithOracle(
    currentHistory: {role: string, text: string}[], 
    userMessage: string, 
    fortuneContext: string
): Promise<string> {
    if (!apiKey) return "蹂꾨뱾??紐⑹냼由ш? ?우? ?딆뒿?덈떎. (API Key Error)";

    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `
                You are a mystical Tarot Oracle. 
                You have just given the user a fortune reading: "${fortuneContext}".
                
                Your task: Answer the user's follow-up question briefly, wisely, and mysteriously.
                - Keep answers under 3 sentences.
                - Use a poetic, empathetic, slightly archaic Korean tone (e.g., "~?⑸땲??, "~援곗슂").
                - Focus on the user's inner growth and the flow of destiny.
                - Do NOT repeat the full reading. Just address the specific question.
                `
            },
            history: currentHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }))
        });

        const result = await chat.sendMessage({ message: userMessage });
        return result.text || "移⑤У留뚯씠 ?먮쫭?덈떎...";
    } catch (error) {
        console.error("Chat Error:", error);
        return "?좎떆 ?곌껐??遺덉븞?뺥븯??紐⑹냼由ш? ?⑹뼱議뚯뒿?덈떎.";
    }
}
