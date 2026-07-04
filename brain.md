# DealDost AI — Project Brain

> Quick-reference architecture map for AI agents. Read this first, then dive into source files as needed.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS, Framer Motion, Lenis (smooth scroll) |
| AI | OpenRouter SDK → Gemma 4 27B (via `lib/gemini.ts`) |
| Database | MongoDB Atlas M0, Mongoose (`lib/db.ts` singleton) |
| Auth | JWT (jose, edge-compatible), HTTP-only cookie `dealdost_token` |
| PDF | jsPDF (client-side, `utils/ExportUtils.ts`) |
| Deployment | Vercel (auto-deploy from `main` branch) |

## Directory Map

```
app/
  (landing)/page.tsx          → Public landing (cinematic scroll hero, 240 WebP frames)
  (landing)/share/[id]/       → Public read-only shared contract view
  (dashboard)/layout.tsx      → Sidebar + auth guard wrapper
  (dashboard)/dashboard/
    chat/page.tsx              → AI chat workspace (lazy-loaded)
    contracts/page.tsx         → Template-based contract generator (lazy-loaded)
    documents/page.tsx         → Saved contracts browser (lazy-loaded)
    history/page.tsx           → Activity timeline (lazy-loaded)
    settings/page.tsx          → Profile, security, AI preferences (lazy-loaded)
  api/auth/{login,register,logout,me}/   → Auth endpoints
  api/chat/                    → AI extraction endpoint (rate-limited: 15/min)
  api/contracts/               → CRUD + generation + sharing
  api/conversations/           → Chat history persistence
  api/history/                 → Activity log queries
  api/user/{profile,preferences}/  → User settings
  error.tsx                    → Global error boundary UI

components/
  landing/     → Navbar, HeroCanvasAnimation, ServiceShowcase, ProcessFeatures, FinalCTA
  dashboard/   → ChatWorkspace, ContractWorkspace, DocsWorkspace, HistoryWorkspace, SettingsWorkspace, Sidebar
  auth/        → AuthModal, LogoutModal
  shared/      → DealDostLogo, LoadingSpinner

lib/           → db.ts, auth.ts, gemini.ts, rateLimiter.ts, validators.ts, activityLogger.ts
models/        → User, Conversation, Contract, ActivityLog
hooks/         → useAuth, useChat, useContracts
context/       → AuthContext (provides user state, login/register/logout)
types/         → chat.ts (AI request/response types)
data/          → ContractTemplate.ts (DealDetails interface), services.ts (landing page data)
utils/         → ExportUtils.ts (PDF export + clipboard copy)
```

## Core Flows

**Chat → Contract**: User describes deal in chat → `POST /api/chat` → OpenRouter extracts structured JSON terms → preview panel shows editable checklist → user approves → `POST /api/contracts` → AI generates full legal document → saved to DB → exportable as PDF.

**Template → Contract**: User picks contract type (NDA/MSA/Freelance/Rental) + writes description → `POST /api/contracts` → same AI generation pipeline → saved to DB.

## Data Models (Mongoose)

- **User**: name, email, passwordHash, role, preferences (aiTone, defaultContractType, language)
- **Conversation**: userId, title, messages[], extractedTerms, status, contractId ref
- **Contract**: userId, conversationId, title, type, status, terms, content.sections[], metadata (generatedBy, version)
- **ActivityLog**: userId, action, resourceType, resourceId, description (90-day TTL)

## Auth & Security

- Edge middleware (`middleware.ts`) guards `/api/*` and `/dashboard/*`
- JWT signed with `jose`, stored in HTTP-only cookie, 7-day expiry
- Rate limiting: in-memory (`lib/rateLimiter.ts`) — 15/min chat, 5/min login
- Security headers via `next.config.mjs`: X-Frame-Options DENY, nosniff, strict referrer

## Design Tokens

| Token | Value |
|---|---|
| Background | `#0D0D0D` (Charcoal), `#050505` (Pitch Black) |
| Accent | `#D4AF37` (Antique Gold) |
| Paper | `#FAF9F6` (Alabaster) |
| Text | `#F5F5F4` (Silk White), `#A3A3A3` (Muted Slate) |
| Fonts | Playfair Display (serif), Inter (sans), Syne (display) |

## Key Patterns

- **Signature filtering**: All on-screen contract views filter out AI-generated text signature sections via regex `/signature|witness|execut/i` and render a visual CSS grid signature block instead.
- **PDF signatures**: `ExportUtils.ts` appends dual-party signature lines programmatically via jsPDF draw calls.
- **Lazy loading**: All dashboard workspace pages use `next/dynamic` with `<LoadingSpinner>` fallback.
- **Standardized API errors**: `{ message, error: { code, message, details? } }`

## Environment Variables

```
MONGODB_URI, JWT_SECRET, OPENROUTER_BASE_URL, OPENROUTER_API_KEY
```

## Commands

```
npm install        # Install dependencies
npm run dev        # Dev server (port 3000)
npm run build      # Production build
```
