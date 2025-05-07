
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ProgressStatsProps {
  totalCards: number;
  knownCards: number;
  unknownCards: number;
}

export function ProgressStats({ totalCards, knownCards, unknownCards }: ProgressStatsProps) {
  const knownPercentage = totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 0;
  const unknownPercentage = totalCards > 0 ? Math.round((unknownCards / totalCards) * 100) : 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
    >
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">Your Progress</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Known</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{knownCards} cards ({knownPercentage}%)</span>
          </div>
          <Progress value={knownPercentage} className="h-2 bg-slate-200 dark:bg-slate-700">
            <div className="h-full bg-emerald-500" style={{ width: `${knownPercentage}%` }} />
          </Progress>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Unknown</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{unknownCards} cards ({unknownPercentage}%)</span>
          </div>
          <Progress value={unknownPercentage} className="h-2 bg-slate-200 dark:bg-slate-700">
            <div className="h-full bg-amber-500" style={{ width: `${unknownPercentage}%` }} />
          </Progress>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Total reviewed</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{knownCards + unknownCards} / {totalCards} cards</span>
          </div>
          <Progress 
            value={totalCards > 0 ? ((knownCards + unknownCards) / totalCards) * 100 : 0} 
            className="h-2 bg-slate-200 dark:bg-slate-700"
          />
        </div>
      </div>
    </motion.div>
  );
}
