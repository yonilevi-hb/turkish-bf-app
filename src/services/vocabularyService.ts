
import { toast } from "sonner";

// Define the vocabulary word structure
export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  examples?: string[];
}

// API endpoints
const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const TRANSLATE_API = "https://libretranslate.de/translate";

// Translate text from English to Turkish
export const translateWord = async (text: string): Promise<VocabularyWord | null> => {
  try {
    if (!text.trim()) {
      toast.error("Please enter a word to translate");
      return null;
    }

    // Get the English definition first
    const definitionResponse = await fetch(`${API_URL}/${encodeURIComponent(text)}`);
    
    if (!definitionResponse.ok) {
      toast.error(`Couldn't find definition for "${text}"`);
      return null;
    }
    
    const definitionData = await definitionResponse.json();
    
    // Now translate to Turkish
    const translationResponse = await fetch(TRANSLATE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'tr'
      })
    });

    if (!translationResponse.ok) {
      toast.error("Translation service unavailable");
      return null;
    }

    const translationData = await translationResponse.json();
    
    return {
      id: `translated_${Date.now()}`,
      word: translationData.translatedText || text,
      translation: text,
      examples: definitionData[0]?.meanings?.[0]?.definitions?.[0]?.example ? 
        [definitionData[0].meanings[0].definitions[0].example] : undefined
    };
  } catch (error) {
    console.error('Error translating word:', error);
    toast.error("Failed to translate word");
    return null;
  }
};
