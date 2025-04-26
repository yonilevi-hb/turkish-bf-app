
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FlipCard } from './FlipCard';

interface CardProps {
  card: {
    word: string;
    translation: string;
    level?: number;
  };
  reveal: boolean;
  setReveal: (reveal: boolean) => void;
  reverse: boolean;
}

export function Card({ card, reveal, setReveal, reverse }: CardProps) {
  const front = reverse ? card.translation : card.word;
  const back = reverse ? card.word : card.translation;
  const dir = reverse ? '🇬🇧→🇹🇷' : '🇹🇷→🇬🇧';
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

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
      
      utterance.rate = 0.5;
      
      console.log(`Speaking "${text}" with voice ${utterance.voice?.name || 'default'} (${utterance.lang})`);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="select-none cursor-grab active:cursor-grabbing">
      <motion.div 
        className="flex justify-between items-center mb-4 md:mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs md:text-sm text-slate-900 dark:text-white font-medium uppercase tracking-wide">
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
      
      <FlipCard 
        front={front} 
        back={back} 
        onFlip={setReveal}
      />
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center italic">
        Swipe right if known, left if unknown
      </div>
      
      <motion.button
        onClick={() => speakText(front)}
        className="mt-4 md:mt-6 px-6 py-2 md:px-8 md:py-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors mx-auto block font-medium text-base md:text-lg hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🔊 Listen
      </motion.button>
      
      {reveal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <motion.button
            onClick={() => speakText(back)}
            className="mt-2 md:mt-3 px-6 py-2 md:px-8 md:py-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors mx-auto block font-medium text-base md:text-lg hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔊 Listen to translation
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
