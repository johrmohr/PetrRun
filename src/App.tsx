import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { stickerUrls } from "@/utils/constants";

// Lines for animated text
const introLines = [
  "👋 Welcome to UCI's Petr Run!",
  "This tradition started years ago...",
  "Today, we have thousands of runs logged.",
  "At random hours of the day, hundreds of students sprint through Aldrich Park.",
  "It’s chaotic, beautiful, and uniquely UCI.",
  "Are you ready to start? 🎮 Click 'Start Game' or explore the map demo!",
];

export default function App() {
  const [visibleLines, setVisibleLines] = useState(0);

  // Animate lines in, one by one
  useEffect(() => {
    if (visibleLines < introLines.length) {
      const timeout = setTimeout(() => setVisibleLines(visibleLines + 1), 900);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines]);

  return (
    <main className="relative flex h-screen w-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#24243e] overflow-hidden">
      {/* Petr on left, bottom, upper half showing */}
      <div className="absolute left-0 bottom-0 h-[70vh] w-[40vw] min-w-[260px] flex items-end z-10 pointer-events-none select-none">
        <img
          src="/stickers/Thanos.png"
          alt="Petr welcomes you"
          className="w-full h-full object-cover object-bottom drop-shadow-2xl"
          style={{ transform: "translateY(30%)" }} // Only upper half shows
          draggable={false}
        />
      </div>

      {/* Speech bubble near Petr's head */}
      <div className="absolute left-[32vw] top-[16vh] max-w-xl w-[min(90vw,480px)] z-20">
        <div className="relative">
          {/* Bubble */}
          <div className="rounded-3xl shadow-2xl border border-blue-200 bg-white/40 backdrop-blur-lg px-8 py-7 text-lg sm:text-xl font-medium text-gray-900 glassmorphism">
            {introLines.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className="fade-in mb-2 last:mb-0"
                style={{
                  animation: `fadeIn 0.7s ease ${i * 0.2}s both`,
                  opacity: 0,
                }}
              >
                {line}
              </div>
            ))}
          </div>
          {/* Triangle pointer */}
          <div
            className="absolute -left-8 top-1/2 -translate-y-1/2"
            style={{
              width: 0,
              height: 0,
              borderTop: "18px solid transparent",
              borderBottom: "18px solid transparent",
              borderRight: "28px solid rgba(255,255,255,0.4)",
              filter: "blur(0.5px)",
            }}
          />
        </div>
      </div>

      {/* Action buttons, centered right side */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-6 items-center z-30 w-[min(90vw,340px)] px-4">
        <Link
          to="/game"
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold rounded-xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-center w-full"
        >
          🎮 Start Game
        </Link>
        <Link
          to="/game-demo"
          className="px-8 py-4 bg-gradient-to-r from-green-400 to-teal-500 text-white text-xl font-bold rounded-xl shadow-lg hover:scale-105 hover:from-green-500 hover:to-teal-600 transition-all duration-200 text-center w-full"
        >
          🗺️ Map Demo
        </Link>
        <Link
          to="/skip-tutorial"
          className="px-8 py-4 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 text-xl font-bold rounded-xl shadow-lg hover:scale-105 hover:from-gray-400 hover:to-gray-500 transition-all duration-200 text-center w-full"
        >
          ⏭️ Skip Tutorial
        </Link>
      </div>

      {/* Optional: floating stickers for extra 4D effect */}
      <img
        src={stickerUrls[0]}
        className="absolute left-8 top-8 w-24 opacity-60 rotate-12 blur-[1px] pointer-events-none"
        alt=""
        draggable={false}
      />
      <img
        src={stickerUrls[2]}
        className="absolute right-12 bottom-10 w-28 opacity-50 -rotate-6 blur-[2px] pointer-events-none"
        alt=""
        draggable={false}
      />

      {/* Fade-in animation keyframes */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .fade-in {
            opacity: 0;
            animation: fadeIn 0.7s forwards;
          }
          .glassmorphism {
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
            border: 1.5px solid rgba(255,255,255,0.25);
          }
        `}
      </style>
    </main>
  );
}
