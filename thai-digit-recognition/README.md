# Thai Digit Recognizer

Web app สำหรับจดจำเลขไทยลายมือเขียน (๑๖–๒๐) ด้วย Machine Learning
สร้างด้วย React + Tailwind CSS แบบไม่ต้องมี build tool

---

## โครงสร้างโปรเจค

```
thai-digit-recognition/
├── index.html              ← entry point (โหลดทุกไฟล์ตามลำดับ)
├── styles/
│   └── main.css            ← CSS หลัก: base, animations, canvas
└── src/
    ├── constants.js        ← CLASSES, ARABIC, COLLECTION_TARGET
    ├── utils/
    │   └── mockApi.js      ← mock functions (แทนที่ด้วย fetch จริง)
    ├── components/
    │   ├── Nav.jsx         ← top navigation + tab switcher
    │   ├── DrawingCanvas.jsx ← canvas วาดเลข (expose ref)
    │   ├── ProbBar.jsx     ← probability bar แต่ละ class
    │   ├── Toast.jsx       ← notification popup
    │   └── Stat.jsx        ← stat cell เล็กๆ
    ├── pages/
    │   ├── UserPage.jsx    ← หน้าทำนาย (Inference)
    │   ├── CollectPage.jsx ← หน้าเก็บ dataset
    │   └── AdminPage.jsx   ← หน้าจัดการโมเดล
    └── App.jsx             ← root component + ReactDOM.render
```

---

## วิธีรัน

โปรเจคนี้ใช้ Babel Standalone โหลดไฟล์ JSX ผ่าน HTTP
**ต้องรันผ่าน local server เท่านั้น** (เปิดตรงจาก `file://` จะไม่ทำงาน)

### วิธีที่ 1 — VS Code Live Server
ติดตั้ง extension **Live Server** แล้วคลิกขวาที่ `index.html` → **Open with Live Server**

### วิธีที่ 2 — Python
```bash
python -m http.server 8000
```
แล้วเปิด `http://localhost:8000`

### วิธีที่ 3 — Node.js
```bash
npx serve .
```

---

## หน้าต่างๆ

| Tab | หน้า | ฟังก์ชัน |
|-----|------|----------|
| ทำนาย | `UserPage` | วาดเลข → กด Enter หรือปุ่ม → ดูผลทำนาย + confidence |
| เก็บข้อมูล | `CollectPage` | เลือก label → วาด → กด Enter → บันทึกตัวอย่าง |
| จัดการโมเดล | `AdminPage` | ดูโมเดลปัจจุบัน / อัปโหลดโมเดลใหม่ / สลับโมเดล |

---

## เชื่อมต่อ Backend จริง

ตอนนี้ทุก API call เป็น mock อยู่ใน `src/utils/mockApi.js`
เมื่อ backend พร้อม ให้แทนที่แต่ละฟังก์ชันด้วย `fetch()` จริง:

```js
// src/utils/mockApi.js

async function mockPredict(dataUrl) {
  const res = await fetch('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl }),
  });
  return res.json();
}

async function mockSaveSample(label, dataUrl) {
  await fetch('/save-sample', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl, label }),
  });
  return (await fetch('/sample-stats')).json();
}

async function mockUploadModel(file) {
  const fd = new FormData();
  fd.append('model', file);
  await fetch('/upload-model', { method: 'POST', body: fd });
}
```

แต่ละ page ที่เรียกใช้ mock function อยู่แล้ว ไม่ต้องแก้ที่อื่น

---

## เพิ่ม Component ใหม่

1. สร้างไฟล์ใน `src/components/YourComponent.jsx`
2. เพิ่ม `<script type="text/babel" ...>` ใน `index.html` ก่อน `App.jsx`
3. ใช้ global `React` และ hook ผ่าน destructuring:
   ```jsx
   const { useState, useEffect } = React;
   ```

---

## Tech Stack

| เทคโนโลยี | เวอร์ชัน | หมายเหตุ |
|-----------|---------|----------|
| React | 18.3.1 | CDN (UMD) |
| Babel Standalone | 7.29.0 | JSX transform in-browser |
| Tailwind CSS | CDN | custom tokens ใน `index.html` |
| Google Fonts | — | Sarabun + JetBrains Mono |

> หากโปรเจคโตขึ้น แนะนำย้ายไป **Vite + React** เพื่อ HMR, bundling, และ TypeScript
