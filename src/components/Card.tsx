import { motion } from 'framer-motion';

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
      <div className="flex justify-between items-center mb-6">
        <motion.p 
          className="text-sm text-indigo-300 font-medium uppercase tracking-wide"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {dir}
        </motion.p>
        {card.level !== undefined && (
          <motion.div 
            className="flex gap-1.5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < card.level ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      <motion.h3 
        className="text-5xl md:text-6xl font-bold text-white text-center break-words"
        onClick={() => setReveal(!reveal)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {front}
      </motion.h3>
      
      <motion.button
        onClick={() => speakText(front)}
        className="mt-6 px-8 py-3 bg-bordeaux hover:bg-bordeaux/80 rounded-full text-white transition-colors mx-auto block font-medium backdrop-blur-sm border border-white/20 text-lg hover:scale-105"
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
            className="text-2xl text-slate-300 mt-8 text-center break-words"
            onClick={() => setReveal(false)}
            whileHover={{ scale: 1.02 }}
          >
            {back}
          </motion.p>
          <motion.button
            onClick={() => speakText(back)}
            className="mt-3 px-8 py-3 bg-bordeaux hover:bg-bordeaux/80 rounded-full text-white transition-colors mx-auto block font-medium backdrop-blur-sm border border-white/20 text-lg hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔊 Listen to translation
          </motion.button>
        </motion.div>
      ) : (
        <motion.p 
          className="text-white/80 mt-8 text-center text-lg"
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
