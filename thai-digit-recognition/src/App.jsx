// Root component — owns shared state (active tab, active model info).
function App() {
  const { useState } = React;

  const [tab, setTab] = useState('user');
  const [modelInfo, setModelInfo] = useState({
    name:     'cnn_v3.h5',
    date:     '2026-04-28',
    accuracy: 0.921,
    size:     1248,
  });

  return (
    <div className="min-h-screen">
      <Nav tab={tab} setTab={setTab} />

      {tab === 'user'    && <UserPage    modelInfo={modelInfo} />}
      {tab === 'collect' && <CollectPage />}
      {tab === 'admin'   && <AdminPage   modelInfo={modelInfo} setModelInfo={setModelInfo} />}

      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-xs font-mono text-ink-300">
        thai-digit-recognizer · prototype · backend mocked
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
