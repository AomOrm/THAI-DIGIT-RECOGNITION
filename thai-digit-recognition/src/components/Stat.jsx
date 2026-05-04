// Single stat cell used inside the current-model card on Admin page.
function Stat({ label, value, highlight, mono }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div
        className={[
          'mt-1 text-base font-semibold tabular-nums',
          highlight || 'text-ink-900',
          mono ? 'font-mono text-sm font-normal' : '',
        ].join(' ')}
      >
        {value}
      </div>
    </div>
  );
}
