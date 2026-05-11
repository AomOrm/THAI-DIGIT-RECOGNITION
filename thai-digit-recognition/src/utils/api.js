// API helpers for the Python backend.

async function apiJson(path, options = {}) {
  const res = await fetch(path, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new Error(data?.detail || `Request failed: ${res.status}`);
  }
  return data;
}

function normalizeModelInfo(model) {
  return {
    name:     model?.name || 'no_model',
    date:     model?.date || '-',
    accuracy: typeof model?.accuracy === 'number' ? model.accuracy : null,
    size:     model?.size || 0,
    runnable: Boolean(model?.runnable),
  };
}

async function apiPredict(dataUrl) {
  return apiJson('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl }),
  });
}

async function apiSaveSample(label, dataUrl) {
  return apiJson('/save-sample', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl, label }),
  });
}

async function apiLoadSampleStats() {
  return apiJson('/sample-stats');
}

async function apiLoadModel() {
  return normalizeModelInfo(await apiJson('/model'));
}

async function apiLoadModels() {
  const data = await apiJson('/models');
  return {
    active: normalizeModelInfo(data.active),
    models: (data.models || []).map(normalizeModelInfo),
  };
}

async function apiActivateModel(name) {
  return normalizeModelInfo(await apiJson('/models/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }));
}

async function apiUploadModel(file) {
  const fd = new FormData();
  fd.append('model', file);
  return normalizeModelInfo(await apiJson('/upload-model', {
    method: 'POST',
    body: fd,
  }));
}
