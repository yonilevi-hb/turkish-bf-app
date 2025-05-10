
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

// Translate text from English to Turkish with timeout
export const translateWord = async (text: string): Promise<VocabularyWord | null> => {
  try {
    if (!text.trim()) {
      toast.error("Please enter a word to translate");
      return null;
    }

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Translation request timed out")), 10000);
    });

    // Get the English definition first
    const definitionPromise = fetch(`${API_URL}/${encodeURIComponent(text)}`);
    const definitionResponse = await Promise.race([definitionPromise, timeoutPromise]) as Response;
    
    if (!definitionResponse.ok) {
      toast.error(`Couldn't find definition for "${text}"`);
      return {
        id: `manual_${Date.now()}`,
        word: text,
        translation: "Translation failed",
        examples: []
      };
    }
    
    const definitionData = await definitionResponse.json();
    
    // Now translate to Turkish with timeout
    const translationPromise = fetch(TRANSLATE_API, {
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

    const translationResponse = await Promise.race([translationPromise, timeoutPromise]) as Response;

    if (!translationResponse.ok) {
      toast.error("Translation service unavailable");
      return {
        id: `manual_${Date.now()}`,
        word: text,
        translation: "Translation unavailable",
        examples: definitionData[0]?.meanings?.[0]?.definitions?.[0]?.example ? 
          [definitionData[0].meanings[0].definitions[0].example] : []
      };
    }

    const translationData = await translationResponse.json();
    
    return {
      id: `translated_${Date.now()}`,
      word: text, // English word
      translation: translationData.translatedText || text, // Turkish translation
      examples: definitionData[0]?.meanings?.[0]?.definitions?.[0]?.example ? 
        [definitionData[0].meanings[0].definitions[0].example] : []
    };
  } catch (error) {
    console.error('Error translating word:', error);
    toast.error("Failed to translate word. Please try again.");
    
    // Return a basic word object even on failure
    return {
      id: `error_${Date.now()}`,
      word: text,
      translation: "Translation failed",
      examples: []
    };
  }
};
