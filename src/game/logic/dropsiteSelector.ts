import { DROPSITES } from "../../utils/constants";
import type { Dropsite } from "../../utils/types";

/**
 * Selects a random dropsite from the available dropsites
 */
export const selectRandomDropsite = (): Dropsite => {
  const randomIndex = Math.floor(Math.random() * DROPSITES.length);
  return DROPSITES[randomIndex];
};
