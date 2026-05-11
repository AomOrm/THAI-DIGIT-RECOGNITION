// Model management page: view the active model, upload a new one, and activate historical models.
function AdminPage({ modelInfo, setModelInfo }) {
  const { useState, useRef, useEffect } = React;

  const [pending,  setPending]  = useState(null); // { file }
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast,    setToast]    = useState(null);
  const [history,  setHistory]  = useState([]);
  const inputRef = useRef(null);

  const showToast = (kind, msg) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const ALLOWED_EXTENSIONS = ['.h5', '.pkl', '.joblib', '.pt'];
  const MAX_SIZE_MB = 50;

  const refreshModels = async () => {
    const data = await apiLoadModels();
    setModelInfo(data.active);
    setHistory(data.models.filter((m) => m.name !== data.active.name));
  };

  useEffect(() => {
    refreshModels().catch(() => showToast('error', 'โหลดรายการโมเดลไม่สำเร็จ'));
  }, []);

  const validateFile = (file) => {
    const isValidType = ALLOWED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    if (!isValidType) {
      showToast('error', 'ไฟล์ไม่รองรับ — ใช้ .h5, .pkl, .joblib หรือ .pt');
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast('error', `ไฟล์ใหญ่เกิน ${MAX_SIZE_MB} MB`);
      return false;
    }
    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) return;
    setPending({ file });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const confirmUpload = async () => {
    if (!pending) return;
    setUploading(true);
    try {
      const newInfo = await apiUploadModel(pending.file);
      setModelInfo(newInfo);
      await refreshModels();
      setPending(null);
      showToast('ok', `เปลี่ยนโมเดลเป็น ${newInfo.name} แล้ว`);
    } catch (err) {
      showToast('error', err.message || 'อัปโหลดล้มเหลว');
    } finally {
      setUploading(false);
    }
  };

  const activate = async (m) => {
    try {
      const next = await apiActivateModel(m.name);
      setModelInfo(next);
      await refreshModels();
      showToast('ok', `เปิดใช้งานโมเดล ${m.name}`);
    } catch (err) {
      showToast('error', err.message || 'เปิดใช้งานโมเดลไม่สำเร็จ');
    }
  };

  // Color-codes accuracy: green ≥ 90 %, neutral ≥ 80 %, amber below.
  const accColor = (a) =>
    a == null ? 'text-ink-300' : a >= 0.9 ? 'text-emerald-600' : a >= 0.8 ? 'text-ink-900' : 'text-amber-600';
  const accText = (a) => a == null ? '-' : `${(a * 100).toFixed(1)}%`;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Page header */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-ink-500 mb-2">
          03 · Model Management
        </div>
        <h1 className="text-3xl font-semibold text-ink-900 tracking-tight">จัดการโมเดล</h1>
        <p className="text-ink-500 mt-1.5">
          อัปโหลดโมเดลใหม่และสลับโมเดลที่ใช้งานได้แบบ hot-swap
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Current model card */}
        <section className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-xs font-mono uppercase tracking-wider text-ink-500">current model</div>
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              active
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-ink-900 grid place-items-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-ink-900 truncate">{modelInfo.name}</div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-paper-200">
                <Stat label="Accuracy" value={accText(modelInfo.accuracy)} highlight={accColor(modelInfo.accuracy)} />
                <Stat label="Size"     value={`${modelInfo.size} KB`} />
                <Stat label="Uploaded" value={modelInfo.date} mono />
              </div>
            </div>
          </div>
        </section>

        {/* Upload card */}
        <section className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-xs font-mono uppercase tracking-wider text-ink-500">upload new model</div>
            <div className="text-[11px] font-mono text-ink-300">.h5 · .pkl · .joblib · .pt</div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              dragOver
                ? 'border-ink-900 bg-paper-100'
                : 'border-paper-200 hover:border-ink-500 hover:bg-paper-50'
            }`}
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-paper-100 grid place-items-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F2A4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-sm font-medium text-ink-900">ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</div>
            <div className="text-xs text-ink-500 mt-1 font-mono">max {MAX_SIZE_MB} MB</div>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {/* Pending confirmation */}
          {pending && (
            <div className="mt-4 border border-paper-200 rounded-xl p-4 fade-pop">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm text-ink-900 truncate">{pending.file.name}</div>
                  <div className="text-xs text-ink-500 mt-0.5 font-mono">
                    {(pending.file.size / 1024).toFixed(0)} KB
                  </div>
                </div>
                <button
                  onClick={() => setPending(null)}
                  className="text-ink-300 hover:text-ink-900 text-sm"
                  aria-label="cancel"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={confirmUpload}
                  disabled={uploading}
                  className="flex-1 h-10 rounded-lg bg-ink-900 text-white text-sm font-medium hover:bg-ink-800 active:scale-[.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      กำลังอัปโหลด…
                    </>
                  ) : 'ยืนยันการเปลี่ยนโมเดล'}
                </button>

                <button
                  onClick={() => setPending(null)}
                  className="h-10 px-4 rounded-lg bg-paper-100 hover:bg-paper-200 text-ink-900 text-sm font-medium"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Model history table */}
      <section className="mt-6 bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-paper-200 flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-500">model history</div>
          <div className="text-xs font-mono text-ink-300">{history.length} previous</div>
        </div>

        {history.length === 0 ? (
          <div className="px-6 py-10 text-center text-ink-500 text-sm">ยังไม่มีโมเดลในประวัติ</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-mono uppercase tracking-wider text-ink-500 border-b border-paper-200">
                <th className="text-left  px-6 py-3 font-medium">file</th>
                <th className="text-left  px-6 py-3 font-medium">uploaded</th>
                <th className="text-right px-6 py-3 font-medium">accuracy</th>
                <th className="text-right px-6 py-3 font-medium">size</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {history.map((m, i) => (
                <tr key={m.name + i} className="border-b border-paper-200 last:border-b-0 hover:bg-paper-50 transition">
                  <td className="px-6 py-3 font-mono text-sm text-ink-900">{m.name}</td>
                  <td className="px-6 py-3 font-mono text-sm text-ink-500">{m.date}</td>
                  <td className={`px-6 py-3 text-right font-mono text-sm tabular-nums ${accColor(m.accuracy)}`}>
                    {accText(m.accuracy)}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-sm text-ink-500 tabular-nums">
                    {m.size} KB
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => activate(m)}
                      className="text-sm px-3 h-8 rounded-md bg-paper-100 hover:bg-ink-900 hover:text-white text-ink-900 font-medium transition"
                    >
                      activate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Toast toast={toast} />
    </div>
  );
}
