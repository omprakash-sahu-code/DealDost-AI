# DealDost AI — Legal Contracts at the Speed of Chat

DealDost AI is a premium, cinematic legal-tech SaaS platform designed to transform informal Hinglish and English business deals into structured, legally-binding contract assets. Built for modern freelancers, creators, and professionals in India, it simplifies legal drafting and negotiations through an intuitive, AI-backed interface.

---

## 📅 Version & Release History

### **v2.0.0** — *July 4, 2026* (Latest)
- **Core Database Persistence**: Fully integrated MongoDB Atlas for user sessions, conversation persistence, contracts archiving, and security logging.
- **OpenRouter AI Integration**: Implemented Gemma 26B AI engine to parse multi-message chats, extract structured deal metadata, and generate legal clauses.
- **Interactive Terms Checklist**: Overhauled the preview workflow into a checkable terms card dashboard allowing active inline editing and approval before final document generation.
- **Visual PDF Export**: Styled on-screen signatures and generated standard legal headers, watermarks, and dynamically spaced signature lines for PDFs.
- **Production Optimizations**: Integrated local Next.js rate limiters, global React error boundary UI, lazy-loaded workspaces, and HTTP security headers.

---

## 🛠️ System Architecture

DealDost AI separates the public cinematic marketing landing page from the secure, authenticated dashboard workspace via Next.js App Router route groups.

### Layout Routing Hierarchy
```mermaid
graph TD
    RootLayout[app/layout.tsx] --> LandingGroup["app/(landing)"]
    RootLayout --> DashboardGroup["app/(dashboard)"]

    LandingGroup --> LandingPage["page.tsx (/)"]
    LandingGroup --> SharedPage["share/[id]/page.tsx (Shared View)"]

    DashboardGroup -->|Auth Guard Middleware| DashRedirect["dashboard/page.tsx (Redirects)"]
    DashboardGroup --> Chat["/dashboard/chat"]
    DashboardGroup --> Contracts["/dashboard/contracts"]
    DashboardGroup --> Docs["/dashboard/documents"]
    DashboardGroup --> History["/dashboard/history"]
    DashboardGroup --> Settings["/dashboard/settings"]
```

### Deal-to-Contract Data Flow
This chart illustrates the request lifecycle when a user initiates a conversation to draft a freelance or NDA contract:
```mermaid
sequenceDiagram
    autonumber
    actor User as User Interface
    participant Route as api/chat
    participant OpenRouter as OpenRouter AI (Gemma)
    participant DB as MongoDB Atlas

    User->>Route: Sends deal outline (e.g. "Draft an NDA for Rahul by Friday")
    Route->>OpenRouter: Evaluates system prompt, context & message history
    OpenRouter-->>Route: Returns structured JSON (extracted terms, next question)
    Route->>DB: Saves conversation log & terms
    Route-->>User: Renders AI message + live terms checklist sidebar
    User->>Route: Approves/edits terms -> Clicks "Generate Final Contract"
    Route->>OpenRouter: Assembles legal clauses matching approved terms
    OpenRouter-->>Route: Generates markdown sections
    Route->>DB: Archives contract database record
    Route-->>User: Renders final contract canvas (PDF-exportable)
```

---

## 📂 Project Directory Structure

```text
DealDost_AI/
├── app/
│   ├── (landing)/              # Cinematic landing pages & shared viewer
│   ├── (dashboard)/            # Authenticated workspace panel views
│   ├── api/                    # Serverless API routes (auth, chat, contracts, logs)
│   ├── error.tsx               # App-level runtime React error boundary
│   └── layout.tsx              # Root HTML wrapper and global SEO configurations
├── components/
│   ├── landing/                # Scroll-triggered canvas animations & navbar
│   ├── dashboard/              # Workspace logic (Chat, Documents, Settings)
│   ├── auth/                   # Password login and registration modal overlays
│   └── shared/                 # DealDost Logo & LoadingSpinner fallback animations
├── lib/                        # Shared utilities (JWT, db singleton, rate limiter)
├── models/                     # Mongoose database models (User, Contract, Conversation)
├── hooks/                      # Custom hooks interfacing API transactions
├── context/                    # AuthContext managing token validation state
├── types/                      # TypeScript definitions mapping API models
├── utils/                      # Client-side helpers (jsPDF formatting, clipboard)
└── contribution.md             # Code contribution & local development guide
```

---

## 🔒 Security & Optimization Patterns

- **JWT Auth & Guard Rails**: Authentication is handled via edge-compatible tokens stored in HTTP-only `dealdost_token` cookies, protected by Next.js `middleware.ts` guards.
- **In-Memory Rate Limiting**: Throttles critical API access (`/api/chat` at 15 req/min, `/api/auth/login` at 5 req/min) to prevent brute-forcing and token exhaustion.
- **Workspace Bundle Splitting**: Workspaces are dynamically loaded using `next/dynamic` to ensure rapid initial page load speeds for users entering the dashboard.
- **Advanced Headers Config**: Leverages HTTP security headers like `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` directly via the configuration layer.

---

## 🤝 Contributing & Local Development

For detail on installing dependencies, setting up local environment variables (`.env.local`), running checks, or opening Pull Requests, please checkout [CONTRIBUTING.md](file:///f:/Project/DealDost_AI/CONTRIBUTING.md).

---

## 📜 License
Created with Precision, Trust, and Speed by the **DealDost AI** team © 2026.
