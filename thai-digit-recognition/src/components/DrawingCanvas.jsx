// Touch/mouse drawing canvas.
// Exposes { clear, toDataURL, isEmpty } via forwardRef.
// onChange(boolean) fires whenever ink presence changes.

const { useState, useRef, useEffect, useCallback } = React;

function DrawingCanvas({ onChange }, ref) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const last      = useRef(null);
  const [hasInk, setHasInk] = useState(false);

  const reset = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    setHasInk(false);
    onChange && onChange(false);
  }, [onChange]);

  useEffect(() => { reset(); }, [reset]);

  React.useImperativeHandle(ref, () => ({
    clear:     reset,
    toDataURL: () => canvasRef.current?.toDataURL('image/png'),
    isEmpty:   () => !hasInk,
  }), [reset, hasInk]);

  const getPos = (e) => {
    const c    = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const t    = e.touches?.[0] ?? e;
    return {
      x: (t.clientX - rect.left) / rect.width  * c.width,
      y: (t.clientY - rect.top)  / rect.height * c.height,
    };
  };

  const handleStart = (e) => {
    e.preventDefault();
    drawing.current = true;
    last.current    = getPos(e);
  };

  const handleMove = (e) => {
    if (!drawing.current) return;
    e.preventDefault();

    const ctx = canvasRef.current.getContext('2d');
    const p   = getPos(e);

    ctx.strokeStyle = '#0A1B33';
    ctx.lineWidth   = 16;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    last.current = p;
    if (!hasInk) { setHasInk(true); onChange && onChange(true); }
  };

  const handleEnd = () => { drawing.current = false; last.current = null; };

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl canvas-grid pointer-events-none" />

      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="relative block w-[280px] h-[280px] rounded-2xl border border-paper-200 bg-white cursor-crosshair"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {!hasInk && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="text-ink-300 text-sm font-medium">เขียนเลขไทยตรงนี้</div>
            <div className="text-ink-300/70 text-xs mt-1 font-mono">draw a digit here</div>
          </div>
        </div>
      )}
    </div>
  );
}

const CanvasFwd = React.forwardRef(DrawingCanvas);
