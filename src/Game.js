import React, { useRef, useEffect } from 'react';
import './Game.css';

const Game = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // --- Your Game Logic Starts Here ---

    // Example: Draw a blue square
    context.fillStyle = 'blue';
    context.fillRect(10, 10, 50, 50);

    // This is where you'll create your game loop, handle input, etc.
    // For example: function gameLoop() { ... requestAnimationFrame(gameLoop); }
    // requestAnimationFrame(gameLoop);

  }, []); // The empty array ensures this effect runs only once

  return <canvas ref={canvasRef} width="800" height="600" />;
};

export default Game;