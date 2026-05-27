# VedaAI

Production-style AI assignment generator for teachers. The app follows the complete evaluator-facing flow:

Mock Login -> Assignments Dashboard -> Create Assignment -> Review -> Queue Generation -> Realtime Generating Page -> Generated Output -> PDF Download

## Apps

- `apps/web`: Next.js 16, TypeScript, Tailwind, Zustand, React Hook Form
- `apps/server`: Express, Socket.io, BullMQ, Redis, Zod, Puppeteer

## Setup

```bash
cd apps/web
npm install
npm run dev
```

```bash
cd apps/server
npm install
npm run dev
```

Optional services:

```bash
GEMINI_API_KEY=your-google-ai-studio-key
GEMINI_MODEL=gemini-flash-latest
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/veda-ai
REDIS_URL=redis://127.0.0.1:6379
WEB_URL=http://localhost:3000
PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Copy `apps/web/.env.example` to `apps/web/.env.local` and
`apps/server/.env.example` to `apps/server/.env`.

## Architecture

```mermaid
graph TD
A[Next.js Frontend] --> B[Express API]
B --> C[BullMQ Queue]
C --> D[Worker]
D --> E[OpenAI Prompt Contract]
D --> F[MongoDB or Store]
D --> G[Redis]
D --> H[Socket.io]
D --> I[Zod Validation]
B --> J[Puppeteer PDF]
```

## WebSocket Flow

The generating route shows queue state updates:

- `queued`
- `processing`
- `structuring`
- `saving`
- `completed`
- `failed`

The frontend includes a visual stepper for these states. The backend emits matching Socket.io events during worker processing.

## AI Validation

The backend does not store loose AI output. `prompts/buildPrompt.ts` asks for strict JSON only, and `validators/question-paper.schema.ts` validates the generated structure with Zod before saving or emitting completion.

## PDF Generation

PDF download is handled by the backend:

```text
GET /assignments/:id/pdf
```

Puppeteer opens the generated output page and renders a print-ready PDF so the browser UI and downloaded paper stay visually aligned.

## UI Coverage

- Mock teacher login stored in Zustand/localStorage
- Desktop fixed `250px` sidebar
- Mobile bottom navigation with FAB at `bottom-20`
- Assignment search and filter
- Empty state and assignment grid
- Two-step create/review flow
- Dynamic question rows with live totals
- Generated paper with school header, student info, sections, difficulty badges, and answer key

## Why BullMQ?

- BullMQ offloads AI generation to background workers so the API remains responsive and can scale independently from CPU-bound LLM calls. Jobs include retry/backoff configuration to handle transient failures.

## Why WebSockets?

- Socket.io provides realtime generation updates (queued → processing → structuring → saving → completed) so the teacher sees progress without polling.

## Environment & Validation

- The server includes a small Zod-based env validator (`apps/server/src/config/env.ts`) to surface missing or malformed environment variables early. Required services: Redis (BullMQ), MongoDB (optional), and an LLM API key for full generation.

## Run with Docker Compose (recommended)

This repository includes a `docker-compose.yml` that starts local Redis and MongoDB for development.

1. Start Redis and Mongo:

```bash
docker-compose up -d
```

2. Create env files (examples):

Server: `apps/server/.env`

```text
PORT=4000
REDIS_URL=redis://127.0.0.1:6379
MONGODB_URI=mongodb://127.0.0.1:27017/veda
WEB_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-flash-latest
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Web: `apps/web/.env.local` (or copy `.env.example`)

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. Install dependencies and run apps in separate terminals:

```powershell
# Server
cd "c:\open source con\veda-ai\veda-ai\apps\server"
npm install
npm run dev

# Web
cd "c:\open source con\veda-ai\veda-ai\apps\web"
npm install
npm run dev
```

4. If port 3000 is occupied, free it or run the web on another port:

```powershell
npx kill-port 3000
# or
$env:PORT="3001"
# npm run dev
```

5. Visit the app in your browser: `http://localhost:3000` (or the port you chose).

6. Cleanup (stop docker services):

```bash
docker-compose down
```

If you want, I can also add a `docker-compose` service to build and run the Node apps themselves — tell me if you'd prefer a one-command startup.


