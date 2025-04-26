
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

export default function Index() {
  const [reveal, setReveal] = useState(false);
  const [mode, setMode] = useState('he_en');
  const [reverse, setReverse] = useState(false);
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [showFeedback, setShowFeedback] = useState(true);
  
  // Initialize cards with learning metadata
  const [cards, setCards] = useState(() => 
    initialCards.map(card => ({
      ...card,
      level: 0,
      nextReview: Date.now()
    }))
  );
  
  const [currentCard, setCurrentCard] = useState(() => getNextCard(cards));

  // Handle file uploads
  const handleAddCards = (newCards: any[]) => {
    const cardsWithMetadata = newCards.map(card => ({
      ...card,
      level: 0,
      nextReview: Date.now()
    }));
    
    setCards(prevCards => [...prevCards, ...cardsWithMetadata]);
    toast(`Added ${newCards.length} new cards!`);
  };

  // Effect to update current card when needed
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

  // Effect to handle direction mode
  useEffect(() => {
    if (mode === 'he_en') {
      setReverse(false);
    } else if (mode === 'en_he') {
      setReverse(true);
    } else if (mode === 'random') {
      setReverse(Math.random() > 0.5);
    }
  }, [mode, currentCard]);

  const handleCardSwipe = (direction: number) => {
    if (!currentCard) return;
    
    setReveal(false);
    // FIXED: Swapped the logic - left (negative) now means "don't know" (more frequent)
    const isRight = direction > 0;
    
    // Update card's spaced repetition data
    const updatedCard = handleSwipe(currentCard, !isRight); // Inverting logic here
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    );
    
    // Only show feedback occasionally
    if (showFeedback) {
      toast(!isRight ? "Good job! You'll see this card less often." : "Keep practicing! You'll see this card more frequently.");
      setShowFeedback(false);
      // Reset feedback flag after some time
      setTimeout(() => setShowFeedback(true), 60000);
    }
    
    // Set next card
    setCurrentCard(null); // This will trigger the useEffect to find the next card
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 p-8 font-['Inter']">
      {/* Header */}
      <header className="flex flex-col items-center gap-6 w-full max-w-4xl">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <img
              src="https://img.icons8.com/fluency/96/language-skill.png"
              alt="logo"
              className="w-12 h-12 filter drop-shadow"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Polyglot
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex gap-2">
            <Button 
              variant={view === 'cards' ? "default" : "outline"}
              onClick={() => setView('cards')}
              className="bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium rounded-full px-6"
            >
              Learn
            </Button>
            <Button 
              variant={view === 'list' ? "default" : "outline"}
              onClick={() => setView('list')}
              className="bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium rounded-full px-6"
            >
              Vocabulary List
            </Button>
          </div>
          <FileUpload onCardsAdd={handleAddCards} />
        </div>
      </header>

      {/* Main Content */}
      {view === 'cards' ? (
        <div className="flex flex-col items-center gap-8 w-full max-w-xl">
          <div className="relative w-full h-96 flex items-center justify-center touch-pan-y">
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
                className="absolute w-full h-auto px-12 py-16 bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl"
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

            <button
              aria-label="Don't Know"
              onClick={() => handleCardSwipe(-1)}
              className="absolute left-4 md:left-8 text-red-400/80 hover:text-red-400 transition text-4xl md:text-5xl font-light select-none bg-slate-800/40 backdrop-blur-sm h-12 w-12 rounded-full flex items-center justify-center"
            >
              ✗
            </button>
            <button
              aria-label="Know"
              onClick={() => handleCardSwipe(1)}
              className="absolute right-4 md:right-8 text-emerald-400/80 hover:text-emerald-400 transition text-4xl md:text-5xl font-light select-none bg-slate-800/40 backdrop-blur-sm h-12 w-12 rounded-full flex items-center justify-center"
            >
              ✓
            </button>
          </div>
          
          {/* Language toggle moved to bottom */}
          <DirectionToggle mode={mode} setMode={setMode} />
        </div>
      ) : (
        <VocabularyList cards={cards} />
      )}
    </div>
  );
}
