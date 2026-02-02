// Helper to normalize angle
export const normalizeAngle = (angle: number) => {
  let a = angle % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a;
};

// Distance formula
export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};