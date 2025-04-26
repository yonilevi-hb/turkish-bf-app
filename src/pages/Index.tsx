
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/Card';
import { DirectionToggle } from '@/components/DirectionToggle';
import { initialCards } from '@/data/cards';

// Swipe helpers
const SWIPE_THRESHOLD = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

export default function Index() {
  const [[index, dir], setIndex] = useState([0, 0]);
  const [reveal, setReveal] = useState(false);
  const [mode, setMode] = useState('random');
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    setReverse(mode === 'he_en' ? false : mode === 'en_he' ? true : Math.random() > 0.5);
  }, [index, mode]);

  const paginate = (d: number) => {
    setReveal(false);
    setIndex(([i]) => [(i + d + initialCards.length) % initialCards.length, d]);
  };

  const handleDragEnd = (_e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -SWIPE_THRESHOLD) paginate(1);
    else if (swipe > SWIPE_THRESHOLD) paginate(-1);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 })
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-12 bg-gray-950 text-white p-8">
      {/* Header */}
      <header className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <img
            src="https://img.icons8.com/fluency/96/language-skill.png"
            alt="logo"
            className="w-20 h-20 drop-shadow-lg"
          />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Yoni's Language App
          </h1>
        </div>
        <DirectionToggle mode={mode} setMode={setMode} />
      </header>

      {/* Card area */}
      <div className="relative w-full max-w-xl h-96 flex items-center justify-center touch-pan-y">
        {/* Swipeable card */}
        <AnimatePresence custom={dir} initial={false} mode="wait">
          <motion.div
            key={initialCards[index].id + reverse}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            drag="x"
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
            className="absolute w-full h-auto px-12 py-16 bg-gray-800/90 border border-gray-700 rounded-3xl shadow-2xl"
          >
            <Card
              card={initialCards[index]}
              reveal={reveal}
              setReveal={setReveal}
              reverse={reverse}
            />
          </motion.div>
        </AnimatePresence>

        {/* CTA Arrows */}
        <button
          aria-label="Previous"
          onClick={() => paginate(-1)}
          className="absolute left-4 md:left-8 text-gray-400 hover:text-white transition text-4xl md:text-5xl font-light select-none"
        >
          ‹
        </button>
        <button
          aria-label="Next"
          onClick={() => paginate(1)}
          className="absolute right-4 md:right-8 text-gray-400 hover:text-white transition text-4xl md:text-5xl font-light select-none"
        >
          ›
        </button>
      </div>
    </div>
  );
}
