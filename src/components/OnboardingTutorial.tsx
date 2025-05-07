
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight, Repeat, Volume2 } from 'lucide-react';

const tutorialSteps = [
  {
    title: "Welcome to Turkish BF",
    description: "Let's learn how to use this app to master Turkish vocabulary",
    image: "swipe"
  },
  {
    title: "Swipe Cards",
    description: "Swipe right if you know the word, left if you don't.",
    image: "swipe"
  },
  {
    title: "Flip Cards",
    description: "Tap any card to flip it and reveal the translation.",
    image: "flip"
  },
  {
    title: "Listen to Pronunciation",
    description: "Use the sound button to hear correct pronunciation.",
    image: "sound"
  },
  {
    title: "Track Your Progress",
    description: "See how many words you've mastered over time.",
    image: "progress"
  }
];

export function OnboardingTutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [seen, setSeen] = useState(() => {
    return localStorage.getItem('tutorial-seen') === 'true';
  });

  useEffect(() => {
    if (seen) {
      onComplete();
    }
  }, [seen, onComplete]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('tutorial-seen', 'true');
    setSeen(true);
    onComplete();
  };

  const renderStepImage = (image: string) => {
    switch (image) {
      case 'swipe':
        return (
          <div className="relative w-full h-32 my-4 flex items-center justify-center">
            <motion.div
              animate={{
                x: [0, 50, 100],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              className="absolute w-16 h-24 rounded-lg border-2 border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 flex items-center justify-center"
            >
              <ArrowRight className="text-blue-400" />
            </motion.div>
          </div>
        );
      case 'flip':
        return (
          <div className="relative w-full h-32 my-4 flex items-center justify-center">
            <motion.div
              animate={{ rotateY: [0, 180] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="w-16 h-24 rounded-lg border-2 border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700 flex items-center justify-center"
            >
              <Repeat className="text-indigo-400" />
            </motion.div>
          </div>
        );
      case 'sound':
        return (
          <div className="relative w-full h-32 my-4 flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              className="w-16 h-24 rounded-lg border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-700 flex items-center justify-center"
            >
              <Volume2 className="text-emerald-400" />
            </motion.div>
          </div>
        );
      case 'progress':
        return (
          <div className="relative w-full h-32 my-4 flex items-center justify-center flex-col gap-2">
            <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: "65%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">65% Mastered</div>
          </div>
        );
      default:
        return null;
    }
  };

  if (seen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6 pb-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {tutorialSteps[currentStep].title}
              </h2>
              <button 
                onClick={handleComplete}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {renderStepImage(tutorialSteps[currentStep].image)}
            
            <p className="text-slate-600 dark:text-slate-300 text-center my-4">
              {tutorialSteps[currentStep].description}
            </p>
          </div>
          
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={currentStep === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentStep === index 
                    ? "bg-blue-500" 
                    : "bg-blue-200 dark:bg-blue-800"
                  }`}
                />
              ))}
            </div>
            
            <Button onClick={handleNext} variant="default">
              {currentStep < tutorialSteps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
