# Liberica Assistance

**English** · [Bahasa Indonesia](README.id.md)

Liberica Assistance is an AI assistant for technical troubleshooting, structured business brainstorming, and market analysis. It runs on Google Gemini, keeps each user's chat sessions in Firebase, and was first built in Google AI Studio (current release: version 1.2). The interface is in Indonesian.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-API-4285F4?logo=google&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)

## Contents

- [Modes](#modes)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Build and run in production](#build-and-run-in-production)
- [Project layout](#project-layout)
- [Security notes](#security-notes)
- [License](#license)

## Modes

| Menu | Mode | What it does |
|---|---|---|
| Solusi | `troubleshoot` | Step-by-step technical problem solving with root cause analysis |
| Diskusi | `brainstorm` | Phased business and strategy discussion. The assistant asks pointed questions before it proposes a direction, and shows a progress bar per phase |
| Market | `market` | Asset and commodity analysis with live price data, TradingView widgets, and charts |
| Prompting | `chat` | General conversation |
| AI News | `news` | AI news feed with generated cover images |
| Admin | `admin` | Admin list management, visible only to admin accounts |

Every mode shares a system prompt that asks the model to clarify ambiguous requests, plan multi-step work before executing it, verify its own output, and keep answers concise.

## Features

- Model routing: simple prompts go to `gemini-3-flash-preview` and complex prompts go to `gemini-3.1-pro-preview`. When a quota is exceeded, the request is retried once on `gemini-2.5-flash` or `gemini-2.5-pro`.
- Google Search grounding for answers that need current information.
- Attachments: `.txt`, `.csv`, `.md`, `.pdf`, `.docx`, and images. PDFs are read with pdf.js, Word files with mammoth, and images are compressed to JPEG before upload.
- Rich responses with Markdown, GitHub-flavored tables, code blocks with a copy button, and charts.
- Export a conversation to PDF.
- Google sign-in through Firebase Authentication. Sessions are saved per user in Firestore and can be renamed and pinned.
- Market data comes from a small Express endpoint, `GET /api/stock/price/:ticker`, which proxies Yahoo Finance so the browser does not call it directly.
- The admin dashboard adds and removes admin emails stored in the Firestore `admins` collection. The super admin cannot be removed.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, motion, lucide-react |
| AI | `@google/genai` (Gemini) |
| Data and auth | Firebase Authentication (Google), Cloud Firestore |
| Server | Express 4 via `tsx` in development, bundled with esbuild for production |
| Market data | Yahoo Finance chart API, `react-ts-tradingview-widgets`, recharts |
| Documents | pdfjs-dist, mammoth, jsPDF, html2pdf.js, html-to-image |

## Getting started

Requirements: Node.js 20 or newer, a Gemini API key, and a Firebase project with Google sign-in and Firestore enabled.

```bash
npm install
cp .env.example .env.local     # then set GEMINI_API_KEY
npm run dev
```

`npm run dev` starts `server.ts`, which serves the Vite app and the API on `http://localhost:3000`.

Firebase settings are read from `firebase-applet-config.json`. To use your own project, replace that file with your project's web app configuration and deploy `firestore.rules`.

## Configuration

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | yes | Gemini API key. Injected into the client bundle at build time by `vite.config.ts` |
| `APP_URL` | no | Public URL of the app. AI Studio sets this automatically on Cloud Run |
| `DISABLE_HMR` | no | Set to `true` to turn off hot module reload (used inside AI Studio) |

## Build and run in production

```bash
npm run build      # vite build + bundle server.ts into dist/server.cjs
NODE_ENV=production npm start   # node dist/server.cjs on port 3000
```

`NODE_ENV=production` matters: without it the server tries to start the Vite dev middleware instead of serving `dist/`.

Other scripts:

| Script | Purpose |
|---|---|
| `npm run preview` | Preview the built frontend with Vite |
| `npm run lint` | Type check with `tsc --noEmit` |
| `npm run clean` | Remove `dist/` |

## Project layout

```
server.ts                 Express server: Yahoo Finance proxy + static/Vite middleware
index.html
src/
  App.tsx                 mode navigation and layout
  constants.ts            system prompt and per-mode placeholders
  firebase.ts             Firebase initialization
  services/aiService.ts   Gemini calls, model routing, per-mode prompts
  hooks/useSessions.ts    sign-in and Firestore session storage
  components/             chat UI, rich responses, AI news, admin dashboard
  utils/                  file upload parsing, PDF export
firestore.rules           Firestore security rules
security_spec.md          data invariants and the payloads the rules must reject
```

## Security notes

- `GEMINI_API_KEY` is compiled into the frontend bundle, so anyone who loads the app can read it. Restrict the key in Google Cloud (HTTP referrer and API restrictions), or move Gemini calls behind `server.ts` before a public release.
- `firestore.rules` limits each session document to its owner under `/users/{userId}/sessions`, enforces the exact schema, size limits, and server timestamps, and allows only one kind of update per write. [security_spec.md](security_spec.md) lists the payloads the rules are designed to reject.
- Keep `.env.local` out of version control.

## License

This repository does not include a license file. Contact the author before reusing the code.

Developed by Yohanes Octavian Rizky ([@torpedoliar](https://github.com/torpedoliar)).
