import React, { useState, useCallback } from "react";
import GameMapAdapter from "@/game/components/GameMapAdapter";
import { GAME_CONFIG, SAMPLE_GAME_DATA } from "../utils/constants";
import { isPlayerNearMarker, spawnMultipleItemsNearPlayer } from "../game/utils/mapUtils";
import type { GameMarker, Player } from "../utils/types";

const GameDemo: React.FC = () => {
  const [player, setPlayer] = useState<Player>({
    position: GAME_CONFIG.MAP.DEFAULT_CENTER,
    health: 100,
    score: 0,
    inventory: [],
    level: 1,
  });

  const [mapImageData, setMapImageData] = useState<ImageData | null>(null);

  const [gameMarkers, setGameMarkers] = useState<GameMarker[]>(() => {
    // Initialize with base markers
    const baseMarkers = [
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
    ];

    return baseMarkers; // Start with just base markers, add bonus items when map data loads
  });

  const [gameSettings, setGameSettings] = useState({
    darkMode: true,
    enable2_5D: true,
    gameStyle: true,
  });

  const [gameLog, setGameLog] = useState<string[]>([
    "Game started! Use WASD to move your player.",
  ]);

  // Handle map image data loading
  const handleMapImageDataLoaded = (imageData: ImageData | null) => {
    setMapImageData(imageData);
    
    // Spawn initial bonus items now that we have map data
    if (imageData) {
      setGameMarkers(prevMarkers => {
        // Check if bonus items already exist
        const hasBonus = prevMarkers.some(marker => marker.id?.startsWith('starting-bonus'));
        if (hasBonus) return prevMarkers;

        try {
          const bonusPositions = spawnMultipleItemsNearPlayer(
            GAME_CONFIG.MAP.DEFAULT_CENTER,
            GAME_CONFIG.MAP.MAP_DIMENSIONS,
            2,
            200,
            imageData
          );

          const bonusItems = bonusPositions.map((pos, i) => ({
            position: pos,
            popup: `🎁 Starting Bonus ${i + 1}`,
            color: "#ff69b4",
            type: "treasure" as const,
            id: `starting-bonus-${i}`,
          }));

          setGameLog(prev => [...prev, "🎁 Bonus items spawned on solid ground near you!"]);
          return [...prevMarkers, ...bonusItems];
        } catch (error) {
          console.warn('Failed to spawn bonus items:', error);
          return prevMarkers;
        }
      });
    }
  };

  const handlePlayerMove = useCallback(
    (newPosition: [number, number]) => {
      setPlayer((prev) => ({
        ...prev,
        position: newPosition,
      }));

      // Check for interactions with game objects using the utility function
      gameMarkers.forEach((marker) => {
        if (isPlayerNearMarker(newPosition, marker.position, 50)) {
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
    const newPlayer = {
      position: GAME_CONFIG.MAP.DEFAULT_CENTER,
      health: 100,
      score: 0,
      inventory: [],
      level: 1,
    };

    setPlayer(newPlayer);

    // Generate base markers from sample data
    const baseMarkers = [
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
    ];

    // Spawn additional items near the player using map image data
    try {
      const additionalTreasurePositions = spawnMultipleItemsNearPlayer(
        newPlayer.position,
        GAME_CONFIG.MAP.MAP_DIMENSIONS,
        3,
        250,
        mapImageData || undefined
      );

      const additionalTreasures = additionalTreasurePositions.map((pos, i) => ({
        position: pos,
        popup: `💎 Bonus Treasure ${i + 1}`,
        color: "#ffd700",
        type: "treasure" as const,
        id: `bonus-treasure-${i}`,
      }));

      setGameMarkers([...baseMarkers, ...additionalTreasures]);
      setGameLog([
        "Game reset! Additional treasures spawned on solid ground near you. Use WASD to move your player.",
        mapImageData 
          ? "✅ Using transparency detection for accurate spawning!" 
          : "⚠️ Spawning without transparency detection - items may appear on water."
      ]);
    } catch (error) {
      console.warn('Failed to spawn additional treasures:', error);
      setGameMarkers(baseMarkers);
      setGameLog(["Game reset! Use WASD to move your player."]);
    }
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
          imageDimensions={GAME_CONFIG.MAP.MAP_DIMENSIONS}
          onPlayerMove={handlePlayerMove}
          onMapImageDataLoaded={handleMapImageDataLoaded}
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
