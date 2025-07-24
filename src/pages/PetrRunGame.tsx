import { useGameController } from "@/game/gameController";
import InteractiveMap from "@/game/components/InteractiveMap";
import ImageLoader from "@/ui/ImageLoader";
import StartPhaseUI from "@/ui/StartPhaseUI";
import CountdownPhaseUI from "@/ui/CountdownPhaseUI";
import PlayingPhaseUI from "@/ui/PlayingPhaseUI";
import VictoryPhaseUI from "@/ui/VictoryPhaseUI";
import ResultsPhaseUI from "@/ui/ResultsPhaseUI";

type GamePhaseUIProps = {
  phase: ReturnType<typeof useGameController>["phase"];
  countdown: ReturnType<typeof useGameController>["countdown"];
  currentDropsite: ReturnType<typeof useGameController>["currentDropsite"];
  timer: ReturnType<typeof useGameController>["timer"];
  onRestart: ReturnType<typeof useGameController>["handleRestart"];
};

const GamePhaseUI = ({
  phase,
  countdown,
  currentDropsite,
  timer,
  onRestart,
}: GamePhaseUIProps) => {
  switch (phase) {
    case "start":
      return <StartPhaseUI />;
    case "countdown":
      return <CountdownPhaseUI countdown={countdown} />;
    case "playing":
      return <PlayingPhaseUI currentDropsite={currentDropsite} timer={timer} />;
    case "victory":
      return <VictoryPhaseUI />;
    case "results":
      return (
        <ResultsPhaseUI
          currentDropsite={currentDropsite}
          timer={timer}
          onRestart={onRestart}
        />
      );
    default:
      return null;
  }
};

export default function PetrRunGame() {
  const {
    phase,
    playerPos,
    currentDropsite,
    timer,
    countdown,
    handleMapClick,
    handlePlayerMove,
    handleRestart,
  } = useGameController();

  return (
    <ImageLoader imageSrc="/UCI_map.png">
      {(imageDimensions) => (
        <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-100">
          {/* Phase-specific UI */}
          <GamePhaseUI
            phase={phase}
            countdown={countdown}
            currentDropsite={currentDropsite}
            timer={timer}
            onRestart={handleRestart}
          />

          {/* Interactive Map - always visible */}
          <div className="w-full h-full">
            <InteractiveMap
              playerPosition={playerPos || undefined}
              imageDimensions={imageDimensions}
              markers={
                phase !== "start"
                  ? [
                      {
                        position: currentDropsite.location,
                        popup: `${currentDropsite.name} - Petr Drop!`,
                        color: "#ffa500",
                      },
                    ]
                  : []
              }
              onMapClick={handleMapClick}
              onPlayerMove={handlePlayerMove}
            />
          </div>
        </div>
      )}
    </ImageLoader>
  );
}
