import { useEffect, useState } from "react";
import { Link } from "react-router";
import StickerPeel from "./components/StickerPeel";
import FaultyTerminal from "./components/FaultyTerminal";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
import Button from "./components/Button";
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
      "bg-music"
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
          currentLine === 0 && charIndex === 0 ? 5 : 50
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
      "bg-music"
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

        <main className="relative flex h-screen w-screen bg-black">
          <FaultyTerminal
            scale={2.5}
            gridMul={[2, 1]}
            digitSize={1.2}
            timeScale={1}
            pause={false}
            scanlineIntensity={1}
            glitchAmount={1}
            flickerAmount={1}
            noiseAmp={1}
            chromaticAberration={1}
            dither={0}
            curvature={0}
            tint="#00FF00"
            mouseReact={true}
            mouseStrength={1.5}
            pageLoadAnimation={false}
            brightness={0.21}
            className="absolute inset-0 z-10"
          />
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
          {/* Welcome text - moved further up */}
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-8 animate-fadeInUp leading-tight">
              <span className="whitespace-nowrap bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent block">
                Welcome to UCI's
              </span>
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent block mt-2">
                Petr Run
              </span>
            </h1>
          </div>
          {/* Start button and 3D model in a single glassy card */}
          <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-30 w-full flex justify-center">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-400/30 px-8 py-6 sm:py-8 max-w-2xl mx-auto">
              {/* 3D Model with label */}
              <div className="flex flex-col items-center mb-4 sm:mb-0">
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-500/80 text-white text-xs font-semibold rounded-full shadow-md border border-blue-300/60 animate-fadeInUp">
                    Hi, I&apos;m Petr! You are trying to collect me 😊!
                  </span>
                </div>
                <div className="flex items-center justify-center bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-400/20 p-2 w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]">
                  <Test />
                </div>
              </div>
              {/* Start button */}
              <div className="text-center w-max mx-auto">
                <Button
                  onClick={handleStartGame}
                  className="w-full"
                >
                  <span className="flex items-center justify-center gap-4 -skew-x-[-12deg] drop-shadow-[0_2px_0_rgba(0,0,0,0.2)]">
                    🎮 <span>Click to Start</span> ✨
                  </span>
                </Button>
                <p className="text-xs sm:text-sm text-grey-100 font-medium mt-2">
                  P.S. You can click and drag some stickers — try peeling them off
                  the screen!
                </p>
              </div>
            </div>
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
          <Button
            onClick={handleSkipTutorial}
            className="px-6 py-3 text-sm font-medium"
          >
            ⏭️ Skip Tutorial
          </Button>
        </div>

        {/* Ambient dots */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-16 top-16 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
          <div className="absolute right-20 top-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000" />
          <div className="absolute left-1/4 bottom-20 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse delay-2000" />
        </div>
      </main>
    </>
  );
}

import { Stage } from "@react-three/drei";
import { useRef } from "react";

function Test() {
  const ref = useRef(null);
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 2.1], fov: 35 }}>
        <Suspense fallback={null}>
          <Stage preset="rembrandt" intensity={1} environment={null}>
            <Model />
          </Stage>
        </Suspense>
        <OrbitControls ref={ref} autoRotate enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}

const models = [
  "hatsune_miku_plushie",
  "petr",
  "anteater_plushie",
]

const picked_model = models[Math.floor(Math.random() * models.length)];
console.log(picked_model);
export function Model() {
  const { scene } = useGLTF(`/models/${picked_model}/scene.gltf`);
  return (
    <primitive object={scene} />
  );
}

useGLTF.preload("/models/hatsune_miku_plushie/scene.gltf");
