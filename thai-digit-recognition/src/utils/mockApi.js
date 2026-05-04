// Mock implementations of the backend endpoints.
// Replace each function body with a real fetch() call once the backend is ready.
// The commented-out real implementations are included as a guide.

function mockPredict() {
  // Real call:
  // const res  = await fetch('/predict', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ image: dataUrl }),
  // });
  // return res.json();

  const logits  = CLASSES.map(() => Math.random());
  const winner  = Math.floor(Math.random() * CLASSES.length);
  logits[winner] += 1.5 + Math.random() * 1.2;

  const exps  = logits.map(Math.exp);
  const sum   = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((x) => x / sum);
  const idx   = probs.indexOf(Math.max(...probs));

  return {
    prediction: CLASSES[idx],
    confidence: probs[idx],
    all_probs:  Object.fromEntries(CLASSES.map((c, i) => [c, probs[i]])),
  };
}

function mockSaveSample(label, stats) {
  // Real call:
  // await fetch('/save-sample', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ image: dataUrl, label }),
  // });
  // return (await fetch('/sample-stats')).json();

  return { ...stats, [label]: (stats[label] || 0) + 1 };
}

function mockUploadModel(file) {
  // Real call:
  // const fd = new FormData();
  // fd.append('model', file);
  // await fetch('/upload-model', { method: 'POST', body: fd });

  const accuracy = 0.78 + Math.random() * 0.18;
  return {
    name:     file.name,
    date:     new Date().toISOString().slice(0, 10),
    accuracy,
    size:     Math.round(file.size / 1024),
  };
}
