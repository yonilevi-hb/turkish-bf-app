
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Book, Play } from 'lucide-react';

export interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  image?: string;
}

interface DeckSelectorProps {
  decks: Deck[];
  onDeckSelect: (deckId: string) => void;
  selectedDeck: string | null;
}

export function DeckSelector({ decks, onDeckSelect, selectedDeck }: DeckSelectorProps) {
  const [hoveredDeck, setHoveredDeck] = useState<string | null>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">
        Select a deck
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => (
          <motion.div
            key={deck.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border ${
              selectedDeck === deck.id 
                ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/50' 
                : 'border-slate-200 dark:border-slate-700'
            } transition-all`}
            onMouseEnter={() => setHoveredDeck(deck.id)}
            onMouseLeave={() => setHoveredDeck(null)}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <Book size={40} className="text-white" />
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800 dark:text-white">{deck.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(deck.level)}`}>
                  {deck.level.charAt(0).toUpperCase() + deck.level.slice(1)}
                </span>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                {deck.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {deck.cardCount} cards
                </span>
                
                <Button 
                  variant={selectedDeck === deck.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDeckSelect(deck.id)} 
                  className={selectedDeck === deck.id 
                    ? "bg-indigo-500 hover:bg-indigo-600" 
                    : ""}
                >
                  {selectedDeck === deck.id ? (
                    <>
                      <Play size={14} className="mr-1" /> 
                      Learning
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
