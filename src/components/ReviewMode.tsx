
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Play, Pause, Volume2, RotateCw } from 'lucide-react';

interface ReviewCard {
  id: string;
  word: string;
  translation: string;
  level?: number;
}

interface ReviewModeProps {
  cards: ReviewCard[];
  onExit: () => void;
  autoPlaySpeed?: number;
}

export function ReviewMode({ cards, onExit, autoPlaySpeed = 4000 }: ReviewModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    }

    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    let timer: number | null = null;
    
    if (isAutoPlaying) {
      timer = window.setTimeout(() => {
        if (isFlipped) {
          goToNext();
        } else {
          setIsFlipped(true);
          speakText(currentCard.translation);
        }
      }, autoPlaySpeed);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAutoPlaying, currentIndex, isFlipped, currentCard]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Loop back to the start
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      speakText(currentCard.translation);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (!isFlipped) {
        const turkishVoice = availableVoices.find(voice => 
          voice.lang.includes('tr') || 
          voice.name.toLowerCase().includes('turkish')
        );
        
        if (turkishVoice) {
          utterance.voice = turkishVoice;
          utterance.lang = 'tr-TR';
        } else {
          utterance.lang = 'tr-TR';
        }
      } else {
        const englishVoice = availableVoices.find(voice => 
          voice.lang.includes('en-GB') || 
          voice.lang.includes('en-US')
        );
        
        if (englishVoice) {
          utterance.voice = englishVoice;
          utterance.lang = englishVoice.lang;
        }
      }
      
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    if (!isAutoPlaying && !isFlipped) {
      speakText(currentCard.word);
    }
  };

  const resetReview = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsAutoPlaying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100dvh-160px)] flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={onExit} className="text-slate-600 dark:text-slate-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Review Mode</h2>
        <Button variant="ghost" onClick={resetReview} className="text-slate-600 dark:text-slate-300">
          <RotateCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="bg-slate-200 dark:bg-slate-700 h-1 rounded-full w-full overflow-hidden mb-2">
            <motion.div 
              className="h-full bg-indigo-500"
              initial={{ width: `${(currentIndex / cards.length) * 100}%` }}
              animate={{ width: `${(currentIndex / cards.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}% complete</span>
          </div>
        </div>
      
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${currentIndex}-${isFlipped ? 'flipped' : 'front'}`}
            initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md h-60 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 mb-8"
            onClick={toggleFlip}
          >
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
              {isFlipped ? "English" : "Turkish"}
            </p>
            <h3 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">
              {isFlipped ? currentCard.translation : currentCard.word}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-4">
              {isFlipped ? "Tap to see Turkish" : "Tap to see translation"}
            </p>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          <Button 
            variant="outline" 
            onClick={() => speakText(isFlipped ? currentCard.translation : currentCard.word)}
            className="flex items-center gap-2"
          >
            <Volume2 size={16} />
            Listen
          </Button>
          
          <Button
            variant={isAutoPlaying ? "default" : "outline"}
            onClick={toggleAutoPlay}
            className={isAutoPlaying ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {isAutoPlaying ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
            {isAutoPlaying ? "Pause" : "Auto Play"}
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={goToPrevious} 
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <Button onClick={goToNext}>
          {currentIndex < cards.length - 1 ? "Next" : "Start Over"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
