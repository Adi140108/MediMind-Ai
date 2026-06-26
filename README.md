# 🧠 MediMind AI — Intelligent Health Companion

MediMind AI is a high-fidelity, premium, responsive multi-page clinical wellness suite built to assist patients with local AI-powered symptom analysis, secure medical records extraction, vitals logging, and specialist consultations.

The project features a sleek, Vercel-inspired glassmorphic interface styled with custom vanilla CSS design tokens, dynamic micro-interactions, and a client-side database model powered by `sessionStorage`.

---

## ✨ Features

### 1. 🔍 Live Symptom Checker & Advice
* **Dynamic Search**: Input symptoms (e.g. headache, fever, cough) to fetch instant AI clinical assessment advice.
* **Clinical Advice Card**: Displays diagnostic summaries, severity indicators, primary recommendations, and OTC medication schedules.
* **Responsive Layouts**: Designed to load advice panels only after a search is executed, eliminating layout leaks.

### 2. 📊 Vitals Dashboard & Manual Logger
* **Vitals Indicators**: High-fidelity cards tracking Heart Rate (BPM), Blood Pressure (mmHg), Blood Sugar (mg/dL), and Blood Oxygen (SpO2 %).
* **Log Vitals Modal**: Supports dual-mode vitals ingestion:
  * **Manual Logging Form**: Enter new numbers to recalculate ranges, update indicators, evaluate clinical assessments, and log history.
  * **File Ingestion**: Drag & drop CSV or JSON files (from smartwatches or clinical exports) to simulate log parsing.
* **Static Baseline Vitals**: Automatic drift generators are disabled to ensure all numbers reflect exact, unadulterated patient uploads.

### 3. 📅 Specialist Booking Portal
* **Physician Grid**: Interactive profiles detailing experience, ratings, and active schedules.
* **Category Filters**: Instant category selection (Pulmonology, Cardiology, Neurology, Endocrinology) alongside a client-side search bar.
* **E2E Ticket Generation**: Select active consultation slots, review safety declarations, and generate tickets containing reference codes (e.g. `Ref: MM-TX-10934`).

### 4. 🔒 Secure Medical Records Vault
* **Drag-and-Drop OCR Sandbox**: Ingest lab reports (PDF, JPG, PNG). Simulates a sandboxed decryption and extraction pipeline.
* **Interactive Biometrics**: Linked list-inspector. Clicking ingested reports dynamically updates the biometrics table (Hemoglobin, WBC, TSH, Cholesterol).
* **Document Inspector**: Double-click archive files to launch modal previews showing raw extracted OCR logs, meta-stamps, and deletion controls.
* **AI Health Synthesis**: Aggregate medical logs to generate a comprehensive AI summary complete with progress scores (94%), clinical action items, and secure sharing utilities.

---

## 🛠️ Architecture & Tech Stack

* **Front-end Structure**: [Astro](https://astro.build/) framework templates for component modularity.
* **Branding & Assets**: Custom logo cropped to transparent PNG (`public/logo.png`) and transparent multi-resolution favicon (`public/favicon.ico`, `public/favicon.svg`).
* **Design System**: Vanilla CSS utility classes, glassmorphism layouts, Inter/JetBrains fonts, and custom HSL variables declared in `src/styles/global.css`.
* **State Management**: Zero database overhead—all appointment tickets, vault files, and vitals logs sync dynamically across pages via standard browser `sessionStorage`.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Astro Templates
The project uses a custom compilation script (`compile-preview.cjs`) to compile page templates, inline headers/footers, purge TypeScript types, and output standard ES6 browser-compatible assets to `dist/`.
```bash
node compile-preview.cjs
```

### 3. Start Local Host server
Serve the compiled files on a local server (default port: `3000`).
```bash
node serve-preview.cjs
```
Open [http://localhost:3000/](http://localhost:3000/) in your browser.

---

## 📁 Repository Layout
```text
/
├── .agents/                 # Custom behavioral config & guidelines
├── public/                  # Static assets (logo, icons, favicon)
├── src/
│   ├── assets/              # Default template graphics
│   ├── components/          # Astro reusable elements (Header, Hero, Footer, etc.)
│   ├── layouts/             # Astro Layout wrapper
│   ├── pages/               # Page templates (index, dashboard, doctors, records)
│   └── styles/              # global.css design system
├── compile-preview.cjs      # Multi-page compiler script
├── serve-preview.cjs        # Static HTTP local server script
├── package.json             # Core scripts & node dependencies
└── tsconfig.json            # Editor TypeScript support
```
