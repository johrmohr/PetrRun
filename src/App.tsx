import StickerPeel from "@/components/StickerPeel";
import { stickerUrls } from "@/utils/constants";
import { Link } from "react-router";

function App() {
  return (
    <main className="relative flex h-screen w-screen items-center justify-center">
      <StickerPeel
        imageSrc={stickerUrls[0]}
        className="absolute top-[10%] left-[15%]"
      />
      <StickerPeel
        imageSrc={stickerUrls[1]}
        className="absolute top-[20%] right-[10%]"
      />
      <StickerPeel
        imageSrc={stickerUrls[2]}
        className="absolute bottom-[15%] left-[20%]"
      />
      <StickerPeel
        imageSrc={stickerUrls[3]}
        className="absolute bottom-[25%] right-[25%]"
      />
      <div className="relative w-[600px] h-[400px] rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-4 text-center">
          Welcome to Sticker Showcase
        </h1>
        {/* Section below title */}
        <section className="text-lg text-gray-700 text-center max-w-xl">
          Explore our fun sticker collection! Peel and discover surprises at
          every corner.
          <div className="flex flex-col gap-4 mt-6">
            <Link
              to="/game"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
            >
              🎮 Start Game
            </Link>
            <Link
              to="/game-demo"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
            >
              🗺️ Map Demo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
