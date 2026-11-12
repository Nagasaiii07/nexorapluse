# NEXUS — Logistics Intelligence Platform

[![Vercel Deployment Ready](https://img.shields.io/badge/Vercel-Deployment%20Ready-black?style=flat&logo=vercel)](https://vercel.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=flat&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Neon%20%2F%20Supabase-4169E1?style=flat&logo=postgresql)](https://neon.tech)
[![Event-Driven](https://img.shields.io/badge/Architecture-Event--Driven-blueviolet?style=flat)]()

**NEXUS Logistics Intelligence** is an enterprise, event-driven supply chain and e-commerce analytics platform designed to model, monitor, and optimize multi-channel order fulfillment across **Amazon India** and **Flipkart**.

Every user action—such as filtering by platform, uploading new CSV/JSON order logs, or updating shipment milestones—dispatches an event through the central **Python Event Bus**, recalculates core business metrics (GMV, realized profit, delivery success rate, state rankings), and streams the updated intelligence to the user interface in real time.

---

## 🎨 Master Visual Design Reference

NEXUS reproduces the exact enterprise design language of the master specification:
- **Dark Navy Sidebar (`#0d1527`)** with geometric gradient logo, 10 primary operational modules, real-time connection status indicator, and user profile card (`RD - Raghav Dev, Admin`).
- **Clean Workspace (`#f8fafc`)** with crisp typography, card borders (`#e2e8f0`), and restrained status color palettes.
- **Top Control Bar** with global search across orders and tracking IDs, date range filter (`Last 30 Days`), platform filter (`All Platforms`, `Amazon`, `Flipkart`), manual refresh, and active notification alerts.
- **12 Primary Executive KPI Cards** with trend direction indicators, growth percentages, and mini SVG sparklines.
- **Dual Spline Revenue & Profit Trend Chart** with gradient fills, callout value pins (`₹14.8L` & `₹3.2L`), and Daily/Weekly/Monthly toggle.
- **Order Status Overview Donut** with 8,426 total orders centered and percentage breakdowns.
- **Top States by Revenue** featuring an interactive India choropleth map and ranked state progress bars.
- **Recent Orders Table** with live status badges (`Delivered`, `Shipped`, `Processing`, `Cancelled`, `Returned`).

---

## 🏗️ Project Architecture & Monorepo Structure

```
nexus-logistics/
│
├── frontend/                     # Next.js 15 App Router Frontend
│   ├── app/
│   │   ├── layout.tsx            # Global layout with enterprise navy sidebar
│   │   ├── globals.css           # Tailwind custom styling & scrollbars
│   │   ├── page.tsx              # Executive Overview (Master View)
│   │   ├── orders/page.tsx       # Orders Management & lifecycle actions
│   │   ├── shipments/page.tsx    # Live Courier Tracking & SLA Matrix
│   │   ├── revenue/page.tsx      # Revenue & Profit Unit Economics
│   │   ├── geography/page.tsx    # Geographic Analytics (India Map)
│   │   ├── platforms/page.tsx    # Amazon vs Flipkart Benchmark
│   │   ├── events/page.tsx       # Live Event Monitoring & Bus Telemetry
│   │   ├── data/page.tsx         # Data Management & CSV/JSON Ingestion
│   │   ├── reports/page.tsx      # Pre-built Audits & One-Click Exports
│   │   └── settings/page.tsx     # Cloud Database & Alert Thresholds
│   ├── components/
│   │   ├── layout/               # Sidebar & Header
│   │   └── dashboard/            # KpiCard, RevenueProfitChart, OrderStatusDonut, TopStatesRevenue, RecentOrdersTable, IndiaMap
│   ├── services/                 # REST API Client
│   ├── types/                    # TypeScript Data Interfaces
│   ├── package.json              # Frontend dependencies
│   ├── next.config.ts            # Next.js configuration & API rewrites
│   └── tailwind.config.ts        # Custom theme tokens
│
├── backend/                      # Python 3.12+ FastAPI Backend
│   ├── main.py                   # Vercel entrypoint & ASGI router
│   ├── api/                      # Modular REST Routers
│   │   ├── routes_analytics.py   # Overview, trend & state aggregations
│   │   ├── routes_orders.py      # Orders CRUD & status transitions
│   │   ├── routes_shipments.py   # Courier tracking & SLA performance
│   │   ├── routes_events.py      # Chronological audit logs & bus dispatch
│   │   ├── routes_data.py        # CSV/JSON dataset upload & cleaning
│   │   └── routes_reports.py     # CSV/JSON file generation
│   ├── core/
│   │   ├── config.py             # App constants & theme palette
│   │   ├── event_manager.py      # Central Pub-Sub Event Bus
│   │   └── event_handlers.py     # Reactive state mutation handlers
│   ├── processing/
│   │   ├── logistics_engine.py   # Domain KPI & analytics calculations
│   │   ├── data_validator.py     # Dataset schema enforcement
│   │   └── data_processor.py     # Deduplication & missing value handlers
│   ├── database/
│   │   ├── session.py            # Dual PostgreSQL (Neon) & SQLite connection manager
│   │   ├── schema.sql            # Normalized relational schema
│   │   ├── models.py             # SQLAlchemy ORM models
│   │   └── seed_data.py          # Calibrated 8,426 orders benchmark seed
│   ├── tests/                    # Complete Test Suite (API, Engine, Events)
│   ├── static/                   # Standalone Interactive Preview Client
│   └── requirements.txt          # Python dependencies
│
├── shared/
│   └── api-contracts/
│       └── openapi.json          # Exported OpenAPI 3.1 schema
│
├── sample_datasets/              # Ready-to-ingest demonstration files
│   ├── nexus_orders_sample.csv
│   └── nexus_shipments_sample.json
│
├── vercel.toml                   # Root Vercel multi-service routing config
├── .gitignore                    # Git exclusions
├── .env.example                  # Environment variable template
├── run_nexus.bat                 # 1-Click Windows Local Launcher
└── package.json                  # Root monorepo workspace definition
```

---

## ⚡ Event-Driven Processing Flow

```
[ USER ACTION ]
   │
   ├─► Platform Filter Clicked ("Amazon")
   ├─► Shipment Status Transitioned ("Mark Delivered")
   └─► CSV Dataset Uploaded ("orders.csv")
         │
         ▼
[ FASTAPI ROUTE ] ──► DISPATCH TO EVENT BUS
                           │
                           ▼
                 [ NEXUS EVENT BUS ]
                     │  ├── 1. Capture payload & assign unique Event ID
                     │  ├── 2. Start high-resolution timer (perf_counter)
                     │  ├── 3. Execute subscribed domain handler
                     │  ├── 4. Mutate Database State (ACID transaction)
                     │  ├── 5. Recalculate KPIs & Time-Series Aggregations
                     │  └── 6. Persist Audit Record into `events` table
                           │
                           ▼
                 [ CLIENT UI UPDATE ]
```

---

## 🚀 Local Development & Testing

### Option 1: One-Click Local Launcher (Windows)
Double-click `run_nexus.bat` or run:
```powershell
.\run_nexus.bat
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Running with Python
```bash
# Start backend on port 8000
python -m uvicorn backend.main:app --port 8000 --reload
```
- Open [http://localhost:8000](http://localhost:8000) for the live enterprise UI.
- Open [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive Swagger API documentation.
- Test endpoint: `GET http://localhost:8000/api/health`

### Option 3: Running Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (requests to `/api/*` automatically proxy to `http://localhost:8000`).

---

## 🧪 Automated Verification Test Suite

Run the backend verification suite:
```bash
python -m pytest backend/tests
```
Tests cover:
1. `test_health_check`: Validates zero credential leakage and database health.
2. `test_overview_endpoint`: Asserts calibration to reference benchmark (8,426 orders, ₹14.8L GMV).
3. `test_platform_filter_overview`: Verifies reactive event recalculation under Amazon/Flipkart filters.
4. `test_orders_list`: Validates pagination, sorting, and schema integrity.
5. `test_events_stream`: Verifies chronological audit persistence.
6. `test_engine_kpis`: Validates mathematical correctness of delivery success rate and AOV.
7. `test_top_states`: Verifies state-level revenue rankings.
8. `test_status_overview`: Validates status distribution percentages.
9. `test_event_dispatch_and_subscriber`: Verifies the central event bus lifecycle.

---

## ☁️ Deployment Guide (GitHub + Vercel)

### Step 1: Create a GitHub Repository
1. On GitHub, click **New Repository** and name it `nexus-logistics`.
2. Initialize and push your code from the terminal:
```bash
git init
git add .
git commit -m "feat: complete production-ready NEXUS logistics intelligence platform"
git branch -M main
git remote add origin https://github.com/<your-username>/nexus-logistics.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select the `nexus-logistics` repository and click **Import**.
4. Vercel automatically detects the root `vercel.toml` configuration:
   - Frontend service: Next.js (`frontend/`)
   - Backend service: Python FastAPI serverless function (`backend/main.py`)
   - Routing: All `/api/*` requests route to FastAPI, while all other paths route to Next.js.

### Step 3: Configure Environment Variables in Vercel
In the Vercel Project Settings under **Environment Variables**, add:
- `DATABASE_URL`: Your production PostgreSQL connection string from Neon or Supabase:
  ```
  postgresql://user:password@ep-sample-pooler.neon.tech/nexus?sslmode=require
  ```
- `NEXT_PUBLIC_API_URL`: `/api`
- `NODE_ENV`: `production`

### Step 4: Deploy
Click **Deploy**. Vercel will build both services in parallel and provide a live production URL (e.g. `https://nexus-logistics.vercel.app`).
Verify the deployment with `GET /api/health`.

---

## 📄 License
MIT © Google DeepMind Engineer
