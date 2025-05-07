
// Lower threshold makes swipes more responsive
export const SWIPE_THRESHOLD = 20; // Further reduced for even more responsive swipes

// Improved swipe power calculation for more natural feeling
export const swipePower = (offset: number, velocity: number): number => {
  // We increase the multiplier to make swipes feel more responsive
  return Math.abs(offset) * Math.max(1.5, velocity); // Added minimum velocity factor
};
