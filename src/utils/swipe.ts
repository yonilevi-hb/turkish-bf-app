
export const SWIPE_THRESHOLD = 7000; // Reduced from 10000 for better sensitivity

export const swipePower = (offset: number, velocity: number): number => {
  return Math.abs(offset) * Math.abs(velocity) * 0.8; // Added factor for better control
};
