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

  return (
    <div className="select-none cursor-grab active:cursor-grabbing">
      <p className="text-sm text-indigo-200 mb-1 font-medium uppercase tracking-wide text-center">{dir}</p>
      <h3 
        className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent text-center break-words" 
        onClick={() => setReveal(!reveal)}
      >
        {front}
      </h3>
      {reveal ? (
        <p 
          className="text-2xl text-indigo-200 mt-6 text-center break-words" 
          onClick={() => setReveal(false)}
        >
          {back}
        </p>
      ) : (
        <p 
          className="text-indigo-300/60 mt-6 italic text-center" 
          onClick={() => setReveal(true)}
        >
          Tap to reveal
        </p>
      )}
    </div>
  );
}
