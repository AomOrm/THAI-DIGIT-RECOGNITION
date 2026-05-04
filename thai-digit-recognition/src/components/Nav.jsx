// Top navigation bar with tab switcher.
function Nav({ tab, setTab }) {
  const tabs = [
    { id: 'user',    label: 'ทำนาย',       sub: 'User' },
    { id: 'collect', label: 'เก็บข้อมูล',  sub: 'Collect' },
    { id: 'admin',   label: 'จัดการโมเดล', sub: 'Admin' },
  ];

  return (
    <header className="border-b border-paper-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ink-900 text-white grid place-items-center thai-num text-base font-semibold" />
          <div className="leading-tight">
            <div className="font-semibold text-ink-900 tracking-tight">Thai Digit Recognizer</div>
            <div className="text-[11px] text-ink-500 font-mono uppercase tracking-wider">
              CS462 · ML Coursework
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <nav className="flex items-center bg-paper-100 rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 h-9 rounded-md text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-white shadow-sm text-ink-900'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {t.label}
              <span className="ml-2 text-[10px] font-mono uppercase tracking-wider opacity-60">
                {t.sub}
              </span>
            </button>
          ))}
        </nav>

      </div>
    </header>
  );
}
