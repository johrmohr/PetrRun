import React, { useState, useCallback } from "react";
import GameMapAdapter from "@/game/components/GameMapAdapter";
import { GAME_CONFIG, SAMPLE_GAME_DATA } from "../utils/constants";
import type { GameMarker, Player } from "../utils/types";

const GameDemo: React.FC = () => {
  const [player, setPlayer] = useState<Player>({
    position: GAME_CONFIG.MAP.DEFAULT_CENTER,
    health: 100,
    score: 0,
    inventory: [],
    level: 1,
  });

  const [gameMarkers, setGameMarkers] = useState<GameMarker[]>([
    ...SAMPLE_GAME_DATA.CHECKPOINTS.map((cp, i) => ({
      ...cp,
      type: "checkpoint" as const,
      id: `checkpoint-${i}`,
    })),
    ...SAMPLE_GAME_DATA.TREASURES.map((tr, i) => ({
      ...tr,
      type: "treasure" as const,
      id: `treasure-${i}`,
    })),
    ...SAMPLE_GAME_DATA.ENEMIES.map((en, i) => ({
      ...en,
      type: "enemy" as const,
      id: `enemy-${i}`,
    })),
    ...SAMPLE_GAME_DATA.OBSTACLES.map((ob, i) => ({
      ...ob,
      type: "obstacle" as const,
      id: `obstacle-${i}`,
    })),
  ]);

  const [gameSettings, setGameSettings] = useState({
    darkMode: true,
    enable2_5D: true,
    gameStyle: true,
  });

  const [gameLog, setGameLog] = useState<string[]>([
    "Game started! Use WASD to move your player.",
  ]);

  const handlePlayerMove = useCallback(
    (newPosition: [number, number]) => {
      setPlayer((prev) => ({
        ...prev,
        position: newPosition,
      }));

      // Check for interactions with game objects
      gameMarkers.forEach((marker) => {
        const distance = Math.sqrt(
          Math.pow(newPosition[0] - marker.position[0], 2) +
            Math.pow(newPosition[1] - marker.position[1], 2)
        );

        // If player is very close to a marker (within ~10 meters)
        if (distance < 0.0001) {
          handleMarkerInteraction(marker);
        }
      });
    },
    [gameMarkers]
  );

  const handleMarkerInteraction = (marker: GameMarker) => {
    if (!marker.id) return;

    switch (marker.type) {
      case "treasure":
        setPlayer((prev) => ({
          ...prev,
          score: prev.score + 100,
          inventory: [...prev.inventory, marker.popup || "Unknown treasure"],
        }));
        setGameMarkers((prev) => prev.filter((m) => m.id !== marker.id));
        setGameLog((prev) => [
          ...prev,
          `🎉 Collected ${marker.popup}! +100 points`,
        ]);
        break;

      case "checkpoint":
        setPlayer((prev) => ({
          ...prev,
          health: Math.min(prev.health + 20, 100),
        }));
        setGameLog((prev) => [
          ...prev,
          `✅ Reached ${marker.popup}! Health restored.`,
        ]);
        break;

      case "enemy":
        setPlayer((prev) => ({
          ...prev,
          health: Math.max(prev.health - 25, 0),
        }));
        setGameLog((prev) => [
          ...prev,
          `💥 Encountered ${marker.popup}! -25 health`,
        ]);
        break;

      case "obstacle":
        setPlayer((prev) => ({
          ...prev,
          health: Math.max(prev.health - 10, 0),
        }));
        setGameLog((prev) => [...prev, `⚠️ Hit ${marker.popup}! -10 health`]);
        break;
    }
  };




  const resetGame = () => {
    setPlayer({
      position: GAME_CONFIG.MAP.DEFAULT_CENTER,
      health: 100,
      score: 0,
      inventory: [],
      level: 1,
    });

    setGameMarkers([
      ...SAMPLE_GAME_DATA.CHECKPOINTS.map((cp, i) => ({
        ...cp,
        type: "checkpoint" as const,
        id: `checkpoint-${i}`,
      })),
      ...SAMPLE_GAME_DATA.TREASURES.map((tr, i) => ({
        ...tr,
        type: "treasure" as const,
        id: `treasure-${i}`,
      })),
      ...SAMPLE_GAME_DATA.ENEMIES.map((en, i) => ({
        ...en,
        type: "enemy" as const,
        id: `enemy-${i}`,
      })),
      ...SAMPLE_GAME_DATA.OBSTACLES.map((ob, i) => ({
        ...ob,
        type: "obstacle" as const,
        id: `obstacle-${i}`,
      })),
    ]);

    setGameLog(["Game reset! Use WASD to move your player."]);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: gameSettings.darkMode ? "#1a1a1a" : "#f5f5f5",
      }}
    >
      {/* Game Map */}
      <div style={{ flex: 1 }}>
        <GameMapAdapter
          center={player.position}
          zoom={GAME_CONFIG.MAP.DEFAULT_ZOOM}
          height="100vh"
          width="100%"
          markers={gameMarkers}
          paths={SAMPLE_GAME_DATA.PATHS}
          areas={SAMPLE_GAME_DATA.AREAS}
          playerPosition={player.position}
          darkMode={gameSettings.darkMode}
          enable2_5D={gameSettings.enable2_5D}
          gameStyle={gameSettings.gameStyle}

          onPlayerMove={handlePlayerMove}
        />
      </div>

      {/* Game Panel */}
      <div
        style={{
          width: "350px",
          backgroundColor: gameSettings.darkMode ? "#2a2a2a" : "white",
          color: gameSettings.darkMode ? "white" : "black",
          padding: "20px",
          overflowY: "auto",
          borderLeft: `1px solid ${gameSettings.darkMode ? "#444" : "#ddd"}`,
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            color: gameSettings.darkMode ? "#00ff00" : "#007700",
          }}
        >
          🎮 Game Dashboard
        </h2>

        {/* Player Stats */}
        <div
          style={{
            backgroundColor: gameSettings.darkMode ? "#333" : "#f9f9f9",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Player Stats</h3>
          <div>
            🏃 Position: {player.position[0].toFixed(4)},{" "}
            {player.position[1].toFixed(4)}
          </div>
          <div>❤️ Health: {player.health}/100</div>
          <div>🏆 Score: {player.score}</div>
          <div>📈 Level: {player.level}</div>
          <div>🎒 Inventory: {player.inventory.length} items</div>
          {player.inventory.length > 0 && (
            <div style={{ marginTop: "5px", fontSize: "12px" }}>
              {player.inventory.map((item, i) => (
                <div key={i}>• {item}</div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div
          style={{
            backgroundColor: gameSettings.darkMode ? "#333" : "#f9f9f9",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Settings</h3>
          <label style={{ display: "block", marginBottom: "8px" }}>
            <input
              type="checkbox"
              checked={gameSettings.darkMode}
              onChange={(e) =>
                setGameSettings((prev) => ({
                  ...prev,
                  darkMode: e.target.checked,
                }))
              }
              style={{ marginRight: "8px" }}
            />
            🌙 Dark Mode
          </label>
          <label style={{ display: "block", marginBottom: "8px" }}>
            <input
              type="checkbox"
              checked={gameSettings.enable2_5D}
              onChange={(e) =>
                setGameSettings((prev) => ({
                  ...prev,
                  enable2_5D: e.target.checked,
                }))
              }
              style={{ marginRight: "8px" }}
            />
            🎨 2.5D Mode
          </label>
          <label style={{ display: "block", marginBottom: "8px" }}>
            <input
              type="checkbox"
              checked={gameSettings.gameStyle}
              onChange={(e) =>
                setGameSettings((prev) => ({
                  ...prev,
                  gameStyle: e.target.checked,
                }))
              }
              style={{ marginRight: "8px" }}
            />
            🎮 Game Style
          </label>
        </div>

        {/* Controls */}
        <div
          style={{
            backgroundColor: gameSettings.darkMode ? "#333" : "#f9f9f9",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={resetGame}
            style={{
              backgroundColor: "#ff4444",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            🔄 Reset Game
          </button>
        </div>

        {/* Game Log */}
        <div
          style={{
            backgroundColor: gameSettings.darkMode ? "#333" : "#f9f9f9",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Game Log</h3>
          <div
            style={{
              height: "200px",
              overflowY: "auto",
              fontSize: "12px",
              backgroundColor: gameSettings.darkMode ? "#222" : "white",
              padding: "10px",
              borderRadius: "5px",
              border: `1px solid ${gameSettings.darkMode ? "#444" : "#ddd"}`,
            }}
          >
            {gameLog.slice(-20).map((log, i) => (
              <div key={i} style={{ marginBottom: "5px" }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDemo;
