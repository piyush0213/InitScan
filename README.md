# 🔭 InitScan — Cross-Rollup Intelligence Platform

> **The missing unified observability layer for the Initia ecosystem.**

InitScan is a production-grade, real-time cross-rollup intelligence platform purpose-built for the [Initia](https://initia.xyz) blockchain ecosystem. It indexes, monitors, queries, and visualizes on-chain activity across **all Initia rollups simultaneously** — something no other tool does today.

---

## 🧩 The Problem

Initia's architecture features multiple L2 appchains (MiniEVM, MiniWasm, MiniMove, Drip, YieldMind) running in parallel. Each has its own RPC and state. Currently, there is **no unified tool** to observe, query, or monitor activity across all rollups at once. Developers, analysts, and power users have to check each chain individually.

## 💡 The Solution

InitScan provides **four capabilities in one platform**:

1. 📡 **Real-time cross-rollup transaction explorer** with live Socket.io feed
2. 🤖 **AI-powered natural language query engine** (Claude) for on-chain data
3. 🔔 **Smart alert system** for whale movements and contract events
4. 📊 **Developer analytics hub** with ecosystem-wide charts and stats

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite + TailwindCSS)   │
│   Dashboard │ Explorer │ AI Query │ Alerts           │
│   Analytics │ Rollup Health │ Socket.io Client       │
└──────────────────────┬───────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────┴───────────────────────────────┐
│              BACKEND (Express.js + Socket.io)        │
│   REST API │ Chain Poller │ Alert Engine              │
│   Health Checker │ AI Query Engine (Claude)           │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────┴───────────────────────────────┐
│                   DATA LAYER                          │
│   MongoDB (Transactions, Alerts) │ In-Memory (Health)│
└──────────────────────┬───────────────────────────────┘
                       │ LCD REST
┌──────────────────────┴───────────────────────────────┐
│             INITIA TESTNET LCD ENDPOINTS              │
│  L1 │ MiniMove │ MiniWasm │ MiniEVM │ Drip │ YieldMind│
└──────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📡 **Live Dashboard** | Real-time scrolling tx feed with chain filters, whale filter, pause/resume |
| 🔍 **Explorer** | Full searchable, filterable, paginated transaction table |
| 🤖 **AI Query** | Natural language → MongoDB queries via Claude API |
| 🔔 **Smart Alerts** | Configurable alerts for whale txs, specific types, chains, addresses |
| 📊 **Analytics** | 6 interactive Recharts: by chain, type, tag, hourly, whale ratio, fail rate |
| 🏥 **Rollup Health** | Real-time status of all 6 chains with uptime indicators |
| 🐋 **Whale Detection** | Auto-tags transactions > 10,000 INIT |
| ⚡ **Socket.io** | Full real-time push for txs, alerts, and health updates |

---

## 🛠️ Tech Stack

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)
![Anthropic](https://img.shields.io/badge/Claude_AI-8B5CF6?style=flat)

### Frontend
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=flat)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white)

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- Anthropic API key (for AI Query)

### 1. Clone
```bash
git clone https://github.com/your-username/initscan.git
cd initscan
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # or edit .env directly
# Set your ANTHROPIC_API_KEY in .env
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions` | Paginated tx list (page, limit, chainId, txType, isWhale, status, tag, search, from, to) |
| `GET` | `/api/transactions/:hash` | Single transaction detail |
| `POST` | `/api/query` | AI query — `{ question: string }` → `{ transactions, description, filter, count }` |
| `GET` | `/api/analytics/summary` | Ecosystem-wide analytics summary |
| `GET` | `/api/analytics/chain/:id` | Chain-specific analytics |
| `GET` | `/api/health/rollups` | Current health status of all rollups |
| `GET` | `/api/alerts` | List all configured alerts |
| `POST` | `/api/alerts` | Create new alert |
| `PATCH` | `/api/alerts/:id` | Update alert (toggle, edit) |
| `DELETE` | `/api/alerts/:id` | Delete alert |

### Socket.io Events
| Event | Direction | Payload |
|-------|-----------|---------|
| `new_transaction` | Server → Client | Full transaction object |
| `alert_triggered` | Server → Client | `{ alertId, alertName, transaction, triggeredAt }` |
| `chain_health_update` | Server → Client | Updated health array |

---

## 🔗 Data Sources

| Chain | LCD Endpoint |
|-------|-------------|
| Initia L1 | `https://lcd.testnet.initia.xyz` |
| MiniMove | `https://lcd.minimove-1.testnet.initia.xyz` |
| MiniWasm | `https://lcd.miniwasm-1.testnet.initia.xyz` |
| MiniEVM | `https://lcd.minievm-1.testnet.initia.xyz` |
| Drip | `https://lcd.drip-1.testnet.initia.xyz` |
| YieldMind | `https://lcd.yieldmind-1.testnet.initia.xyz` |

---

## 🏆 Hackathon

**INITIATE Hackathon — AI & Tooling Track**

InitScan belongs in the AI & Tooling track because it:
- Provides **developer tooling** that doesn't exist yet for the Initia ecosystem
- Uses **AI (Claude)** to enable natural language on-chain data exploration
- Delivers a **real-time observability layer** for cross-rollup monitoring
- Is a complete, **production-grade** platform ready for ecosystem adoption

---

## 📄 License

MIT © InitScan
