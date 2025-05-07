
import { motion } from 'framer-motion';
import { useState } from 'react';

interface FlipCardProps {
  front: string;
  back: string;
  onFlip: (isRevealed: boolean) => void;
}

export function FlipCard({ front, back, onFlip }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip(!isFlipped);
  };

  return (
    <div 
      className="relative w-full h-[250px] cursor-pointer perspective-1000" 
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.5, 
          type: "spring", 
          stiffness: 350, 
          damping: 25 
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-gray-600">
            <h3 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-slate-100">
              {front}
            </h3>
          </div>
        </div>

        {/* Back of card */}
        <div 
          className="absolute w-full h-full backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-gray-600">
            <p className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-medium">
              {back}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
      </div>
    </div>
  );
}
