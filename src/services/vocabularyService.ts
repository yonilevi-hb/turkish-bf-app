
import { toast } from "sonner";

// Define the vocabulary word structure from the API
export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  examples?: string[];
}

// Define the category structure
export interface VocabularyCategory {
  id: string;
  name: string;
  description: string;
  wordCount: number;
}

// Using the Free Dictionary API for English definitions
// and translating with LibreTranslate API
const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const TRANSLATE_API = "https://libretranslate.de/translate";

// Get vocabulary categories - using curated categories with real API data
export const getVocabularyCategories = async (): Promise<VocabularyCategory[]> => {
  try {
    // These are curated categories that will be populated with real API data
    return [
      {
        id: 'daily-phrases',
        name: 'Daily Phrases',
        description: 'Common expressions used in everyday conversation',
        wordCount: 20
      },
      {
        id: 'travel',
        name: 'Travel & Tourism',
        description: 'Essential words for travelers in Turkey',
        wordCount: 15
      },
      {
        id: 'food-drinks',
        name: 'Food & Drinks',
        description: 'Culinary vocabulary and restaurant phrases',
        wordCount: 18
      },
      {
        id: 'business',
        name: 'Business Terms',
        description: 'Professional vocabulary for workplace settings',
        wordCount: 12
      },
      {
        id: 'nature',
        name: 'Nature & Environment',
        description: 'Words related to the natural world',
        wordCount: 16
      }
    ];
  } catch (error) {
    console.error('Error fetching vocabulary categories:', error);
    toast.error('Failed to load vocabulary categories');
    return [];
  }
};

// Map of common words for each category
const categoryWordMap: Record<string, string[]> = {
  'daily-phrases': ['hello', 'goodbye', 'please', 'thank you', 'sorry', 'excuse me', 'good morning', 'good evening', 'how are you', 'my name is', 'nice to meet you', 'welcome', 'help', 'understand', 'speak', 'listen', 'write', 'read', 'learn', 'practice'],
  'travel': ['airport', 'hotel', 'ticket', 'passport', 'baggage', 'train', 'bus', 'taxi', 'subway', 'map', 'reservation', 'tourist', 'guide', 'sightseeing', 'beach'],
  'food-drinks': ['restaurant', 'menu', 'water', 'coffee', 'tea', 'breakfast', 'lunch', 'dinner', 'delicious', 'spicy', 'sweet', 'sour', 'salt', 'pepper', 'fruit', 'vegetable', 'meat', 'bread'],
  'business': ['meeting', 'office', 'email', 'call', 'project', 'manager', 'team', 'report', 'proposal', 'client', 'deadline', 'budget'],
  'nature': ['tree', 'flower', 'river', 'mountain', 'sea', 'forest', 'sky', 'sun', 'moon', 'star', 'rain', 'snow', 'wind', 'earth', 'animal', 'bird']
};

// Translate text from English to Turkish
const translateToTurkish = async (text: string): Promise<string> => {
  try {
    const response = await fetch(TRANSLATE_API, {
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

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
};

// Get word definition from the Free Dictionary API
const getWordDefinition = async (word: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      throw new Error(`Dictionary API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching definition for ${word}:`, error);
    return null;
  }
};

// Get words for a specific category
export const getWordsByCategory = async (categoryId: string): Promise<VocabularyWord[]> => {
  try {
    const words = categoryWordMap[categoryId] || [];
    const result: VocabularyWord[] = [];
    
    // Process only the first 10 words to avoid rate limiting
    for (let i = 0; i < Math.min(words.length, 10); i++) {
      const word = words[i];
      const definition = await getWordDefinition(word);
      
      if (definition && definition.length > 0) {
        // Get the Turkish translation
        const translation = await translateToTurkish(word);
        
        // Create a vocabulary word object
        const vocabWord: VocabularyWord = {
          id: `${categoryId}_${i}`,
          word: definition[0].word,
          translation: translation,
          category: categoryId,
          examples: definition[0].meanings?.[0]?.definitions?.[0]?.example ? 
            [definition[0].meanings[0].definitions[0].example] : undefined
        };
        
        result.push(vocabWord);
        
        // Add a small delay to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error fetching words for category ${categoryId}:`, error);
    toast.error('Failed to load vocabulary words');
    return [];
  }
};

// Search vocabulary across all categories
export const searchVocabulary = async (query: string): Promise<VocabularyWord[]> => {
  try {
    if (!query || query.length < 2) return [];
    
    // Try to get direct definition from API
    const definition = await getWordDefinition(query);
    
    if (definition && definition.length > 0) {
      const translation = await translateToTurkish(query);
      
      return [{
        id: `search_${Date.now()}`,
        word: definition[0].word,
        translation: translation,
        category: 'Search Results',
        examples: definition[0].meanings?.[0]?.definitions?.[0]?.example ? 
          [definition[0].meanings[0].definitions[0].example] : undefined
      }];
    }
    
    // If no direct match, search through each category
    const allCategories = await getVocabularyCategories();
    let allWords: VocabularyWord[] = [];
    
    // Get words that start with the query from category maps
    for (const category of allCategories) {
      const categoryWords = categoryWordMap[category.id] || [];
      const matchingWords = categoryWords.filter(word => 
        word.toLowerCase().startsWith(query.toLowerCase())
      ).slice(0, 3); // Limit to 3 per category
      
      if (matchingWords.length > 0) {
        for (const word of matchingWords) {
          const definition = await getWordDefinition(word);
          if (definition && definition.length > 0) {
            const translation = await translateToTurkish(word);
            
            allWords.push({
              id: `search_${Date.now()}_${word}`,
              word: definition[0].word,
              translation: translation,
              category: category.name,
              examples: definition[0].meanings?.[0]?.definitions?.[0]?.example ? 
                [definition[0].meanings[0].definitions[0].example] : undefined
            });
            
            // Add a small delay between requests
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
    }
    
    return allWords;
  } catch (error) {
    console.error('Error searching vocabulary:', error);
    toast.error('Failed to search vocabulary');
    return [];
  }
};

// Add this to allow importing words directly into a user's deck
export const importVocabularyToDeck = async (word: string): Promise<VocabularyWord | null> => {
  try {
    const definition = await getWordDefinition(word);
    
    if (definition && definition.length > 0) {
      const translation = await translateToTurkish(word);
      
      return {
        id: `imported_${Date.now()}`,
        word: definition[0].word,
        translation: translation,
        category: 'Imported',
        examples: definition[0].meanings?.[0]?.definitions?.[0]?.example ? 
          [definition[0].meanings[0].definitions[0].example] : undefined
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error importing vocabulary word ${word}:`, error);
    toast.error('Failed to import vocabulary word');
    return null;
  }
};
