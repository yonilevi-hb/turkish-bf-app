
export const SWIPE_THRESHOLD = 10000;

export const swipePower = (offset: number, velocity: number): number => {
  return Math.abs(offset) * velocity;
};
