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
  
  // Initialize cards with learning metadata
  const [cards, setCards] = useState(() => 
    initialCards.map(card => ({
      ...card,
      level: 0,
      nextReview: Date.now()
    }))
  );
  
  const [currentCard, setCurrentCard] = useState(() => getNextCard(cards));

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
    const isRight = direction > 0;
    
    // Update card's spaced repetition data
    const updatedCard = handleSwipe(currentCard, isRight);
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    );
    
    // Show feedback
    toast(isRight ? "Good job! You'll see this card less often." : "Keep practicing! You'll see this card more frequently.");
    
    // Set next card
    setCurrentCard(null); // This will trigger the useEffect to find the next card
  };

  const handleDragEnd = (_e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -SWIPE_THRESHOLD) handleCardSwipe(1);
    else if (swipe > SWIPE_THRESHOLD) handleCardSwipe(-1);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 })
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-12 bg-gradient-to-br from-bordeaux/5 via-bordeaux/10 to-bordeaux/5 text-bordeaux p-8">
      {/* Header */}
      <header className="flex flex-col items-center gap-6 w-full max-w-4xl">
        <div className="flex items-center gap-4">
          <img
            src="https://img.icons8.com/fluency/96/language-skill.png"
            alt="logo"
            className="w-20 h-20 drop-shadow-lg"
          />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-bordeaux to-bordeaux/70">
            Yoni's Language App
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <DirectionToggle mode={mode} setMode={setMode} />
          <div className="flex gap-2">
            <Button 
              variant={view === 'cards' ? "default" : "outline"}
              onClick={() => setView('cards')}
              className="bg-bordeaux/80 hover:bg-bordeaux text-eggwhite"
            >
              Flashcards
            </Button>
            <Button 
              variant={view === 'list' ? "default" : "outline"}
              onClick={() => setView('list')}
              className="bg-bordeaux/80 hover:bg-bordeaux text-eggwhite"
            >
              Vocabulary List
            </Button>
          </div>
          <FileUpload onCardsAdd={handleAddCards} />
        </div>
      </header>

      {/* Main Content */}
      {view === 'cards' ? (
        <div className="relative w-full max-w-xl h-96 flex items-center justify-center touch-pan-y">
          <AnimatePresence custom={dir} initial={false} mode="wait">
            <motion.div
              key={currentCard?.id + (reverse ? 'reverse' : 'normal')}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              drag="x"
              dragElastic={0.18}
              onDragEnd={handleDragEnd}
              className="absolute w-full h-auto px-12 py-16 bg-eggwhite/5 backdrop-blur-sm border border-eggwhite/10 rounded-3xl shadow-2xl"
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
            aria-label="Previous"
            onClick={() => handleCardSwipe(-1)}
            className="absolute left-4 md:left-8 text-bordeaux/50 hover:text-bordeaux transition text-4xl md:text-5xl font-light select-none"
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={() => handleCardSwipe(1)}
            className="absolute right-4 md:right-8 text-bordeaux/50 hover:text-bordeaux transition text-4xl md:text-5xl font-light select-none"
          >
            ›
          </button>
        </div>
      ) : (
        <VocabularyList cards={cards} />
      )}
    </div>
  );
}
