/**
 * Calculates the Euclidean distance between two points
 */
export const calculateDistance = (
  point1: [number, number],
  point2: [number, number]
): number => {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
  );
};

/**
 * Checks if a player position is within the drop radius of a target location
 */
export const isWithinDropRadius = (
  playerPosition: [number, number],
  targetLocation: [number, number],
  radius: number
): boolean => {
  const distance = calculateDistance(playerPosition, targetLocation);
  return distance < radius;
};
