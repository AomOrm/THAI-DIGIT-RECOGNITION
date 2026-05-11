// Inference page: user draws a digit and the model predicts which class it is.
function UserPage({ modelInfo }) {
  const { useState, useRef, useEffect } = React;

  const canvasRef = useRef(null);
  const [hasInk,  setHasInk]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  const handlePredict = async () => {
    setError(null);
    if (canvasRef.current?.isEmpty()) {
      setError('กรุณาเขียนตัวเลขก่อนทำนาย');
      return;
    }
    setLoading(true);
    try {
      const dataUrl = canvasRef.current.toDataURL();
      setResult(await apiPredict(dataUrl));
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเรียกใช้โมเดล');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setResult(null);
    setError(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter')  handlePredict();
      if (e.key === 'Escape') handleClear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const winner = result?.prediction;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Page header */}
      <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-ink-500 mb-2">
            01 · Inference
          </div>
          <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
            เขียนเลขไทย เพื่อให้โมเดลทำนาย
          </h1>
          <p className="text-ink-500 mt-1.5">
            รองรับเลข ๑๖, ๑๗, ๑๘, ๑๙, ๒๐ — เขียนแล้วกด{' '}
            <kbd className="px-1.5 py-0.5 bg-paper-100 rounded font-mono text-[11px] border border-paper-200">Enter</kbd>
            {' '}หรือปุ่มทำนาย
          </p>
        </div>

        {/* Active model badge */}
        <div className="flex items-center gap-2 text-xs font-mono text-ink-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="uppercase tracking-wider">Active model</span>
          <span className="text-ink-900">{modelInfo.name}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-start">

        {/* Canvas card */}
        <div className="bg-white rounded-2xl shadow-card p-6 w-fit">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-ink-900">พื้นที่เขียน</div>
            <div className="font-mono text-[11px] text-ink-500">400 × 400 px</div>
          </div>

          <CanvasFwd ref={canvasRef} onChange={setHasInk} />

          <div className="flex gap-2 mt-5">
            <button
              onClick={handlePredict}
              disabled={loading}
              className="flex-1 h-11 rounded-lg bg-ink-900 text-white font-medium hover:bg-ink-800 active:scale-[.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  กำลังทำนาย…
                </>
              ) : 'ทำนาย'}
            </button>

            <button
              onClick={handleClear}
              className="h-11 px-5 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-900 font-medium active:scale-[.98] transition"
            >
              เคลียร์
            </button>
          </div>

          {error && (
            <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Result card */}
        <div className="bg-white rounded-2xl shadow-card p-8 min-h-[360px]">

          {/* Empty state */}
          {!result && !loading && (
            <div className="h-full grid place-items-center text-center min-h-[300px]">
              <div>
                <div className="text-ink-300 thai-num text-7xl mb-3">?</div>
                <div className="text-ink-500">ยังไม่มีผลทำนาย</div>
                <div className="text-ink-300 text-xs font-mono mt-1">awaiting input</div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="h-full grid place-items-center text-center min-h-[300px]">
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full border-2 border-paper-200 border-t-ink-900 animate-spin" />
                <div className="text-ink-500 font-mono text-xs uppercase tracking-wider">
                  running inference
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">

              {/* Predicted digit */}
              <div
                key={result.prediction + result.confidence}
                className="text-center md:border-r md:border-paper-200 md:pr-8 fade-pop"
              >
                <div className="text-xs font-mono uppercase tracking-wider text-ink-500 mb-2">
                  prediction
                </div>
                <div className="thai-num text-[140px] leading-none font-semibold text-ink-900">
                  {result.prediction}
                </div>
                <div className="font-mono text-xs text-ink-500 mt-1">
                  arabic · {ARABIC[result.prediction]}
                </div>
                <div className="mt-5 inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-full bg-accent-soft">
                  <span className="font-mono text-xs uppercase tracking-wider text-ink-700">confidence</span>
                  <span className="font-semibold text-ink-900 tabular-nums">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Probability bars */}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-ink-500 mb-4">
                  class probabilities
                </div>
                <div className="space-y-3">
                  {CLASSES.map((c) => (
                    <ProbBar key={c} label={c} value={result.all_probs[c] || 0} isWinner={c === winner} />
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
