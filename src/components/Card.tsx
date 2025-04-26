import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
          console.log("No Turkish voice found, using default");
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
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="select-none cursor-grab active:cursor-grabbing">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <motion.p 
          className="text-xs md:text-sm text-indigo-300 font-medium uppercase tracking-wide"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {dir}
        </motion.p>
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
                  i < card.level ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      <motion.h3 
        className="text-3xl md:text-6xl font-bold text-white text-center break-words"
        onClick={() => setReveal(!reveal)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {front}
      </motion.h3>
      
      <motion.button
        onClick={() => speakText(front)}
        className="mt-4 md:mt-6 px-6 py-2 md:px-8 md:py-3 bg-bordeaux hover:bg-bordeaux/80 rounded-full text-white transition-colors mx-auto block font-medium backdrop-blur-sm border border-white/20 text-base md:text-lg hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🔊 Listen
      </motion.button>
      
      {reveal ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 mt-6 md:mt-8 text-center break-words"
            onClick={() => setReveal(false)}
            whileHover={{ scale: 1.02 }}
          >
            {back}
          </motion.p>
          <motion.button
            onClick={() => speakText(back)}
            className="mt-2 md:mt-3 px-6 py-2 md:px-8 md:py-3 bg-bordeaux hover:bg-bordeaux/80 rounded-full text-white transition-colors mx-auto block font-medium backdrop-blur-sm border border-white/20 text-base md:text-lg hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔊 Listen to translation
          </motion.button>
        </motion.div>
      ) : (
        <motion.p 
          className="text-white/80 mt-6 md:mt-8 text-center text-base md:text-lg"
          onClick={() => setReveal(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
        >
          Tap to reveal
        </motion.p>
      )}
    </div>
  );
}
