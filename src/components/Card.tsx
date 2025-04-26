
import { motion } from 'framer-motion';

interface CardProps {
  card: {
    word: string;
    translation: string;
  };
  reveal: boolean;
  setReveal: (reveal: boolean) => void;
  reverse: boolean;
}

export function Card({ card, reveal, setReveal, reverse }: CardProps) {
  const front = reverse ? card.translation : card.word;
  const back = reverse ? card.word : card.translation;
  const dir = reverse ? '🇺🇸→🇮🇱' : '🇮🇱→🇺🇸';

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(voice => voice.lang.includes('he'));
      
      if (hebrewVoice && !reverse) {
        utterance.voice = hebrewVoice;
        utterance.lang = 'he-IL';
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="select-none cursor-grab active:cursor-grabbing">
      <motion.p 
        className="text-sm text-bordeaux/70 mb-1 font-medium uppercase tracking-wide text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {dir}
      </motion.p>
      <motion.h3 
        className="text-5xl md:text-6xl font-extrabold text-bordeaux text-center break-words"
        onClick={() => setReveal(!reveal)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {front}
      </motion.h3>
      
      <motion.button
        onClick={() => speakText(front)}
        className="mt-4 px-4 py-2 bg-bordeaux/10 hover:bg-bordeaux/20 rounded-full text-bordeaux transition-colors mx-auto block font-medium backdrop-blur-sm border border-bordeaux/10"
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
            className="text-2xl text-bordeaux/80 mt-6 text-center break-words"
            onClick={() => setReveal(false)}
            whileHover={{ scale: 1.02 }}
          >
            {back}
          </motion.p>
          <motion.button
            onClick={() => speakText(back)}
            className="mt-2 px-4 py-2 bg-bordeaux/10 hover:bg-bordeaux/20 rounded-full text-bordeaux transition-colors mx-auto block font-medium backdrop-blur-sm border border-bordeaux/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔊 Listen to translation
          </motion.button>
        </motion.div>
      ) : (
        <motion.p 
          className="text-bordeaux/60 mt-6 italic text-center"
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
