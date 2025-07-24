import type { Dropsite } from "../utils/types";
import { GameTimer } from "../game/logic/gameTimer";

interface PlayingPhaseUIProps {
  currentDropsite: Dropsite;
  timer: number;
}

export default function PlayingPhaseUI({
  currentDropsite,
  timer,
}: PlayingPhaseUIProps) {
  return (
    <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-95 p-6 rounded-lg shadow-xl text-center">
      <div className="flex items-center gap-6">
        {/* Photo on the left */}
        <div className="flex-shrink-0">
          <h3 className="text-lg font-bold mb-2 text-gray-800">
            Find this location!
          </h3>
          <img
            src={currentDropsite.photo}
            alt="Drop site"
            className="w-48 h-48 object-contain rounded-lg shadow-md"
          />
          <p className="text-sm text-gray-600 mt-2">
            {currentDropsite.description}
          </p>
          <p className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded">
            Difficulty: {currentDropsite.difficulty}
          </p>
        </div>
        {/* Timer and info on the right */}
        <div className="flex flex-col items-center">
          <div className="text-3xl font-mono font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            {GameTimer.formatTime(timer)}s
          </div>
          <p className="text-sm text-gray-600 mt-2">Use WASD to move</p>
          <p className="text-xs text-gray-500 mt-1">Find the drop location!</p>
        </div>
      </div>
    </div>
  );
}
