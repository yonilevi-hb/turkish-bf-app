import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { VocabularyList } from '@/components/VocabularyList';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/Card';
import { DirectionToggle } from '@/components/DirectionToggle';
import { initialCards } from '@/data/cards';
import { SWIPE_THRESHOLD } from '@/utils/swipe';
import { FileUpload } from '@/components/FileUpload';
import { handleSwipe, getNextCard } from '@/utils/spacedRepetition';
import { toast } from "sonner";
import { useTheme } from 'next-themes';
import { Sun, Moon, Shuffle, Settings, List, BookOpen, Play, Star } from 'lucide-react';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { ProgressStats } from '@/components/ProgressStats';
import { DeckSelector, Deck } from '@/components/DeckSelector';
import { decks } from '@/data/decks';
import { ReviewMode } from '@/components/ReviewMode';
import { SettingsScreen } from '@/components/SettingsScreen';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useFavorites } from '@/hooks/useFavorites';

// Define the card interface to fix TypeScript errors
interface CardWithMetadata {
  id: string;
  word: string;
  translation: string;
  level: number;
  nextReview: number;
  isFavorite: boolean;
  category?: string;
}

export default function Index() {
  const [reveal, setReveal] = useState(false);
  const [mode, setMode] = useState('tr_en');
  const [reverse, setReverse] = useState(false);
  const [view, setView] = useState<'cards' | 'list' | 'decks' | 'review' | 'settings' | 'favorites'>('decks');
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [showFeedback, setShowFeedback] = useState(true);
  const [knownCards, setKnownCards] = useState(0);
  const [unknownCards, setUnknownCards] = useState(0);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const { setTheme, theme } = useTheme();
  const { favoritedCardIds, toggleFavorite, isFavorite } = useFavorites();
  
  const [settings, setSettings] = useState({
    swipeSensitivity: 50,
    speechRate: 0.8,
    autoFlip: false,
    cardFlipTime: 3,
    theme: theme as 'light' | 'dark' | 'system'
  });
  
  // Add favorites property to cards
  const [cards, setCards] = useState<CardWithMetadata[]>(() => 
    initialCards.map(card => ({
      ...card,
      level: 0,
      nextReview: Date.now(),
      isFavorite: isFavorite(card.id)
    }))
  );
  
  // Update card favorites when favoritedCardIds changes
  useEffect(() => {
    setCards(prevCards => 
      prevCards.map(card => ({
        ...card,
        isFavorite: isFavorite(card.id)
      }))
    );
  }, [favoritedCardIds]);
  
  const [currentCard, setCurrentCard] = useState<CardWithMetadata | null>(() => {
    const next = getNextCard(cards);
    return next ? { ...next, isFavorite: isFavorite(next.id) } : null;
  });
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    // Update theme when settings change
    if (settings.theme !== theme) {
      setTheme(settings.theme);
    }
  }, [settings, setTheme, theme]);

  useEffect(() => {
    if (currentCard) {
      const index = cards.findIndex(card => card.id === currentCard.id);
      setCurrentCardIndex(index);
    }
  }, [currentCard, cards]);

  const handleAddCards = (newCards: any[]) => {
    const cardsWithMetadata = newCards.map(card => ({
      ...card,
      level: 0,
      nextReview: Date.now(),
      isFavorite: isFavorite(card.id)
    }));
    
    setCards(prevCards => [...prevCards, ...cardsWithMetadata]);
    toast(`Added ${newCards.length} new cards!`);
  };

  useEffect(() => {
    if (!currentCard && selectedDeck) {
      const nextCard = getNextCard(cards);
      if (nextCard) {
        setCurrentCard({...nextCard, isFavorite: isFavorite(nextCard.id)});
      } else {
        toast("Great job! Take a break - no cards to review right now.");
      }
    }
  }, [currentCard, cards, selectedDeck]);

  useEffect(() => {
    if (mode === 'tr_en') {
      setReverse(false);
    } else if (mode === 'en_tr') {
      setReverse(true);
    } else if (mode === 'random') {
      setReverse(Math.random() > 0.5);
    }
  }, [mode, currentCard]);

  const handleCardSwipe = (direction: number) => {
    if (!currentCard) return;
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Gentle haptic feedback
    }

    setReveal(false);
    const isRight = direction > 0;
    
    const updatedCard = handleSwipe(currentCard, isRight);
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === updatedCard.id ? {...updatedCard, isFavorite: card.isFavorite} : card
      )
    );
    
    if (isRight) {
      setKnownCards(prev => prev + 1);
    } else {
      setUnknownCards(prev => prev + 1);
    }
    
    if (showFeedback) {
      toast(isRight ? "Excellent! You'll see this card less often." : "Keep practicing! You'll see this card more frequently.");
      setShowFeedback(false);
      setTimeout(() => setShowFeedback(true), 60000);
    }
    
    setCurrentCard(null);
    setSwipeDirection(direction);
  };

  const handleToggleFavorite = (cardId: string) => {
    toggleFavorite(cardId);
    toast(`Card ${isFavorite(cardId) ? 'removed from' : 'added to'} favorites!`);
  };

  const shuffleCards = () => {
    setCards(prevCards => {
      const shuffled = [...prevCards].sort(() => Math.random() - 0.5);
      toast("Cards shuffled! 🔀");
      return shuffled;
    });
    setCurrentCard(null); // Reset current card to get next one from shuffled deck
  };

  const handleDeckSelect = (deckId: string) => {
    setSelectedDeck(deckId);
    toast(`Selected deck: ${decks.find(d => d.id === deckId)?.name}`);
    setView('cards');
  };

  const handleViewChange = (newView: 'cards' | 'list' | 'decks' | 'review' | 'settings' | 'favorites') => {
    setView(newView);
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 })
  };

  const favoriteCards = cards.filter(card => card.isFavorite);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start gap-6 bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white p-4 font-['Inter']">
      <AnimatePresence>
        {showTutorial && (
          <OnboardingTutorial onComplete={() => setShowTutorial(false)} />
        )}
      </AnimatePresence>
      
      <header className="flex flex-col items-center gap-4 w-full max-w-4xl pt-2">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl md:text-3xl font-bold text-white">T</span>
          </motion.div>
          <motion.h1 
            className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            Turkish BF App
          </motion.h1>
          <Button
            variant="outline"
            size="icon"
            className="ml-2 bg-white dark:bg-gray-800"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        
        {currentCard && view === 'cards' && (
          <div className="flex flex-col items-center gap-1">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Card {currentCardIndex + 1} / {cards.length} ({Math.round(((currentCardIndex + 1) / cards.length) * 100)}%)
            </div>
            <div className="w-64 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        <ToggleGroup type="single" value={view} onValueChange={(value) => {
          if (value) handleViewChange(value as any);
        }}>
          <ToggleGroupItem value="decks" aria-label="Toggle decks view">
            <BookOpen className="h-4 w-4 mr-2" />
            Decks
          </ToggleGroupItem>
          <ToggleGroupItem value="cards" aria-label="Toggle cards view" disabled={!selectedDeck}>
            <Play className="h-4 w-4 mr-2" />
            Learn
          </ToggleGroupItem>
          <ToggleGroupItem value="review" aria-label="Toggle review mode" disabled={!selectedDeck}>
            <List className="h-4 w-4 mr-2" />
            Review
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Toggle list view">
            <BookOpen className="h-4 w-4 mr-2" />
            Vocabulary
          </ToggleGroupItem>
          <ToggleGroupItem value="favorites" aria-label="Toggle favorites">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </ToggleGroupItem>
          <ToggleGroupItem value="settings" aria-label="Toggle settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </ToggleGroupItem>
        </ToggleGroup>

        {view === 'cards' && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={shuffleCards}
              className="flex items-center gap-2 bg-white dark:bg-gray-800"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle Cards
            </Button>
            <FileUpload onCardsAdd={handleAddCards} />
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {view === 'cards' && selectedDeck && (
          <motion.div 
            key="cards-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6 w-full max-w-xl"
          >
            <div className="relative w-full h-[calc(100dvh-300px)] min-h-[400px] flex items-center justify-center touch-pan-y">
              <AnimatePresence custom={swipeDirection} initial={false} mode="wait">
                <motion.div
                  key={currentCard?.id + (reverse ? 'reverse' : 'normal')}
                  custom={swipeDirection}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="absolute w-full px-6 md:px-12 py-8 md:py-16"
                >
                  {currentCard && (
                    <Card
                      card={currentCard}
                      reveal={reveal}
                      setReveal={setReveal}
                      reverse={reverse}
                      onSwipe={handleCardSwipe}
                      onToggleFavorite={() => handleToggleFavorite(currentCard.id)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <DirectionToggle mode={mode} setMode={setMode} />
            
            <ProgressStats 
              totalCards={cards.length} 
              knownCards={knownCards} 
              unknownCards={unknownCards} 
            />
          </motion.div>
        )}
        
        {view === 'decks' && (
          <motion.div 
            key="decks-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <DeckSelector 
              decks={decks}
              onDeckSelect={handleDeckSelect}
              selectedDeck={selectedDeck}
            />
          </motion.div>
        )}
        
        {view === 'list' && (
          <motion.div 
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <VocabularyList 
              cards={cards}
              onToggleFavorite={handleToggleFavorite}
            />
          </motion.div>
        )}
        
        {view === 'favorites' && (
          <motion.div 
            key="favorites-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <div className="w-full max-w-4xl mx-auto bg-eggwhite/5 rounded-xl backdrop-blur-sm border border-eggwhite/10 p-6">
              <h2 className="text-2xl font-bold text-bordeaux mb-6">Favorite Cards</h2>
              
              {favoriteCards.length > 0 ? (
                <VocabularyList 
                  cards={favoriteCards}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : (
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg text-gray-600 dark:text-gray-400">No favorite cards yet.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Tap the star icon on any card to add it to your favorites.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {view === 'review' && selectedDeck && (
          <motion.div 
            key="review-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <ReviewMode 
              cards={cards} 
              onExit={() => setView('cards')}
              autoPlaySpeed={settings.cardFlipTime * 1000}
            />
          </motion.div>
        )}
        
        {view === 'settings' && (
          <motion.div 
            key="settings-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <SettingsScreen 
              settings={settings}
              onSettingsChange={setSettings}
              onClose={() => setView(selectedDeck ? 'cards' : 'decks')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
