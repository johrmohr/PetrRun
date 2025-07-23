import { useEffect, useState } from "react";
import { Link } from "react-router";

// Lines for animated text - each will appear as separate bubble
const introLines = [
  "👋 Welcome to UCI's Petr Run! A petr is a cartoon drawing of UCI's mascot, Peter the Anteater.",
  "The Petr Run tradition began in Fall 2018, when a mysterious student, petr_the_anteatr, placed the first sticker near Aldrich Park.",
  "Petr stickers are hidden in unexpected spots all around campus, from Ring Road to the Student Center.",
  "To claim one, you have to LITERALLY run to the drop location: because once they're gone, they're gone!",
  "Each sticker is limited, designed by UCI students, and part of an ever growing collectible set.",
  "Students quickly discovered these stickers were part of a campus wide game, and the hype spread fast.",
  "Now, when a drop is announced on Instagram, hundreds of students instantly bolt across campus!",
  "Some fans have collected over 700 stickers. Yes, seven hundred!",
  "It's wild. It's sweaty. It's hundreds of students full sprinting through campus screaming for stickers. UCI spirit at its peak.",
  "Ready to join the run? 🏃‍♂️"
];

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

useEffect(() => {
  if (!gameStarted) return;

  if (currentLine < introLines.length) {
    const delay = currentLine === 0 ? 900 : 5800; // 1.5s for first, 5s for others
    const timeout = setTimeout(() => {
      setCurrentLine(currentLine + 1);
    }, delay);
    return () => clearTimeout(timeout);
  }
}, [currentLine, gameStarted]);


  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleSkipTutorial = () => {
    setGameStarted(true);
    setCurrentLine(introLines.length); // Skip to end of tutorial
  };


  if (!gameStarted) {
    return (
      <>
      <audio src="/Elevator-music.mp3" controls autoPlay loop />

      <main className="relative flex h-screen w-screen bg-black overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />

        {/* Petr sticker - shifted right */}
        <div className="absolute left-[60%] top-[59%] -translate-y-1/2 h-[50vh] w-[35vw] min-w-[260px] max-w-[380px] flex items-center justify-center z-10 pointer-events-none select-none">
          <img
            src="/stickers/Github-petr-dark.png"
            alt="Petr Sticker"
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        {/* Welcome text - moved further up */}
         <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-8 animate-fadeInUp leading-tight">
          

            <span className="whitespace-nowrap bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent block">
              Welcome to UCI's
            </span>
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent block mt-2">
              Petr Run
            </span>
          </h1>
          </div>



        {/* Start button */}
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={handleStartGame}
            className="group px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/30 hover:scale-110 transition-all duration-300 border-2 border-blue-400/30 hover:from-blue-500 hover:to-purple-500 animate-pulse"
          >
            <span className="flex items-center justify-center gap-4">
              🎮 <span>Click to Start</span> ✨
            </span>
          </button>
        </div>

        {/* Ambient dots */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-16 top-16 w-3 h-3 bg-blue-400/40 rounded-full animate-pulse" />
          <div className="absolute right-20 top-1/3 w-2 h-2 bg-purple-400/50 rounded-full animate-pulse delay-1000" />
          <div className="absolute left-1/4 bottom-20 w-2.5 h-2.5 bg-cyan-400/30 rounded-full animate-pulse delay-2000" />
          <div className="absolute right-1/3 bottom-1/3 w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-pulse delay-3000" />
        </div>
      </main>
      </>
    );
  }

  return (
          <>
      <audio src="/Elevator-music.mp3" controls autoPlay loop />
    <main
  className="relative flex h-screen w-screen bg-cover bg-center overflow-hidden"
  style={{ backgroundImage: "url('/UCI_map.png')" }}
>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />

      {/* Petr sticker in-game */}
      <div className="absolute left-8 bottom-0 h-[70vh] w-[35vw] min-w-[300px] max-w-[450px] flex items-end z-10 pointer-events-none select-none">
        <img
          src="/stickers/Github-petr-dark.png"
          alt="Petr Sticker"
          className="w-full h-full object-contain rounded-full"
          style={{ transform: "translateY(20%)" }}
        />
      </div>

      {/* Dialog bubble */}
{/* Dialog bubble */}
<div className="absolute bottom-8 left-1/2 -translate-x-[35%] max-w-4xl w-[min(95vw,800px)] z-20">
  {currentLine > 0 && (
    <div className="relative">
      <div className="rounded-xl shadow-2xl bg-gray-900/95 backdrop-blur-xl border-2 border-blue-500/30 px-8 py-6 text-white">
        <div className="absolute -top-4 left-6 bg-blue-600 px-4 py-1 rounded-full text-sm font-bold border-2 border-blue-400">
          Petr the Anteater
        </div>
        <div className="text-xl sm:text-2xl font-medium leading-relaxed animate-fadeInUp pt-2">
          <>
            {currentLine === introLines.length ? (
              <div className="flex flex-wrap justify-between items-center gap-4">
                <span>Ready to join the run? 🏃‍♂️</span>
                <Link
                to="/game"
                className="px-6 py-3 text-lg sm:text-xl font-semibold rounded-xl bg-blue-400 text-white shadow-md hover:scale-105 transition-transform duration-200 text-center"
              >
                Start Game
              </Link>

              </div>
            ) : (
              introLines[currentLine - 1]
            )}

          </>
        </div>
        {currentLine < introLines.length && (
          <div className="flex items-center gap-1 mt-4 opacity-60">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300" />
          </div>
        )}
      </div>
    </div>
  )}
</div>


      {/* Skip tutorial */}
      <div className="absolute top-8 right-8 z-40">
        <button
          onClick={handleSkipTutorial}
          className="px-6 py-3 bg-gray-800/80 backdrop-blur-sm text-gray-300 text-sm font-medium rounded-lg border border-gray-600/50 hover:bg-gray-700/80 hover:text-white transition-all duration-200 hover:scale-105"
        >
          ⏭️ Skip Tutorial
        </button>
      </div>

      {/* Ambient dots */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-16 top-16 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
        <div className="absolute right-20 top-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000" />
        <div className="absolute left-1/4 bottom-20 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse delay-2000" />
      </div>

      {/* Animations */}
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

          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }

          .group:hover {
            transform: translateY(-2px);
          }
        `}
      </style>
    </main>
    </>
  );
}
