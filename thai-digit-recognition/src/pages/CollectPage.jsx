// Dataset collection page: draw a digit, pick its label, and save it as a training sample.
function CollectPage() {
  const { useState, useEffect, useRef } = React;

  const canvasRef = useRef(null);
  const [hasInk, setHasInk]   = useState(false);
  const [label,  setLabel]    = useState(CLASSES[0]);
  const [saving,  setSaving]   = useState(false);
  const [error,   setError]    = useState(null);
  const [toast,   setToast]    = useState(null);
  const [stats,   setStats]    = useState(() =>
    Object.fromEntries(CLASSES.map((c) => [c, 0]))
  );

  const showToast = (kind, msg) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 2400);
  };

  // Load initial sample counts from the backend on mount.
  useEffect(() => {
    // Real call:
    // const load = async () => { const r = await fetch('/sample-stats'); setStats(await r.json()); };
    // load();
    setStats({ '๑๖': 12, '๑๗': 8, '๑๘': 15, '๑๙': 5, '๒๐': 10 });
  }, []);

  const handleSave = async () => {
    setError(null);
    if (canvasRef.current?.isEmpty()) {
      setError('กรุณาเขียนตัวเลขก่อนบันทึก');
      return;
    }
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      const updated = mockSaveSample(label, stats);
      setStats(updated);
      canvasRef.current?.clear();
      showToast('ok', `บันทึก ${label} แล้ว — ตัวอย่างที่ ${updated[label]}`);
    } catch {
      setError('บันทึกไม่สำเร็จ');
      showToast('error', 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setError(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'Enter')  { e.preventDefault(); handleSave(); }
      if (e.key === 'Escape') { e.preventDefault(); handleClear(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const total       = Object.values(stats).reduce((a, b) => a + b, 0);
  const targetTotal = CLASSES.length * COLLECTION_TARGET;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Page header */}
      <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-ink-500 mb-2">
            02 · Dataset Collection
          </div>
          <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
            เก็บตัวอย่างลายมือเขียน
          </h1>
          <p className="text-ink-500 mt-1.5">
            เลือกเลขที่จะเก็บ เขียน แล้วกด{' '}
            <kbd className="px-1.5 py-0.5 bg-paper-100 rounded font-mono text-[11px] border border-paper-200">Enter</kbd>
            {' '}เพื่อบันทึก ·{' '}
            <kbd className="px-1.5 py-0.5 bg-paper-100 rounded font-mono text-[11px] border border-paper-200">Esc</kbd>
            {' '}เพื่อล้าง
          </p>
        </div>

        <div className="text-xs font-mono text-ink-500 flex items-center gap-2">
          <span className="uppercase tracking-wider">total samples</span>
          <span className="text-ink-900 tabular-nums">{total}</span>
          <span className="text-ink-300">/</span>
          <span className="text-ink-300 tabular-nums">{targetTotal}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-start">

        {/* Capture card */}
        <div className="bg-white rounded-2xl shadow-card p-6 w-fit">
          <div className="flex items-center justify-between mb-4 gap-6">
            <div className="text-sm font-medium text-ink-900">บันทึกตัวอย่าง</div>
            <div className="font-mono text-[11px] text-ink-500">400 × 400 px</div>
          </div>

          {/* Label selector */}
          <div className="mb-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500 mb-2">label</div>
            <div className="flex gap-1.5">
              {CLASSES.map((c) => (
                <button
                  key={c}
                  onClick={() => setLabel(c)}
                  className={`flex-1 h-12 rounded-lg thai-num text-2xl font-semibold transition active:scale-[.97] ${
                    label === c
                      ? 'bg-ink-900 text-white shadow-sm'
                      : 'bg-paper-100 text-ink-500 hover:bg-paper-200 hover:text-ink-900'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <CanvasFwd ref={canvasRef} onChange={setHasInk} />

          <div className="flex gap-2 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-11 rounded-lg bg-ink-900 text-white font-medium hover:bg-ink-800 active:scale-[.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  กำลังบันทึก…
                </>
              ) : (
                <>
                  บันทึกตัวอย่าง
                  <kbd className="px-1 py-0.5 bg-white/15 rounded font-mono text-[10px]">↵</kbd>
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              className="h-11 px-5 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-900 font-medium active:scale-[.98] transition flex items-center gap-1.5"
            >
              ล้าง
              <kbd className="px-1 py-0.5 bg-white rounded font-mono text-[10px] text-ink-500 border border-paper-200">esc</kbd>
            </button>
          </div>

          {error && (
            <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Progress panel */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-xs font-mono uppercase tracking-wider text-ink-500">progress per class</div>
            <div className="text-[11px] font-mono text-ink-300">target {COLLECTION_TARGET} / class</div>
          </div>

          <div className="space-y-4">
            {CLASSES.map((c) => {
              const n       = stats[c] || 0;
              const pct     = Math.min(100, (n / COLLECTION_TARGET) * 100);
              const done    = n >= COLLECTION_TARGET;
              const isActive = c === label;

              return (
                <div
                  key={c}
                  className={`rounded-xl p-3 transition ${isActive ? 'bg-paper-50 ring-1 ring-paper-200' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg grid place-items-center thai-num text-2xl font-semibold shrink-0 ${
                      done      ? 'bg-emerald-50 text-emerald-700' :
                      isActive  ? 'bg-ink-900 text-white' :
                                  'bg-paper-100 text-ink-500'
                    }`}>
                      {c}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink-900 tabular-nums">{n}</span>
                          <span className="text-xs font-mono text-ink-300">/ {COLLECTION_TARGET}</span>
                          {done && (
                            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                              complete
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono tabular-nums text-ink-500">
                          {pct.toFixed(0)}%
                        </div>
                      </div>

                      <div className="h-2 bg-paper-100 rounded-full overflow-hidden">
                        {/* width is dynamic so it must remain an inline style */}
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            done ? 'bg-emerald-500' : 'bg-ink-900'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall progress */}
          <div className="mt-6 pt-5 border-t border-paper-200 flex items-center justify-between text-xs">
            <div className="font-mono text-ink-500">
              <span className="uppercase tracking-wider">overall</span>
              <span className="ml-2 text-ink-900 tabular-nums">{total}</span>
              <span className="text-ink-300"> / {targetTotal}</span>
            </div>
            <div className="font-mono text-ink-500 tabular-nums">
              {((total / targetTotal) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

      </div>

      <Toast toast={toast} />
    </div>
  );
}
