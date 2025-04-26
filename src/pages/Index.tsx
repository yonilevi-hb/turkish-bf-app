
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { VocabularyList } from '@/components/VocabularyList';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/Card';
import { DirectionToggle } from '@/components/DirectionToggle';
import { initialCards } from '@/data/cards';
import { SWIPE_THRESHOLD, swipePower } from '@/utils/swipe';
import { FileUpload } from '@/components/FileUpload';
import { handleSwipe, getNextCard } from '@/utils/spacedRepetition';
import { toast } from "sonner";
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function Index() {
  const [reveal, setReveal] = useState(false);
  const [mode, setMode] = useState('tr_en');
  const [reverse, setReverse] = useState(false);
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [showFeedback, setShowFeedback] = useState(true);
  const { setTheme, theme } = useTheme();
  
  const [cards, setCards] = useState(() => 
    initialCards.map(card => ({
      ...card,
      level: 0,
      nextReview: Date.now()
    }))
  );
  
  const [currentCard, setCurrentCard] = useState(() => getNextCard(cards));
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

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
      nextReview: Date.now()
    }));
    
    setCards(prevCards => [...prevCards, ...cardsWithMetadata]);
    toast(`Added ${newCards.length} new cards!`);
  };

  useEffect(() => {
    if (!currentCard) {
      const nextCard = getNextCard(cards);
      if (nextCard) {
        setCurrentCard(nextCard);
      } else {
        toast("Great job! Take a break - no cards to review right now.");
      }
    }
  }, [currentCard, cards]);

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
        card.id === updatedCard.id ? updatedCard : card
      )
    );
    
    if (showFeedback) {
      toast(isRight ? "Keep practicing! You'll see this card more frequently." : "Good job! You'll see this card less often.");
      setShowFeedback(false);
      setTimeout(() => setShowFeedback(true), 60000);
    }
    
    setCurrentCard(null);
    setSwipeDirection(direction);
  };

  const handleDragEnd = (_e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -SWIPE_THRESHOLD) handleCardSwipe(1);
    else if (swipe > SWIPE_THRESHOLD) handleCardSwipe(-1);
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 })
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start gap-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white p-4 font-['Inter']">
      <header className="flex flex-col items-center gap-4 w-full max-w-4xl pt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl md:text-4xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">
            Turkish BF App
          </h1>
          <Button
            variant="outline"
            size="icon"
            className="ml-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        {currentCard && (
          <div className="flex flex-col items-center gap-1">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Card {currentCardIndex + 1} / {cards.length} ({Math.round(((currentCardIndex + 1) / cards.length) * 100)}%)
            </div>
            <div className="w-64 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex gap-2">
            <Button 
              variant={view === 'cards' ? "default" : "outline"}
              onClick={() => setView('cards')}
              className="bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium rounded-full px-4 py-2 text-sm"
            >
              Learn
            </Button>
            <Button 
              variant={view === 'list' ? "default" : "outline"}
              onClick={() => setView('list')}
              className="bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium rounded-full px-4 py-2 text-sm"
            >
              Vocabulary
            </Button>
          </div>
          <FileUpload onCardsAdd={handleAddCards} />
        </div>
      </header>

      {view === 'cards' ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-xl">
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
                drag="x"
                dragElastic={0.18}
                onDragEnd={handleDragEnd}
                className="absolute w-full px-6 md:px-12 py-8 md:py-16"
              >
                {currentCard && (
                  <Card
                    card={currentCard}
                    reveal={reveal}
                    setReveal={setReveal}
                    reverse={reverse}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <DirectionToggle mode={mode} setMode={setMode} />
        </div>
      ) : (
        <VocabularyList cards={cards} />
      )}
    </div>
  );
}
