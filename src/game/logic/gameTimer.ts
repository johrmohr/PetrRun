/**
 * Utility functions for game timer management
 */
export class GameTimer {
  /**
   * Formats timer milliseconds to seconds with 2 decimal places
   */
  static formatTime(milliseconds: number): string {
    return (milliseconds / 1000).toFixed(2);
  }

  /**
   * Creates a timer update function that calculates elapsed time
   */
  static createTimerUpdater(startTime: number) {
    return () => Date.now() - startTime;
  }

  /**
   * Timer update interval in milliseconds
   */
  static readonly UPDATE_INTERVAL = 100;
}
