
// Lower threshold makes swipes more responsive
export const SWIPE_THRESHOLD = 50; // Significantly reduced from 7000 for better responsiveness

// Improved swipe power calculation for more natural feeling
export const swipePower = (offset: number, velocity: number): number => {
  return Math.abs(offset) * velocity; // Removed additional factor for more direct control
};
