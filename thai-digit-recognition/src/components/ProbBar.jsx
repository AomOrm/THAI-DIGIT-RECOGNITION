// Horizontal probability bar for one digit class in the result panel.
function ProbBar({ label, value, isWinner }) {
  const pct = (value * 100).toFixed(1);

  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 thai-num text-lg ${isWinner ? 'text-ink-900 font-semibold' : 'text-ink-500'}`}>
        {label}
      </div>

      <div className="flex-1 h-2.5 bg-paper-100 rounded-full overflow-hidden">
        {/* width is dynamic so it must remain an inline style */}
        <div
          className={`h-full bar-grow rounded-full ${isWinner ? 'bg-ink-900' : 'bg-ink-300'}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>

      <div className={`w-14 text-right font-mono text-xs tabular-nums ${isWinner ? 'text-ink-900 font-semibold' : 'text-ink-500'}`}>
        {pct}%
      </div>
    </div>
  );
}
