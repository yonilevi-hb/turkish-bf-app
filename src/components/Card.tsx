
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FlipCard } from './FlipCard';
import { Volume2 } from 'lucide-react';
import { swipePower, SWIPE_THRESHOLD } from '@/utils/swipe';

interface CardProps {
  card: {
    word: string;
    translation: string;
    level?: number;
    id: string;
    isFavorite?: boolean;
  };
  reveal: boolean;
  setReveal: (reveal: boolean) => void;
  reverse: boolean;
  onSwipe: (direction: number) => void;
  onToggleFavorite?: () => void;
}

export function Card({ card, reveal, setReveal, reverse, onSwipe, onToggleFavorite }: CardProps) {
  const front = reverse ? card.translation : card.word;
  const back = reverse ? card.word : card.translation;
  const dir = reverse ? '🇬🇧→🇹🇷' : '🇹🇷→🇬🇧';
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<number | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    }

    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (!reverse) {
        const turkishVoice = availableVoices.find(voice => 
          voice.lang.includes('tr') || 
          voice.name.toLowerCase().includes('turkish')
        );
        
        if (turkishVoice) {
          console.log("Using Turkish voice:", turkishVoice.name);
          utterance.voice = turkishVoice;
          utterance.lang = 'tr-TR';
        } else {
          console.log("No Turkish voice found. Attempting to find a suitable alternative...");
          const alternativeVoice = availableVoices.find(voice => 
            voice.lang.includes('de') || voice.lang.includes('fr') || 
            voice.lang.includes('es') || voice.lang.includes('it')
          );
          
          if (alternativeVoice) {
            console.log("Using alternative voice for Turkish:", alternativeVoice.name);
            utterance.voice = alternativeVoice;
          } else {
            console.log("Using default voice with Turkish language setting");
          }
          
          utterance.lang = 'tr-TR';
        }
      } else {
        const englishVoice = availableVoices.find(voice => 
          voice.lang.includes('en-GB') || 
          voice.lang.includes('en-US')
        );
        
        if (englishVoice) {
          console.log("Using English voice:", englishVoice.name);
          utterance.voice = englishVoice;
          utterance.lang = englishVoice.lang;
        }
      }
      
      utterance.rate = 0.8;
      
      console.log(`Speaking "${text}" with voice ${utterance.voice?.name || 'default'} (${utterance.lang})`);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Improved drag end handler for better swipe detection
  const handleDragEnd = (e: any, info: any) => {
    // Calculate swipe power based on velocity and offset
    const swipe = swipePower(info.offset.x, info.velocity.x);
    const direction = info.offset.x > 0 ? 1 : -1;
    
    // Check if the swipe exceeds our threshold
    if (Math.abs(swipe) > SWIPE_THRESHOLD) {
      setSwipeDirection(direction);
      
      // Delay the onSwipe call to allow the animation to play
      setTimeout(() => {
        onSwipe(direction);
        setSwipeDirection(null);
      }, 300);
    }
  };

  return (
    <div className="select-none">
      <motion.div 
        className="flex justify-between items-center mb-4 md:mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium uppercase tracking-wide">
          {dir}
        </p>
        {card.level !== undefined && (
          <motion.div 
            className="flex gap-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                  i < card.level ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
      
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6} // Reduced elasticity for more natural feel
        onDragEnd={handleDragEnd}
        whileDrag={{ 
          scale: 1.02, 
          cursor: "grabbing",
          boxShadow: "0px 10px 25px rgba(0,0,0,0.1)" // Add shadow while dragging
        }}
        animate={
          swipeDirection !== null
            ? {
                x: swipeDirection > 0 ? 1000 : -1000, // Exit in the correct direction
                opacity: 0,
                rotate: swipeDirection > 0 ? 5 : -5, // Reduced rotation for more subtle effect
                transition: { 
                  duration: 0.4, 
                  ease: [0.32, 0.72, 0, 1] // Custom bezier curve for smoother easing
                }
              }
            : {
                x: 0,
                opacity: 1,
                rotate: 0,
                transition: {
                  type: "spring",
                  stiffness: 500, // Increased stiffness for faster snapping back
                  damping: 25, // Adjusted damping for natural movement
                }
              }
        }
        transition={{
          type: "spring",
          damping: 40,
          stiffness: 400,
        }}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <FlipCard 
          front={front} 
          back={back} 
          onFlip={setReveal}
          id={card.id}
          isFavorite={card.isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      </motion.div>
      
      <div className="mt-6 text-sm flex justify-center gap-3">
        <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-medium flex items-center">
          <span className="mr-1">👈</span> Swipe left: "I don't know"
        </span>
        <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium flex items-center">
          <span className="mr-1">👉</span> Swipe right: "I know this"
        </span>
      </div>
      
      <motion.button
        onClick={() => speakText(front)}
        className="mt-4 md:mt-6 px-6 py-2 md:px-8 md:py-3 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-500/30 transition-all mx-auto flex items-center justify-center gap-2 font-medium text-base md:text-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Volume2 size={20} />
        Listen
      </motion.button>
      
      {reveal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <motion.button
            onClick={() => speakText(back)}
            className="mt-2 md:mt-3 px-6 py-2 md:px-8 md:py-3 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-500/30 transition-all mx-auto flex items-center justify-center gap-2 font-medium text-base md:text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Volume2 size={20} />
            Listen to Translation
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
