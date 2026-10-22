# mm-analytics

A zero-knowledge, zero-liability business intelligence and analytics platform engineered specifically for users of **Money Manager (iOS)**.

Drop your standard `.xlsx` export files directly from your phone or Mac into the web app to unlock forward-looking financial intelligence with zero tracking, zero server telemetry, and 100% client-side execution.

---

## 🌟 Key Features

1. **Monthly Budget Pacing (Burn Rate Velocity):**
   - Live tracking of day-of-month spend velocity vs. linear benchmark.
   - Status indicators (`Under Pacing`, `On Track`, `Over Pacing`, `Critical`) and projected end-of-month spend.
2. **True Net Cash Flow & Savings Rate:**
   - Isolated internal transfers (`Transfer-In`, `Transfer-Out`) preventing artificial expense and income inflation.
   - Formula: `((True Income - True Expenses) / True Income) * 100`.
3. **Cumulative Spending Trajectory:**
   - High-contrast Recharts visualization plotting daily cumulative burn (Days 1–31) against ideal straight-line budget targets.
4. **Category & Subcategory Breakdown:**
   - Interactive drilldown into lifestyle groupings and granular child classifications.
5. **Smart Subscription / Recurring Bill Detection:**
   - Heuristic detector automatically flagging line items repeating across months with identical notes and amounts (Netflix, Spotify, broadband, rent, gym).
6. **High-Density Searchable Ledger:**
   - Client-side filtering by Account, Category, Type, Date, and instant full-text search.
7. **Dual-Tier Persistence:**
   - **Tier 1 (Default):** Local browser IndexedDB via Dexie.js + one-click JSON backup & restore.
   - **Tier 2 (BYOC):** Direct Google Drive synchronization via `drive.file` scope without any intermediate server.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with minimal slate palette
- **Local Storage:** [Dexie.js](https://dexie.org/) (IndexedDB wrapper with multi-indexes & live reactivity)
- **Ingestion:** [SheetJS (`xlsx`)](https://sheetjs.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Crypto:** Native Web Crypto API (`crypto.subtle` SHA-256) for deterministic transaction deduplication

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on v22)
- npm or pnpm

### Installation
```bash
git clone https://github.com/Aliff00/mm-analytics.git
cd mm-analytics
npm install
```

### Development Server
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## 🔒 Privacy & Zero-Knowledge Guarantee

All transaction processing, hashing, aggregations, and rendering execute entirely inside the browser's sandbox. No financial data is ever transmitted to an external server.
