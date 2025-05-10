
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
import { Sun, Moon, Shuffle, Settings, List, BookOpen, Play, Star, Search, Plus } from 'lucide-react';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { ProgressStats } from '@/components/ProgressStats';
import { DeckSelector, Deck } from '@/components/DeckSelector';
import { decks } from '@/data/decks';
import { ReviewMode } from '@/components/ReviewMode';
import { SettingsScreen } from '@/components/SettingsScreen';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useFavorites } from '@/hooks/useFavorites';
import { Input } from "@/components/ui/input";
import { translateWord, VocabularyWord } from '@/services/vocabularyService';
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

// Define the card interface to fix TypeScript errors
interface CardWithMetadata {
  id: string;
  word: string;
  translation: string;
  level: number;
  nextReview: number;
  isFavorite: boolean;
  category?: string;
  examples?: string[];
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
  const [newWordInput, setNewWordInput] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const isMobile = useIsMobile();
  
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

  const form = useForm({
    defaultValues: {
      word: '',
    },
  });

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

  // Handle translation of new words
  const handleTranslateWord = async (word: string) => {
    if (!word.trim()) {
      toast.error("Please enter a word to translate");
      return;
    }

    setIsTranslating(true);
    
    try {
      const translatedWord = await translateWord(word.trim());
      
      if (translatedWord) {
        const newCard = {
          id: translatedWord.id,
          word: translatedWord.translation, // English word
          translation: translatedWord.word, // Turkish translation
          level: 0,
          nextReview: Date.now(),
          isFavorite: false,
          examples: translatedWord.examples,
          category: 'Custom'
        };
        
        setCards(prevCards => [...prevCards, newCard]);
        toast.success(`Added "${word}" to your vocabulary!`);
        form.reset();
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Failed to translate word");
    } finally {
      setIsTranslating(false);
    }
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

  // Load imported vocabulary if available
  useEffect(() => {
    const importedVocabJson = localStorage.getItem('importedVocabulary');
    if (importedVocabJson) {
      try {
        const importedVocab = JSON.parse(importedVocabJson);
        if (Array.isArray(importedVocab) && importedVocab.length > 0) {
          // Convert imported vocab to card format
          const newCards = importedVocab.map(word => ({
            id: word.id || `imp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            word: word.translation, // Turkish word
            translation: word.word, // English word
            level: 0,
            nextReview: Date.now(),
            isFavorite: false,
            category: word.category || 'Imported',
            examples: word.examples
          }));
          
          // Check for duplicates before adding
          const existingIds = new Set(cards.map(card => card.id));
          const uniqueNewCards = newCards.filter(card => !existingIds.has(card.id));
          
          if (uniqueNewCards.length > 0) {
            setCards(prev => [...prev, ...uniqueNewCards]);
            toast.success(`Added ${uniqueNewCards.length} imported words to your collection!`);
            
            // Clear the imported vocabulary from localStorage
            localStorage.removeItem('importedVocabulary');
          }
        }
      } catch (error) {
        console.error('Error parsing imported vocabulary:', error);
      }
    }
  }, []);

  const onSubmit = (data: { word: string }) => {
    handleTranslateWord(data.word);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start gap-4 md:gap-6 bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white p-3 md:p-4 font-['Inter']">
      <AnimatePresence>
        {showTutorial && (
          <OnboardingTutorial onComplete={() => setShowTutorial(false)} />
        )}
      </AnimatePresence>
      
      <header className="flex flex-col items-center gap-4 w-full max-w-md md:max-w-4xl pt-2">
        <div className="flex items-center gap-2 md:gap-3">
          <motion.div 
            className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl md:text-3xl font-bold text-white">T</span>
          </motion.div>
          <motion.h1 
            className="text-2xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {isMobile ? "Turkish BF" : "Turkish BF App"}
          </motion.h1>
          <Button
            variant="outline"
            size="icon"
            className="ml-auto bg-white dark:bg-gray-800"
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

        <div className="overflow-x-auto pb-2 w-full">
          <ToggleGroup type="single" value={view} className="inline-flex" onValueChange={(value) => {
            if (value) handleViewChange(value as any);
          }}>
            <ToggleGroupItem value="decks" aria-label="Toggle decks view">
              <BookOpen className="h-4 w-4 mr-2" />
              {!isMobile && "Decks"}
            </ToggleGroupItem>
            <ToggleGroupItem value="cards" aria-label="Toggle cards view" disabled={!selectedDeck}>
              <Play className="h-4 w-4 mr-2" />
              {!isMobile && "Learn"}
            </ToggleGroupItem>
            <ToggleGroupItem value="review" aria-label="Toggle review mode" disabled={!selectedDeck}>
              <List className="h-4 w-4 mr-2" />
              {!isMobile && "Review"}
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Toggle list view">
              <BookOpen className="h-4 w-4 mr-2" />
              {!isMobile && "Vocabulary"}
            </ToggleGroupItem>
            <ToggleGroupItem value="favorites" aria-label="Toggle favorites">
              <Star className="h-4 w-4 mr-2" />
              {!isMobile && "Favorites"}
            </ToggleGroupItem>
            <ToggleGroupItem value="settings" aria-label="Toggle settings">
              <Settings className="h-4 w-4 mr-2" />
              {!isMobile && "Settings"}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {view === 'cards' && (
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <Button
              variant="outline"
              onClick={shuffleCards}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 text-sm"
            >
              <Shuffle className="h-4 w-4" />
              {!isMobile && "Shuffle Cards"}
            </Button>
            <FileUpload onCardsAdd={handleAddCards} />
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size={isMobile ? "sm" : "default"} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {isMobile ? "New" : "Add Word"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Vocabulary</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="word"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>English Word</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter English word to translate" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isTranslating}
                    >
                      {isTranslating ? "Translating..." : "Translate & Add"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
            className="flex flex-col items-center gap-6 w-full max-w-md md:max-w-xl"
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
                  className="absolute w-full px-4 md:px-12 py-6 md:py-16"
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
            className="w-full max-w-md md:max-w-4xl"
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
            className="w-full max-w-md md:max-w-4xl"
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
            className="w-full max-w-md md:max-w-4xl"
          >
            <div className="w-full max-w-md md:max-w-4xl mx-auto bg-eggwhite/5 rounded-xl backdrop-blur-sm border border-eggwhite/10 p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-bordeaux mb-4 md:mb-6">Favorite Cards</h2>
              
              {favoriteCards.length > 0 ? (
                <VocabularyList 
                  cards={favoriteCards}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : (
                <div className="text-center py-8 md:py-12">
                  <Star className="mx-auto h-10 md:h-12 w-10 md:w-12 text-gray-400 mb-3" />
                  <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">No favorite cards yet.</p>
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
            className="w-full max-w-md md:max-w-4xl"
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
            className="w-full max-w-md md:max-w-4xl"
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
