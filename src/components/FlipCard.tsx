
import { motion } from 'framer-motion';
import { useState } from 'react';

interface FlipCardProps {
  front: string;
  back: string;
  onFlip: (isRevealed: boolean) => void;
  image?: string;
}

export function FlipCard({ front, back, onFlip, image }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip(!isFlipped);
  };

  return (
    <div 
      className="relative w-full h-[200px] cursor-pointer perspective-1000" 
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full flex items-center justify-center bg-white dark:bg-cardBg-dark rounded-xl shadow-lg p-6 border border-black dark:border-gray-600">
            <h3 className="text-3xl md:text-6xl font-bold text-black dark:text-white">
              {front}
            </h3>
          </div>
        </div>

        {/* Back of card */}
        <div 
          className="absolute w-full h-full backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-cardBg-dark rounded-xl shadow-lg p-6 border border-black dark:border-gray-600">
            {image && (
              <div className="w-full h-24 mb-4 overflow-hidden rounded-lg">
                <img 
                  src={image} 
                  alt={back} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-xl md:text-2xl text-black dark:text-white">
              {back}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
