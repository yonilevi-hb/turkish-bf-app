
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Star } from 'lucide-react';

interface FlipCardProps {
  front: string;
  back: string;
  onFlip: (isRevealed: boolean) => void;
  id?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function FlipCard({ 
  front, 
  back, 
  onFlip, 
  id, 
  isFavorite = false,
  onToggleFavorite 
}: FlipCardProps) {
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
          duration: 0.6, 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-gray-600 transform-gpu">
            <h3 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-white">
              {front}
            </h3>
            
            {/* Show the favorite status directly on the front with a small indicator */}
            {id && isFavorite && (
              <div className="absolute top-3 left-3 h-4 w-4 rounded-full bg-yellow-400 animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Back of card */}
        <div 
          className="absolute w-full h-full backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-gray-600 transform-gpu">
            <p className="text-2xl md:text-3xl text-slate-800 dark:text-white font-medium">
              {back}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Favorites Star Button - Enhanced visibility and fixed color feedback */}
      {id && onToggleFavorite && (
        <button 
          className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-colors duration-300 ${
            isFavorite 
              ? 'bg-yellow-100/80 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-800/60 scale-110' 
              : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700'
          } shadow-sm`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star 
            size={24} 
            className={isFavorite 
              ? "fill-yellow-400 text-yellow-400 dark:text-yellow-400" 
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            } 
          />
        </button>
      )}

      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
      </div>
    </div>
  );
}
