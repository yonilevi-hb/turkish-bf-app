
import { Deck } from '@/components/DeckSelector';
import { initialCards } from './cards';

export const decks: Deck[] = [
  {
    id: 'basics',
    name: 'Turkish Basics',
    description: 'Essential Turkish vocabulary for beginners',
    cardCount: initialCards.length,
    level: 'beginner',
  },
  {
    id: 'verbs',
    name: 'Common Verbs',
    description: 'Most used Turkish verbs',
    cardCount: 25,
    level: 'beginner',
  },
  {
    id: 'phrases',
    name: 'Common Phrases',
    description: 'Everyday Turkish expressions',
    cardCount: 30,
    level: 'beginner',
  },
  {
    id: 'intermediate',
    name: 'Intermediate Vocab',
    description: 'Take your Turkish to the next level',
    cardCount: 40,
    level: 'intermediate',
  },
  {
    id: 'advanced',
    name: 'Advanced Topics',
    description: 'Complex Turkish vocabulary',
    cardCount: 35,
    level: 'advanced',
  },
  {
    id: 'mixed',
    name: 'Mixed Practice',
    description: 'Mix of vocabulary from all levels',
    cardCount: 50,
    level: 'mixed',
  }
];
