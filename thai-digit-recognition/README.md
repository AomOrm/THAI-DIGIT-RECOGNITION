# Thai Digit Recognition

เว็บแอปสำหรับจดจำเลขไทยลายมือเขียนกลุ่ม `๑๖`, `๑๗`, `๑๘`, `๑๙`, `๒๐` โดยใช้ React ฝั่งหน้าเว็บ และ Python/FastAPI ฝั่ง backend สำหรับรับรูปจาก canvas, บันทึกตัวอย่าง, train โมเดล และทำนายผลจากโมเดลที่ active อยู่

โปรเจกต์นี้ไม่มี `package.json` และไม่ต้องใช้ `npm install` เพราะ frontend ใช้ React, ReactDOM, Babel และ Tailwind ผ่าน CDN

## สิ่งที่ต้องมี

- Python 3.10 ขึ้นไป แนะนำ Python 3.11 หรือ 3.12
- `pip` สำหรับติดตั้ง dependencies
- Browser เช่น Chrome, Edge, Firefox หรือ Safari
- อินเทอร์เน็ตตอนเปิดหน้าเว็บครั้งแรก เพราะ frontend โหลด library และ font ผ่าน CDN

## โครงสร้างโปรเจกต์

```text
thai-digit-recognition/
├── index.html              # หน้าเว็บหลัก โหลด React/JSX ผ่าน CDN
├── requirements.txt        # Python dependencies
├── backend/
│   ├── app.py              # FastAPI app และ API endpoints
│   ├── config.py           # path, classes, model suffix config
│   ├── image_utils.py      # แปลงรูปจาก canvas เป็น feature 28x28
│   └── model_store.py      # โหลด/บันทึก/สลับ active model
├── scripts/
│   └── train_model.py      # train KNN, SVM, Random Forest, Logistic Regression, MLP
├── src/
│   ├── App.jsx
│   ├── constants.js
│   ├── components/
│   ├── pages/
│   └── utils/api.js
├── styles/
│   └── main.css
├── data/
│   └── samples/            # รูปตัวอย่างที่เก็บจากหน้าเว็บ แยกตาม label
├── models/                 # โมเดล .joblib และ active_model.json
└── reports/                # รายงาน/กราฟผลการ train
```

## วิธีรันแบบละเอียด

### 1. เข้าโฟลเดอร์โปรเจกต์

ถ้าอยู่ที่ root repo ให้รัน:

```bash
cd thai-digit-recognition
```

ถ้าเปิด terminal อยู่ในโฟลเดอร์นี้แล้ว ให้ข้ามขั้นตอนนี้ได้

เช็กว่ามาถูกที่แล้ว:

```bash
ls
```

ควรเห็นไฟล์/โฟลเดอร์เช่น `backend`, `src`, `models`, `requirements.txt`, `index.html`

### 2. สร้าง Python virtual environment

macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

หลัง activate แล้ว terminal ควรมี `(.venv)` นำหน้าบรรทัดคำสั่ง

### 3. ติดตั้ง dependencies

```bash
pip install -r requirements.txt
```

dependencies หลักที่ใช้:

- `fastapi` สำหรับ backend API
- `uvicorn` สำหรับรัน local server
- `pillow` สำหรับอ่าน/ประมวลผลรูปภาพ
- `numpy` สำหรับจัดการ feature array
- `scikit-learn` สำหรับ train และ inference
- `joblib` สำหรับ save/load โมเดล

### 4. รัน backend และ frontend

รันคำสั่งนี้จากในโฟลเดอร์ `thai-digit-recognition/`:

```bash
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

ถ้ารันสำเร็จจะเห็น log ประมาณนี้:

```text
Uvicorn running on http://127.0.0.1:8000
```

จากนั้นเปิด browser ไปที่:

```text
http://127.0.0.1:8000
```

เหตุผลที่ต้องเปิดผ่าน `uvicorn` คือ backend mount `index.html` และไฟล์ static ทั้งหมดผ่าน FastAPI ไว้แล้ว หน้าเว็บจึงเรียก API ด้วย path เช่น `/predict`, `/models`, `/save-sample` ได้ตรงๆ

ห้ามเปิด `index.html` ด้วยการ double click โดยตรง เพราะ browser จะเปิดเป็น `file://...` ทำให้ JSX, path และ API call ทำงานไม่ครบ

### 5. เช็กว่า backend ทำงาน

เปิดอีก terminal หนึ่ง แล้วรัน:

```bash
curl http://127.0.0.1:8000/health
```

ผลที่ควรได้:

```json
{"ok":true}
```

เช็ก active model:

```bash
curl http://127.0.0.1:8000/model
```

ในโปรเจกต์นี้มีโมเดลที่ train แล้วอยู่ใน `models/` และมี `models/active_model.json` ระบุโมเดลที่ใช้งานอยู่

## วิธีใช้งานหน้าเว็บ

### แท็บทำนาย

1. เปิด `http://127.0.0.1:8000`
2. ไปที่แท็บ `ทำนาย`
3. วาดเลขไทยหนึ่งตัวใน canvas เช่น `๑๖` หรือ `๒๐`
4. กดปุ่มทำนาย หรือกด `Enter`
5. ระบบจะแสดงผลทำนาย, confidence และ probability ของแต่ละ class

ถ้าขึ้น error ว่ายังไม่มีโมเดล active ให้ไปที่แท็บ `จัดการโมเดล` เพื่อตรวจสอบโมเดล หรือ train โมเดลใหม่ตามขั้นตอนด้านล่าง

### แท็บเก็บข้อมูล

ใช้สำหรับเพิ่ม dataset:

1. เลือก label ที่ต้องการเก็บ เช่น `๑๖`
2. วาดเลขใน canvas
3. กดบันทึก หรือกด `Enter`
4. รูปจะถูกบันทึกไปที่ `data/samples/<label>/`

ตัวอย่าง:

```text
data/samples/๑๖/20260511105120962584.png
data/samples/๒๐/20260511161013994272.png
```

แนะนำให้เก็บหลายตัวอย่างต่อ class และเก็บให้จำนวนใกล้เคียงกัน เพื่อให้ train ได้สมดุลขึ้น

### แท็บจัดการโมเดล

ใช้สำหรับ:

- ดู active model ปัจจุบัน
- ดูรายการโมเดลทั้งหมดใน `models/`
- สลับ active model
- อัปโหลดไฟล์โมเดลใหม่

backend รองรับการรัน inference กับไฟล์ `.joblib` และ `.pkl` ที่เป็น scikit-learn model ส่วน `.h5` และ `.pt` รับอัปโหลดได้ แต่ยังต้องเพิ่ม runtime loader สำหรับ TensorFlow/PyTorch ก่อนจึงจะใช้ทำนายจริงได้

## วิธี train โมเดล

สคริปต์ train อ่านรูปจาก:

```text
data/samples/<label>/*.png
```

แล้ว preprocess เป็นภาพ 28x28 จากนั้น train โมเดล scikit-learn และบันทึกลง `models/`

### Train ทุกโมเดล

```bash
python scripts/train_model.py
```

โมเดลที่ train:

- KNN
- SVM
- Random Forest
- Logistic Regression
- MLP

เมื่อ train เสร็จ สคริปต์จะ:

1. แสดง accuracy ของแต่ละโมเดล
2. save ไฟล์ `.joblib` ลงใน `models/`
3. save metadata เป็น `.joblib.json`
4. เลือกโมเดลที่ accuracy สูงสุดเป็น active model โดยเขียนลง `models/active_model.json`

### Train เฉพาะโมเดลเดียว

```bash
python scripts/train_model.py --model knn
python scripts/train_model.py --model svm
python scripts/train_model.py --model random_forest
python scripts/train_model.py --model logistic_regression
python scripts/train_model.py --model mlp
```

### Train โดยไม่ทำ data augmentation

```bash
python scripts/train_model.py --no-augment
```

ปกติสคริปต์จะ augment รูปด้วยการเลื่อนภาพเล็กน้อย เพื่อช่วยให้โมเดลทนต่อการวาดเยื้องตำแหน่ง หากต้องการ train จากรูปจริงเท่านั้นให้ใช้ `--no-augment`

### ปรับขนาด test set

```bash
python scripts/train_model.py --test-size 0.2
```

ค่า default คือ `0.25` หมายถึงใช้ข้อมูล 25% เป็น test set ถ้าข้อมูลยังน้อยมาก สคริปต์อาจใช้ training set เดิมในการรายงาน accuracy และจะแสดง warning

### ทดลอง train โดยไม่เขียนทับ models หลัก

```bash
python scripts/train_model.py --output-dir /tmp/thai-digit-test-models
```

กรณีนี้ active model จะไม่ถูกเปลี่ยน เพราะ output ไม่ได้อยู่ใน `models/`

### กำหนด output file สำหรับโมเดลเดียว

```bash
python scripts/train_model.py --model svm --output /tmp/thai_digit_svm_test.joblib
```

ใช้ `--output` ได้เฉพาะตอน train โมเดลเดียวเท่านั้น ถ้าใช้กับ `--model all` สคริปต์จะหยุดพร้อม error

## API ที่ใช้ในระบบ

| Method | Path | หน้าที่ |
| --- | --- | --- |
| `GET` | `/health` | ตรวจว่า backend ทำงาน |
| `GET` | `/model` | ดู active model |
| `GET` | `/models` | ดูรายการโมเดลทั้งหมด |
| `POST` | `/models/activate` | สลับ active model |
| `POST` | `/predict` | ทำนายจากรูป canvas แบบ data URL |
| `POST` | `/save-sample` | บันทึกตัวอย่างใหม่ |
| `GET` | `/sample-stats` | ดูจำนวนตัวอย่างแต่ละ class |
| `POST` | `/upload-model` | อัปโหลดโมเดล |

ตัวอย่างสลับ active model:

```bash
curl -X POST http://127.0.0.1:8000/models/activate \
  -H "Content-Type: application/json" \
  -d '{"name":"thai_digit_logistic_regression.joblib"}'
```

## เพิ่ม Component ใหม่

1. สร้างไฟล์ใน `src/components/YourComponent.jsx`
2. เพิ่ม `<script type="text/babel" data-presets="react" src="src/components/YourComponent.jsx"></script>` ใน `index.html` ก่อน `src/App.jsx`
3. ใช้ global `React` และ destructure hook ที่ต้องใช้ เช่น:

```jsx
const { useState, useEffect } = React;
```

ไฟล์ใน `index.html` ต้องเรียงลำดับให้ dependency ถูกต้อง เช่น constants และ API helpers ต้องโหลดก่อน component/page ที่เรียกใช้

## การปิด server

กลับไปที่ terminal ที่รัน `uvicorn` แล้วกด:

```text
Ctrl + C
```

ถ้าต้องการออกจาก virtual environment:

```bash
deactivate
```

## ปัญหาที่พบบ่อย

### เปิดหน้าเว็บแล้วว่าง หรือ React/Tailwind ไม่โหลด

โปรเจกต์โหลด library ผ่าน CDN ตรวจสอบว่าเครื่องต่ออินเทอร์เน็ตอยู่ แล้ว refresh หน้าเว็บอีกครั้ง

### เปิด `index.html` แล้ว API ไม่ทำงาน

ต้องเปิดผ่าน local server:

```bash
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

แล้วเข้า `http://127.0.0.1:8000`

### ขึ้น `ModuleNotFoundError`

มักเกิดจากยังไม่ได้ activate venv หรือติดตั้ง dependencies ไม่ครบ:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

บน Windows ใช้:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Port 8000 ถูกใช้งานอยู่

เปลี่ยน port ได้ เช่น:

```bash
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8001
```

แล้วเปิด:

```text
http://127.0.0.1:8001
```

### Train ไม่ได้เพราะข้อมูลน้อย

ต้องมีข้อมูลอย่างน้อย 2 class ก่อน train และควรมีอย่างน้อย class ละหลายตัวอย่าง ถ้าข้อมูลแต่ละ class น้อยหรือไม่สมดุล accuracy จะไม่น่าเชื่อถือ

### ทำนายแล้วผลไม่ดี

ลองทำตามนี้:

- เก็บตัวอย่างเพิ่มในแท็บ `เก็บข้อมูล`
- เก็บให้ครบทุก class และจำนวนใกล้เคียงกัน
- วาดให้เต็ม canvas และมีลักษณะหลากหลาย
- train ใหม่ด้วย `python scripts/train_model.py`
- ลองสลับ active model ในแท็บ `จัดการโมเดล`

## Tech Stack

| เทคโนโลยี | เวอร์ชัน/รูปแบบ | หมายเหตุ |
| --- | --- | --- |
| React | 18.3.1 CDN UMD | ใช้ผ่าน global `React` |
| ReactDOM | 18.3.1 CDN UMD | mount app ใน `src/App.jsx` |
| Babel Standalone | 7.29.0 CDN | แปลง JSX ใน browser |
| Tailwind CSS | CDN | config อยู่ใน `index.html` |
| FastAPI | ดูใน `requirements.txt` | backend API |
| scikit-learn | ดูใน `requirements.txt` | train/inference |

## คำสั่งสรุปสำหรับรันเร็ว

ถ้าเคยติดตั้ง dependencies แล้ว:

```bash
source .venv/bin/activate
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

แล้วเปิด:

```text
http://127.0.0.1:8000
```

ถ้ายังไม่เคย setup:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

---

## สมาชิกในกลุ่ม

| ชื่อ | รหัสนักศึกษา | หน้าที่ |
|------|--------------|---------|
| นายชัยวัฒน์ บรรลือศักดิ์ | 1660704337 | Dev and Train Model AI |
| นางสาวพัชราภรณ์ สกุลณีย์ | 1660705417 | Dev and Train Model AI |
| นายพีรวุฒิ นุชเกิด | 1660707660 | Dev and Train Model AI |
| นางสาวศุภมา สงิ้วงาม | 1660707231 | Dev and Train Model AI |
| นางสาวพรรณปพร ลีลาเกียรติวงศ์ | 1660705177 | Presentation and Report |
| นายชลนที ทัศนสนติ | 1660706423 | Presentation and Report |
