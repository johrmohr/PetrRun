export default function StartPhaseUI() {
  return (
    <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-90 p-6 rounded-lg shadow-xl text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Pick your starting point!</h2>
      <p className="text-gray-600">Click anywhere on the map to begin.</p>
    </div>
  );
}
