
// Even lower threshold makes swipes more responsive
export const SWIPE_THRESHOLD = 10; // Further reduced for much more responsive swipes

// Improved swipe power calculation for more natural feeling
export const swipePower = (offset: number, velocity: number): number => {
  // We increase the multiplier to make swipes feel more responsive
  return Math.abs(offset) * Math.max(2.0, velocity); // Increased minimum velocity factor
};
