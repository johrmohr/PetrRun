interface CountdownPhaseUIProps {
  countdown: number;
}

export default function CountdownPhaseUI({ countdown }: CountdownPhaseUIProps) {
  return (
    <div className="absolute z-10 top-8 left-1/2 -translate-x-1/2 game-ui-overlay bg-white bg-opacity-95 p-8 rounded-lg shadow-xl text-center">
      <div className="text-5xl font-bold text-blue-600">
        {countdown > 0 ? countdown : "🎯 ZOT!"}
      </div>
    </div>
  );
}
