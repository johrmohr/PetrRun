import StickerPeel from "@/components/StickerPeel";
import { Link } from "react-router";
import { stickerUrls } from "@/utils/constants";

export default function App() {
  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#24243e] overflow-hidden">
      {/* Centered Petr */}
      <div className="flex flex-col items-center z-10">
        <img
          src="/stickers/Thanos.png"
          alt="Petr welcomes you"
          className="w-48 h-48 drop-shadow-2xl animate-bounce mb-6"
          draggable={false}
        />
        {/* Speech bubble / intro box */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-6 mb-8 max-w-xl border-4 border-blue-300 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl font-bold text-blue-700 drop-shadow">
            👋 Welcome!
          </div>
          <div className="mt-4 text-lg text-gray-800 font-medium text-center">
            {/* TODO: Insert your UCI tradition intro here */}
            <span className="italic text-blue-900">
              [Petr introduces you to the UCI tradition...]
            </span>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <Link
            to="/game"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold rounded-xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-center"
          >
            🎮 Start Game
          </Link>
          <Link
            to="/game-demo"
            className="px-8 py-4 bg-gradient-to-r from-green-400 to-teal-500 text-white text-xl font-bold rounded-xl shadow-lg hover:scale-105 hover:from-green-500 hover:to-teal-600 transition-all duration-200 text-center"
          >
            🗺️ Map Demo
          </Link>
          <Link
            to="/skip-tutorial"
            className="px-8 py-4 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 text-xl font-bold rounded-xl shadow-lg hover:scale-105 hover:from-gray-400 hover:to-gray-500 transition-all duration-200 text-center"
          >
            ⏭️ Skip Tutorial
          </Link>
        </div>
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
    </main>


}  );  );
}
