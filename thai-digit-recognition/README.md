# Thai Digit Recognizer

Web app สำหรับจดจำเลขไทยลายมือเขียน (๑๖–๒๐) ด้วย Machine Learning
สร้างด้วย React + Tailwind CSS แบบไม่ต้องมี build tool และมี Python/FastAPI backend สำหรับเก็บข้อมูล, train หลายโมเดลจาก dataset ชุดเดียว, และ inference

---

## โครงสร้างโปรเจค

```
thai-digit-recognition/
├── index.html              ← entry point (โหลดทุกไฟล์ตามลำดับ)
├── backend/                ← FastAPI endpoints + image preprocessing + model loading
├── scripts/
│   └── train_model.py      ← train classifiers จาก data/samples แล้ว export .joblib
├── data/
│   └── samples/            ← dataset ที่เก็บจากหน้าเว็บ แยกตาม label
├── models/                 ← active model + uploaded/trained model files
├── requirements.txt        ← Python dependencies
├── styles/
│   └── main.css            ← CSS หลัก: base, animations, canvas
└── src/
    ├── constants.js        ← CLASSES, ARABIC, COLLECTION_TARGET
    ├── utils/
    │   └── api.js          ← API helpers สำหรับเรียก backend
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

## วิธีรันแบบมี Backend

ติดตั้ง dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

รันแอป:

```bash
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

แล้วเปิด `http://127.0.0.1:8000`

> โปรเจคนี้ใช้ Babel Standalone โหลดไฟล์ JSX ผ่าน HTTP จึงต้องรันผ่าน local server เท่านั้น

---

## Workflow ทำ Model

1. เปิดหน้าเว็บที่ `http://127.0.0.1:8000`
2. ไปแท็บ **เก็บข้อมูล** แล้วเก็บตัวอย่างให้ครบหลายๆ class
3. train หลายโมเดลจาก dataset ชุดเดียว:

```bash
python scripts/train_model.py
```

4. สคริปต์จะบันทึกหลายไฟล์ใน `models/` และตั้งโมเดลที่ accuracy ดีสุดเป็น active
5. กลับไปแท็บ **ทำนาย** แล้วลองวาดเลขเพื่อ inference หรือไปแท็บ **จัดการโมเดล** เพื่อสลับโมเดล

สคริปต์ train จะอ่านรูปจาก `data/samples/<label>/*.png`, preprocess เป็นภาพ 28×28, train โมเดลเหล่านี้ แล้วบันทึกเป็น `.joblib`:

- `KNN`
- `SVM`
- `Random Forest`
- `Logistic Regression`
- `MLP`

ถ้าต้องการ train เฉพาะตัวเดียว:

```bash
python scripts/train_model.py --model knn
python scripts/train_model.py --model svm
python scripts/train_model.py --model random_forest
python scripts/train_model.py --model logistic_regression
python scripts/train_model.py --model mlp
```

ถ้าต้องการทดลอง train โดยไม่เขียนลง `models/`:

```bash
python scripts/train_model.py --output-dir /tmp/thai-digit-test-models
```

> เก็บ dataset แค่รอบเดียวพอ โมเดลทุกตัวใช้รูปจาก `data/samples/` ชุดเดียวกัน

---

## หน้าต่างๆ

| Tab | หน้า | ฟังก์ชัน |
|-----|------|----------|
| ทำนาย | `UserPage` | วาดเลข → กด Enter หรือปุ่ม → ดูผลทำนาย + confidence |
| เก็บข้อมูล | `CollectPage` | เลือก label → วาด → กด Enter → บันทึกตัวอย่าง |
| จัดการโมเดล | `AdminPage` | ดูโมเดลปัจจุบัน / อัปโหลดโมเดลใหม่ / สลับโมเดล |

---

## Backend API

frontend เรียก endpoint เหล่านี้ผ่าน `src/utils/api.js`:

| Method | Path | ใช้ทำอะไร |
|--------|------|-----------|
| GET | `/health` | health check |
| GET | `/model` | active model ปัจจุบัน |
| GET | `/models` | รายการโมเดลทั้งหมด |
| POST | `/models/activate` | สลับ active model |
| POST | `/predict` | ทำนายจาก canvas data URL |
| POST | `/save-sample` | บันทึกตัวอย่าง training |
| GET | `/sample-stats` | จำนวนตัวอย่างต่อ class |
| POST | `/upload-model` | อัปโหลดโมเดล `.joblib`, `.pkl`, `.h5`, `.pt` |

หมายเหตุ: backend ปัจจุบันรัน inference ได้กับ `.joblib` และ `.pkl` ที่เป็น scikit-learn model ส่วน `.h5` และ `.pt` รับอัปโหลดได้ แต่ต้องเพิ่ม runtime loader เฉพาะ TensorFlow/PyTorch ก่อนจึงจะใช้ทำนายได้

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
