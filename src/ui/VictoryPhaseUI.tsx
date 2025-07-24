export default function VictoryPhaseUI() {
  return (
    <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-green-50 bg-opacity-95 border-2 border-green-200 p-6 rounded-lg shadow-xl text-center">
      <div className="text-3xl font-bold text-green-600">
        🎉 You found the drop! 🎉
      </div>
    </div>
  );
}
