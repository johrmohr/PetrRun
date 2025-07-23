import { useEffect, useState } from "react";

// Lines for animated text - each will appear as separate bubble
const introLines = [
  "👋 Welcome to UCI's Petr Run!",
  "This tradition began in Fall 2018, when a mysterious student, petr_the_anteatr, placed the first sticker near Aldrich Park.",
  "Now, whenever a drop is announced on Instagram, you'll see hundreds of students drop their bags and sprint across campus!",
  "Some fans have collected over **700 stickers**—yes, seven hundred!",
  "It's fast, chaotic, and full of UCI spirit. Expect crowd cheers, late-night dashes, and a whole lot of fun.",
  "Ready to join the run? 🏃‍♂️"
];

export default function App() {
  const [currentLine, setCurrentLine] = useState(0);
  const [showButtons, setShowButtons] = useState(false);

  // Show lines one by one with timing
  useEffect(() => {
    if (currentLine < introLines.length) {
      const timeout = setTimeout(() => {
        setCurrentLine(currentLine + 1);
      }, 2800); // Slower timing for better readability
      return () => clearTimeout(timeout);
    } else {
      // Show buttons after all text is done
      const buttonTimeout = setTimeout(() => setShowButtons(true), 800);
      return () => clearTimeout(buttonTimeout);
    }
  }, [currentLine]);

  const handleStartGame = () => {
    console.log("Starting game...");
    // Add your game start logic here
  };

  const handleMapDemo = () => {
    console.log("Opening map demo...");
    // Add your map demo logic here
  };

  const handleSkipTutorial = () => {
    console.log("Skipping tutorial...");
    // Add your skip tutorial logic here
  };

  return (
    <main className="relative flex h-screen w-screen bg-black overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
      
      {/* Petr character - game style positioning */}
      <div className="absolute left-8 bottom-0 h-[70vh] w-[35vw] min-w-[300px] max-w-[450px] flex items-end z-10 pointer-events-none select-none">
        <img
          src="/stickers/Thanos.png"
          alt="Petr the Anteater"
          className="w-full h-full object-cover object-bottom drop-shadow-2xl filter brightness-110 contrast-110"
          style={{ transform: "translateY(20%)" }}
          draggable={false}
        />
      </div>

      {/* Speech bubbles - game dialog style at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-4xl w-[min(95vw,800px)] z-20">
        {currentLine > 0 && (
          <div className="relative">
            {/* Game-style dialog box */}
            <div className="rounded-xl shadow-2xl bg-gray-900/95 backdrop-blur-xl border-2 border-blue-500/30 px-8 py-6 text-white">
              {/* Character name tag */}
              <div className="absolute -top-4 left-6 bg-blue-600 px-4 py-1 rounded-full text-sm font-bold border-2 border-blue-400">
                Petr the Anteater
              </div>
              
              {/* Dialog text */}
              <div className="text-xl sm:text-2xl font-medium leading-relaxed animate-fadeInUp pt-2">
                {introLines[currentLine - 1]}
              </div>
              
              {/* Typing indicator if not last message */}
              {currentLine < introLines.length && (
                <div className="flex items-center gap-1 mt-4 opacity-60">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skip Tutorial - always visible */}
      <div className="absolute top-8 right-8 z-40">
        <button
          onClick={handleSkipTutorial}
          className="px-6 py-3 bg-gray-800/80 backdrop-blur-sm text-gray-300 text-sm font-medium rounded-lg border border-gray-600/50 hover:bg-gray-700/80 hover:text-white transition-all duration-200 hover:scale-105"
        >
          ⏭️ Skip Tutorial
        </button>
      </div>

      {/* Main action buttons - appear only after all text */}
      {showButtons && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-6 items-center z-30 animate-slideInDown">
          <button
            onClick={handleStartGame}
            className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-2xl font-bold rounded-xl shadow-xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 border border-blue-500/30 hover:from-blue-500 hover:to-blue-600"
          >
            <span className="flex items-center justify-center gap-3">
              🎮 <span>Start Game</span>
            </span>
          </button>
          
          <button
            onClick={handleMapDemo}
            className="group px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-2xl font-bold rounded-xl shadow-xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300 border border-emerald-500/30 hover:from-emerald-500 hover:to-emerald-600"
          >
            <span className="flex items-center justify-center gap-3">
              🗺️ <span>Map Demo</span>
            </span>
          </button>
        </div>
      )}

      {/* Floating ambient elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-16 top-16 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
        <div className="absolute right-20 top-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000" />
        <div className="absolute left-1/4 bottom-20 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse delay-2000" />
      </div>

      {/* Custom animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from { 
              opacity: 0; 
              transform: translateY(20px);
            }
            to { 
              opacity: 1; 
              transform: translateY(0);
            }
          }
          
          @keyframes slideInRight {
            from { 
              opacity: 0; 
              transform: translateX(40px);
            }
            to { 
              opacity: 1; 
              transform: translateX(0);
            }
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          
          .animate-slideInRight {
            animation: slideInRight 0.6s ease-out forwards;
          }
          
          /* Smooth hover effects */
          .group:hover {
            transform: translateY(-2px);
          }
        `}
      </style>
    </main>
  );
}