
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
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a Hebrew voice if available
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
      <p className="text-sm text-bordeaux/70 mb-1 font-medium uppercase tracking-wide text-center">{dir}</p>
      <h3 
        className="text-5xl md:text-6xl font-extrabold text-bordeaux text-center break-words" 
        onClick={() => setReveal(!reveal)}
      >
        {front}
      </h3>
      
      <button
        onClick={() => speakText(front)}
        className="mt-4 px-3 py-1 bg-bordeaux/10 hover:bg-bordeaux/20 rounded-full text-bordeaux transition-colors mx-auto block"
        aria-label="Listen to pronunciation"
      >
        🔊 Listen
      </button>
      
      {reveal ? (
        <div>
          <p 
            className="text-2xl text-bordeaux/80 mt-6 text-center break-words" 
            onClick={() => setReveal(false)}
          >
            {back}
          </p>
          <button
            onClick={() => speakText(back)}
            className="mt-2 px-3 py-1 bg-bordeaux/10 hover:bg-bordeaux/20 rounded-full text-bordeaux transition-colors mx-auto block"
            aria-label="Listen to translation pronunciation"
          >
            🔊 Listen to translation
          </button>
        </div>
      ) : (
        <p 
          className="text-bordeaux/60 mt-6 italic text-center" 
          onClick={() => setReveal(true)}
        >
          Tap to reveal
        </p>
      )}
    </div>
  );
}
