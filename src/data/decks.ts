
import { Deck } from '@/components/DeckSelector';
import { initialCards } from './cards';

// Filter functions to get cards for each deck
const verbCards = initialCards.filter(card => 
  card.translation.startsWith('to ') || // English verbs start with 'to'
  ['yemek', 'içmek', 'uyumak', 'yürümek', 'koşmak', 'konuşmak', 'dinlemek', 
   'görmek', 'duymak', 'anlamak', 'bilmek', 'sevmek', 'istemek', 'vermek', 
   'almak', 'gitmek', 'gelmek'].includes(card.word)
);

const phrasesCards = initialCards.filter(card => 
  card.word.includes(' ') || 
  ['merhaba', 'evet', 'hayır', 'teşekkürler', 'lütfen', 'günaydın', 
   'iyi geceler', 'nasılsın'].includes(card.word)
);

const basicCards = initialCards.filter(card => 
  !card.translation.startsWith('to ') && 
  !card.word.includes(' ') && 
  !['merhaba', 'evet', 'hayır', 'teşekkürler', 'lütfen', 'günaydın', 
    'iyi geceler', 'nasılsın'].includes(card.word) &&
  card.id.split('_')[1] <= '030'
);

const intermediateCards = initialCards.filter(card => 
  !card.translation.startsWith('to ') && 
  !card.word.includes(' ') &&
  card.id.split('_')[1] > '030' &&
  card.id.split('_')[1] <= '070'
);

const advancedCards = initialCards.filter(card => 
  !card.translation.startsWith('to ') && 
  !card.word.includes(' ') &&
  card.id.split('_')[1] > '070'
);

export const decks: Deck[] = [
  {
    id: 'basics',
    name: 'Turkish Basics',
    description: 'Essential Turkish vocabulary for beginners',
    cardCount: basicCards.length,
    level: 'beginner',
  },
  {
    id: 'verbs',
    name: 'Common Verbs',
    description: 'Most used Turkish verbs',
    cardCount: verbCards.length,
    level: 'beginner',
  },
  {
    id: 'phrases',
    name: 'Common Phrases',
    description: 'Everyday Turkish expressions',
    cardCount: phrasesCards.length,
    level: 'beginner',
  },
  {
    id: 'intermediate',
    name: 'Intermediate Vocab',
    description: 'Take your Turkish to the next level',
    cardCount: intermediateCards.length,
    level: 'intermediate',
  },
  {
    id: 'advanced',
    name: 'Advanced Topics',
    description: 'Complex Turkish vocabulary',
    cardCount: advancedCards.length,
    level: 'advanced',
  },
  {
    id: 'mixed',
    name: 'Mixed Practice',
    description: 'Mix of vocabulary from all levels',
    cardCount: initialCards.length,
    level: 'mixed',
  }
];

// Export the filtered card arrays so they can be used when a deck is selected
export const deckCards = {
  basics: basicCards,
  verbs: verbCards,
  phrases: phrasesCards,
  intermediate: intermediateCards,
  advanced: advancedCards,
  mixed: initialCards
};

