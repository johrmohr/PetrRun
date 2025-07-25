import { useEffect, useState } from "react";
import { Link } from "react-router";
import StickerPeel from "./components/StickerPeel";

const stickerUrls = [
  "/stickers/Space-Explorr-Petr.png",
  "/stickers/Thanos.png",
  "/stickers/Superhero-petr.png",
  "/stickers/Pumpkin-petr.png",
  "/stickers/Alien.png",
  "/stickers/chozupetr.png",
  "/stickers/petrstack.png",
  "/stickers/pokepetr.png",
  "/stickers/zoro.png",
  "/stickers/cupid.png",
  "/stickers/easter.png",
];

// Lines for animated text - each will appear as separate bubble
const introLines = [
  "👋 Welcome to UCI's Petr Run!",
  "A petr is a cartoon drawing of UCI's mascot, Peter the Anteater.",
  "The Petr Run tradition began in Fall 2018, when a mysterious student, petr_the_anteatr, placed the first sticker near Aldrich Park.",
  "Petr stickers are hidden in unexpected spots all around campus, from Ring Road to the Student Center.",
  "To claim one, you have to LITERALLY run to the drop location: because once they're gone, they're gone!",
  "Each sticker is limited, designed by UCI students, and part of an ever growing collectible set...",
  "Students quickly discovered these stickers were part of a campus wide game, and the hype spread fast.",
  "Now, when a drop is announced on Instagram, hundreds of students instantly bolt across campus!",
  "Some fans have collected over 700 stickers. Yes, seven hundred!",
  "It's wild. It's sweaty. It's hundreds of students full sprinting through campus screaming for stickers. UCI spirit at its peak.",
  "Ready to join the run? 🏃‍♂️",
];

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const audio = document.getElementById(
      "bg-music",
    ) as HTMLAudioElement | null;

    if (audio) {
      audio.muted = false;
      audio.volume = 0;

      let volume = 0;
      const interval = setInterval(() => {
        if (volume < 0.3) {
          volume += 0.02;
          audio.volume = volume;
        } else {
          clearInterval(interval);
        }
      }, 150);

      return () => clearInterval(interval);
    }
  }, []); // empty dependency — runs only once

  const random_stickerUrls = stickerUrls.sort(() => Math.random() - 0.5);
  useEffect(() => {
    if (!gameStarted) return;

    if (currentLine < introLines.length) {
      const fullLine = introLines[currentLine];

      if (charIndex < fullLine.length) {
        const timeout = setTimeout(
          () => {
            setDisplayedText((prev) => prev + fullLine[charIndex]);
            setCharIndex((prev) => prev + 1);
          },
          currentLine === 0 && charIndex === 0 ? 5 : 50,
        );
        return () => clearTimeout(timeout);
      } else {
        const linePause = setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
          setDisplayedText("");
          setCharIndex(0);
        }, 2000);
        return () => clearTimeout(linePause);
      }
    }
  }, [charIndex, currentLine, gameStarted]);

  const handleStartGame = () => {
    const audio = document.getElementById(
      "bg-music",
    ) as HTMLAudioElement | null;
    if (audio) {
      audio.muted = false;
      audio.play().catch((err) => console.error("Failed to play audio:", err));
    }
    setGameStarted(true);
  };

  const handleSkipTutorial = () => {
    setGameStarted(true);
    setCurrentLine(introLines.length); // Skip to end of tutorial
  };

  if (!gameStarted) {
    return (
      <>
        <audio
          id="bg-music"
          src="/Elevator-music.mp3"
          autoPlay
          loop
          muted
          style={{ display: "none" }}
        />

        <main className="relative flex h-screen w-screen bg-black overflow-hidden">
          {/* Peelable stickers on black screen */}
          <StickerPeel
            imageSrc={random_stickerUrls[0]}
            className="absolute top-[8%] left-[5%] z-20"
          />
          <StickerPeel
            imageSrc={random_stickerUrls[1]}
            className="absolute top-[5%] right-[2%] z-20"
          />
          <StickerPeel
            imageSrc={random_stickerUrls[2]}
            className="absolute bottom-[6%] left-[3%] z-20"
          />
          <StickerPeel
            imageSrc={random_stickerUrls[3]}
            className="absolute bottom-[3%] right-[1%] z-20"
          />
          <StickerPeel
            imageSrc={random_stickerUrls[4]}
            className="absolute bottom-[33%] left-[18%] z-20"
          />
          <StickerPeel
            imageSrc={random_stickerUrls[5]}
            className="absolute bottom-[15%] right-[5%] z-20"
          />

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
            <div className="text-center w-max mx-auto">
              <button
                onClick={handleStartGame}
                className="group px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/30 hover:scale-110 transition-all duration-300 border-2 border-blue-400/30 hover:from-blue-500 hover:to-purple-500 animate-pulse"
              >
                <span className="flex items-center justify-center gap-4">
                  🎮 <span>Click to Start</span> ✨
                </span>
              </button>
              <p className="text-sm text-grey-100 font-medium mt-2">
                P.S. You can click and drag some stickers — try peeling them off
                the screen!
              </p>
            </div>
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
      <audio
        id="bg-music"
        src="/Elevator-music.mp3"
        autoPlay
        loop
        muted
        style={{ display: "none" }}
      />

      <main
        className="relative flex h-screen w-screen bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/UCI_map_zoomed.png')" }}
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

        {/* Dialog box for intro lines */}
        <div className="absolute bottom-8 left-1/2 -translate-x-[35%] max-w-4xl w-[min(95vw,800px)] z-20">
          {gameStarted && (
            <div className="relative">
              <div className="rounded-xl shadow-2xl bg-gray-900/95 backdrop-blur-xl border-2 border-blue-500/30 px-6 py-5 text-white">
                <div className="absolute -top-4 left-6 bg-blue-600 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border-2 border-blue-400">
                  Petr the Anteater
                </div>

                <div className="text-base sm:text-lg font-medium leading-relaxed animate-fadeInUp pt-2">
                  {currentLine === introLines.length ? (
                    <div className="flex items-center gap-3">
                      <span className="text-white text-base sm:text-lg md:text-xl font-semibold">
                        Ready to join the run? 🏃‍♂️
                      </span>
                      <Link
                        to="/game"
                        className="px-5 py-2 text-base sm:text-lg font-semibold rounded-xl bg-blue-400 text-white shadow-md hover:scale-105 transition-transform duration-200"
                      >
                        Start Game
                      </Link>
                    </div>
                  ) : (
                    <>
                      <span className="text-white text-lg sm:text-xl md:text-2xl font-semibold">
                        {displayedText}
                      </span>

                      <span className="inline-block w-1 bg-white animate-blink ml-1" />
                    </>
                  )}
                </div>

                {currentLine < introLines.length && (
                  <div className="flex items-center gap-1 mt-3 opacity-60">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-300" />
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
            @keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s step-start infinite;
}

        `}
        </style>
      </main>
    </>
  );
}
