import { useState, useRef, useEffect } from "react";
import { selectRandomDropsite } from "./logic/dropsiteSelector";
import { isWithinDropRadius } from "./logic/distanceCalculator";
import { GamePhaseManager } from "./logic/phaseManager";
import { GameTimer } from "./logic/gameTimer";
import { DROP_RADIUS } from "../utils/constants";
import type { GamePhase } from "./types";
import type { Dropsite } from "../utils/types";

export const useGameController = () => {
  // State
  const [phase, setPhase] = useState<GamePhase>("start");
  const [playerPos, setPlayerPos] = useState<[number, number] | null>(null);
  const [currentDropsite, setCurrentDropsite] = useState<Dropsite>(() =>
    selectRandomDropsite()
  );
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start selection: player clicks map to set start
  const handleMapClick = (position: { x: number; y: number }) => {
    if (GamePhaseManager.canClickMap(phase)) {
      setPlayerPos([position.x, position.y]);
    }
  };

  // Start countdown when player picks start
  useEffect(() => {
    if (phase === "start" && playerPos) {
      setPhase("countdown");
      setCountdown(3);
    }
  }, [playerPos, phase]);

  // Countdown logic
  useEffect(() => {
    if (phase === "countdown") {
      if (countdown > 0) {
        const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(id);
      } else {
        setPhase("playing");
        setStartTime(Date.now());
      }
    }
  }, [phase, countdown]);

  // Timer logic
  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => {
        setTimer(GameTimer.createTimerUpdater(startTime ?? Date.now())());
      }, GameTimer.UPDATE_INTERVAL);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else if (phase === "victory") {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [phase, startTime]);

  // WASD movement handler
  const handlePlayerMove = (newPos: [number, number]) => {
    setPlayerPos(newPos);

    // Check victory condition
    if (isWithinDropRadius(newPos, currentDropsite.location, DROP_RADIUS)) {
      setPhase("victory");
    }
  };

  // On victory, show results after short delay
  useEffect(() => {
    if (phase === "victory") {
      setTimeout(() => setPhase("results"), 1500);
    }
  }, [phase]);

  // Reset for new round
  const handleRestart = () => {
    setPhase("start");
    setPlayerPos(null);
    setTimer(0);
    setStartTime(null);
    setCurrentDropsite(selectRandomDropsite());
  };

  return {
    // State
    phase,
    playerPos,
    currentDropsite,
    timer,
    countdown,

    // Actions
    handleMapClick,
    handlePlayerMove: GamePhaseManager.canPlayerMove(phase)
      ? handlePlayerMove
      : undefined,
    handleRestart,
  };
};
