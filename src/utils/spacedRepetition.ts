
interface CardWithLevel {
  id: string;
  word: string;
  translation: string;
  level: number;  // 0-5, where 0 means show frequently, 5 means show rarely
  nextReview: number;  // timestamp for next review
}

export const calculateNextReview = (level: number): number => {
  // Exponential backoff for spacing (in hours)
  const intervals = [1, 3, 8, 24, 72, 168]; // 1h, 3h, 8h, 1d, 3d, 1w
  const interval = intervals[level] || intervals[intervals.length - 1];
  return Date.now() + (interval * 60 * 60 * 1000);
};

export const handleSwipe = (
  card: CardWithLevel,
  isRight: boolean
): CardWithLevel => {
  let newLevel = card.level;
  
  if (isRight) {
    // Correct answer - increase level (show less frequently)
    newLevel = Math.min(5, card.level + 1);
  } else {
    // Incorrect answer - decrease level (show more frequently)
    newLevel = Math.max(0, card.level - 1);
  }
  
  return {
    ...card,
    level: newLevel,
    nextReview: calculateNextReview(newLevel)
  };
};

export const getNextCard = (cards: CardWithLevel[]): CardWithLevel | null => {
  const now = Date.now();
  // Filter cards that are due for review
  const dueCards = cards.filter(card => card.nextReview <= now);
  
  if (dueCards.length === 0) return null;
  
  // Prioritize cards with lower levels (need more practice)
  const sortedCards = dueCards.sort((a, b) => a.level - b.level);
  return sortedCards[0];
};

