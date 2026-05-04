// Temporary notification that appears bottom-right, then auto-dismisses.
// Controlled by parent: pass null to hide.
function Toast({ toast }) {
  if (!toast) return null;

  const { kind, msg } = toast;
  const colorClass = kind === 'error' ? 'bg-rose-600 text-white' : 'bg-ink-900 text-white';

  return (
    <div className="fixed bottom-6 right-6 z-50 fade-pop">
      <div className={`${colorClass} px-4 py-3 rounded-lg shadow-pop text-sm flex items-center gap-2 max-w-sm`}>
        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
        {msg}
      </div>
    </div>
  );
}
