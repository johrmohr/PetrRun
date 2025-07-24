import type { GamePhase } from "../types";

/**
 * Handles phase transitions based on game state
 */
export class GamePhaseManager {
  /**
   * Determines the next phase based on current conditions
   */
  static getNextPhase(
    currentPhase: GamePhase,
    hasPlayerPosition: boolean,
    countdownValue: number,
    isVictorious: boolean
  ): GamePhase {
    switch (currentPhase) {
      case "start":
        return hasPlayerPosition ? "countdown" : "start";
      case "countdown":
        return countdownValue <= 0 ? "playing" : "countdown";
      case "playing":
        return isVictorious ? "victory" : "playing";
      case "victory":
        return "results"; // This happens after a delay
      case "results":
        return "start"; // This happens on restart
      default:
        return currentPhase;
    }
  }

  /**
   * Checks if the game phase allows player movement
   */
  static canPlayerMove(phase: GamePhase): boolean {
    return phase === "playing";
  }

  /**
   * Checks if the game phase allows map clicks
   */
  static canClickMap(phase: GamePhase): boolean {
    return phase === "start";
  }
}
