import type { Dropsite } from "../utils/types";
import { GameTimer } from "../game/logic/gameTimer";

interface ResultsPhaseUIProps {
  currentDropsite: Dropsite;
  timer: number;
  onRestart: () => void;
}

export default function ResultsPhaseUI({
  currentDropsite,
  timer,
  onRestart,
}: ResultsPhaseUIProps) {
  return (
    <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-95 p-8 rounded-lg shadow-xl text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🏆 Results</h2>
      <p className="mb-2 text-lg">
        <strong className="text-blue-600">{currentDropsite.name}</strong>
      </p>
      <p className="mb-2 text-2xl font-mono font-bold text-green-600">
        Time: {GameTimer.formatTime(timer)}s
      </p>
      <p className="text-sm text-gray-600 mb-6 bg-gray-100 px-3 py-1 rounded">
        Difficulty: {currentDropsite.difficulty}
      </p>
      <button
        onClick={onRestart}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
      >
        🎮 Play Again
      </button>
    </div>
  );
}
