# DealDost AI - Project Brain & Architecture Map

Welcome! This document serves as the architectural overview and reference manual for **DealDost AI**, a premium, cinematic legal-tech SaaS platform. It enables AI agents to immediately understand the project structure, design patterns, and operational logic without parsing all files repeatedly.

---

## 🚀 Technical Stack & Dependencies

The project is built on the following technologies:
- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS (PostCSS)
- **Animations**: Framer Motion (for UI transitions and scroll-linked timeline states) & Lenis (for global smooth scroll synchronization)
- **PDF Generation**: `jspdf` (packaged inside [ExportUtils.ts](file:///F:/Project/DealDost_AI/utils/ExportUtils.ts))
- **File Configuration**: See [package.json](file:///F:/Project/DealDost_AI/package.json) and [tsconfig.json](file:///F:/Project/DealDost_AI/tsconfig.json)

---

## 📂 Project Directory Structure

```text
DealDost_AI/
├── app/                        # Next.js App Router root
│   ├── (landing)/              # Route group for landing page
│   │   ├── layout.tsx          # Landing layout containing SmoothScroll
│   │   └── page.tsx            # Main entry point (Hero, Services, CTA)
│   ├── (dashboard)/            # Route group for authenticated dashboard
│   │   ├── layout.tsx          # Dashboard layout containing Sidebar
│   │   └── dashboard/          # Dashboard routes
│   │       ├── chat/page.tsx
│   │       ├── contracts/page.tsx
│   │       ├── documents/page.tsx
│   │       ├── history/page.tsx
│   │       └── settings/page.tsx
│   ├── api/                    # Next.js API Routes (Backend Prep)
│   ├── globals.css             # Theme variables, custom scrollbars
│   └── layout.tsx              # Root HTML wrapper (fonts, metadata)
├── components/                 # Reusable UI elements
│   ├── auth/                   # Authentication related components
│   │   ├── AuthModal.tsx
│   │   └── LogoutModal.tsx
│   ├── dashboard/              # Dashboard specific components
│   │   ├── Sidebar.tsx
│   │   ├── ChatWorkspace.tsx
│   │   ├── ContractWorkspace.tsx
│   │   ├── DocsWorkspace.tsx
│   │   ├── HistoryWorkspace.tsx
│   │   └── SettingsWorkspace.tsx
│   ├── landing/                # Landing page components
│   │   ├── FinalCTA.tsx
│   │   ├── HeroCanvasAnimation.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProcessFeatures.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── ServiceShowcase.tsx
│   │   └── SmoothScroll.tsx
│   └── shared/                 # Shared components
│       └── DealDostLogo.tsx
├── context/                    # React Context providers (Prep)
├── data/                       # Static lists and document layout models
│   ├── ContractTemplate.ts     # String interpolations for drafting agreements
│   └── services.ts             # Pricing cards and process step configurations
├── hooks/                      # Custom React hooks (Prep)
├── lib/                        # Shared backend utilities (Prep)
├── models/                     # Database schemas (Prep)
├── types/                      # TypeScript definitions (Prep)
├── utils/                      # Helper files
│   └── ExportUtils.ts          # PDF creation (jsPDF) and Clipboard Copy
├── public/                     # Static files
│   └── frames/                 # 240 compressed WebP frames for Hero canvas
└── setup_frames.js             # Utility to sync frames
```

---

## ⚙️ Core Application Architecture & Flow

### 1. View & Session Management
The core runtime state separates the public landing site from the authenticated dashboard via route groups:
1. **Landing Page (`/`)**: Displays the cinematic scroll-driven landing page. When a user logs in via `AuthModal`, they are authenticated and redirected to `/dashboard/chat`.
2. **Dashboard Routes (`/dashboard/*`)**: Loads the specific workspace based on the URL (e.g., `/dashboard/chat`, `/dashboard/contracts`), all wrapped in a shared layout containing the `Sidebar`.

**Authentication Flow:**
- Next.js Edge Middleware (`middleware.ts`) protects all `/api/*` and `/dashboard/*` routes.
- JWT tokens are signed using `jose` (Edge-compatible) and stored securely in an HTTP-only cookie named `dealdost_token` with `SameSite=lax`.
- Global React state is managed via `<AuthProvider>` ([context/AuthContext.tsx](file:///F:/Project/DealDost_AI/context/AuthContext.tsx)), which exposes the `useAuth` hook providing the active `User` object, `login()`, `register()`, and `logout()` functions to UI components.

---

### 2. Landing Page & Cinematic Animations Flow

```mermaid
graph TD
    Landing[app/(landing)/page.tsx]
    Landing --> Nav[Navbar.tsx]
    Landing --> Hero[HeroCanvasAnimation.tsx]
    Landing --> Pricing[ServiceShowcase.tsx]
    Landing --> Proc[ProcessFeatures.tsx]
    Landing --> CTA[FinalCTA.tsx]
    Landing --> Auth[AuthModal.tsx]
    Auth -->|On Success| DashRedirect[router.push('/dashboard/chat')]
```

- **Global Smooth Scrolling**: Initialized in [SmoothScroll.tsx](file:///F:/Project/DealDost_AI/components/SmoothScroll.tsx) using Lenis. The instance is attached to the global scope:
  ```typescript
  (window as any).lenis = lenis;
  ```
  This is used by modals to trigger `lenis.stop()` / `lenis.start()` when opening/closing, preventing background scroll conflicts.
- **Hardware-Accelerated Hero Canvas**: Rendered by [HeroCanvasAnimation.tsx](file:///F:/Project/DealDost_AI/components/HeroCanvasAnimation.tsx).
  - Listens to scroll events on a 10-height container (`h-[1000vh]`).
  - Preloads 240 WebP image frames from `/frames/frame_*.webp` on mount.
  - Links scroll position percentage (`scrollYProgress`) to active frame index via Framer Motion's `useTransform(smoothProgress, [0, 0.8], [0, 239])`.
  - Continuously draws the current frame image on an HTML5 `<canvas>` resized to fill the browser window.
- **Dual-State Navbar**: In [Navbar.tsx](file:///F:/Project/DealDost_AI/components/Navbar.tsx), scroll progress is tracked.
  - **Early State (Scroll < 48%)**: Navbar is completely transparent, omitting the logo, and aligns menu links to the right.
  - **Activated State (Scroll >= 48%)**: Animates into a dark, glassmorphic bar featuring the brand logo on the left, synced with the Hero CTA threshold.
  - Built-in **Scroll Spy** detects which section is currently on-screen (`home`, `pricing`, `features`, `final-cta`) and updates active states.
- **Process Timeline**: Controlled in [ProcessFeatures.tsx](file:///F:/Project/DealDost_AI/components/ProcessFeatures.tsx). A center track maps an orb particle that glides downwards dynamically based on the scroll position, triggering pulsing indicators as it overlaps each step node.

---

### 3. Dashboard Workspace Structure

The dashboard is structured using Next.js nested layouts (`app/(dashboard)/layout.tsx`), which renders the persistent left-hand navigation `Sidebar` and dynamically injects the page content (workspaces) based on the current URL.

```mermaid
graph LR
    Layout[app/(dashboard)/layout.tsx] --> Sidebar[Sidebar.tsx]
    Layout --> MainPane[Page Content {children}]
    
    MainPane --> Chat[/dashboard/chat]
    MainPane --> Contracts[/dashboard/contracts]
    MainPane --> Docs[/dashboard/documents]
    MainPane --> History[/dashboard/history]
    MainPane --> Settings[/dashboard/settings]
```

#### Views Details:
1. **Chat Workspace ([ChatWorkspace.tsx](file:///F:/Project/DealDost_AI/components/dashboard/ChatWorkspace.tsx))**:
   - **OpenRouter AI Extraction Engine**: The chat interface is now powered by an integration with OpenRouter using the OpenAI SDK via the `/api/chat` route. It connects to the Gemma 4 26B model (or any model specified in `.env.local`) and handles English and Hinglish seamlessly.
     - **API Logic**: `lib/gemini.ts` sends a strict System Prompt requesting structured JSON, using OpenAI's chat completions format.
     - **Extracted Fields**: `parties`, `payment`, `deadline`, `scope`, `location`, `confidence`, and `missingFields`.
     - **State Hook**: The logic is encapsulated cleanly in `hooks/useChat.ts` which manages the optimistic UI, message history, and the extracted terms.
   - **Interactive Live Preview**: When the AI successfully extracts the minimum viable fields (Parties, Payment, Scope) and reaches high confidence with zero missing fields, the UI maps the extracted JSON to the [generateContractBody](file:///F:/Project/DealDost_AI/data/ContractTemplate.ts) utility to compile a legal agreement dynamically. The resulting paper preview is rendered side-by-side on the right.
2. **Contract Workspace ([ContractWorkspace.tsx](file:///F:/Project/DealDost_AI/components/ContractWorkspace.tsx))**:
   - Allows users to select standard categories (NDA, MSA, Freelance, Rental Lease).
   - Generates mock documents using template text fields with a loading spinner simulated over `2500ms`.
3. **Docs Workspace ([DocsWorkspace.tsx](file:///F:/Project/DealDost_AI/components/DocsWorkspace.tsx))**:
   - Manages generated contracts. Currently showcases an empty-state floating doc stack with redirection links back to the AI chat interface.
4. **History Workspace ([HistoryWorkspace.tsx](file:///F:/Project/DealDost_AI/components/HistoryWorkspace.tsx))**:
   - Renders a retro-vertical timeline grouping historical logs (Today, Yesterday, Earlier) with categorization icons.
5. **Settings Workspace ([SettingsWorkspace.tsx](file:///F:/Project/DealDost_AI/components/SettingsWorkspace.tsx))**:
   - Manages personal preferences: User profile inputs (Name, Email), security parameters (Password reset, 2FA toggle switch), and AI legal tone parameters (`strict` for liability shields, `balanced` for standard legal terms, and `flexible` for deal speed).

---

## 💾 Data Models & Schemes

### 0. Database Configuration
- **Database Engine**: MongoDB Atlas (Free Tier M0)
- **Driver**: `mongoose`
- **Connection Logic**: Singleton cached connection defined in `lib/db.ts` designed to prevent connection pool exhaustion during Next.js hot reloads and Vercel lambda invocations.
- **Core Models**:
  - `User`: Tracks identity and preferences (e.g. AI tone).
  - `Conversation`: Saves chat history and cumulative `IExtractedTerms`.
  - `Contract`: Saves finalized contract strings and structured editable sections.
  - `ActivityLog`: Tracks history events with a 90-day TTL index.

### 1. Services Schema
Services structure is located in [data/services.ts](file:///F:/Project/DealDost_AI/data/services.ts).
- `legalServices`: List of options containing service titles, descriptions, price values, list features, and reliability ratings (represented on a 5.0 scale).
- `processSteps`: List of nodes rendering the progress timeline steps (left or right positioning on the vertical timeline track).

### 2. Deal Details Template
Contract structure is defined in [data/ContractTemplate.ts](file:///F:/Project/DealDost_AI/data/ContractTemplate.ts).
- **Interface `DealDetails`**:
  ```typescript
  export interface DealDetails {
    parties: {
      sideA: string;
      sideB: string;
    };
    payment: {
      amount: string;
      currency: string;
      terms: string;
    };
    deadline: string;
    scope: string;
    location?: string;
  }
  ```
- **Function `generateContractBody(details: DealDetails)`**: Builds a formatted, markdown-safe legal string template out of the extracted object variables.

---

## 🛠️ Global Utilities & Exports

Exposed in [ExportUtils.ts](file:///F:/Project/DealDost_AI/utils/ExportUtils.ts):

- **`downloadContractPDF(content: string, fileName: string)`**:
  - Initializes `jsPDF` using portrait mode (`p`), millimeters (`mm`), and A4 format.
  - Spans text fields automatically by converting strings to wrapped lines via `doc.splitTextToSize(content, maxWidth)` (using a 20mm margin threshold).
  - Measures height margins and triggers new page creation if height index exceeds 280mm:
    ```typescript
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    ```
- **`copyContractToClipboard(content: string)`**:
  - Interacts with browser clipboard API (`navigator.clipboard.writeText`) returning a promise representing write success/failure.

---

## 🎨 Theme, Styling & Tokens

All styling rules are compiled via Tailwind CSS configured in [tailwind.config.ts](file:///F:/Project/DealDost_AI/tailwind.config.ts). Custom properties are defined in [globals.css](file:///F:/Project/DealDost_AI/app/globals.css):
- **Core Background**: `#0D0D0D` (Studio Charcoal)
- **Alternate Backgrounds**: `#050505` (Pitch Black), `#161616` (Card Grey)
- **Brand Accent**: `#D4AF37` (Antique Gold)
- **Paper Accent**: `#FAF9F6` (Alabaster White for generated contracts)
- **Text Primary**: `#F5F5F4` (Silk White), `#A3A3A3` (Muted Slate)
- **Custom Typography**:
  - Serif headings: Playfair Display
  - Sans-Serif body: Inter
  - Display/Branding: Garet / Syne
- **Premium Scrollbars**: Custom slim scrollbars matching the Gold and Charcoal palette are configured under the CSS utility `.custom-scrollbar`.

---

## ⚙️ Development Commands

- **Install Dependencies**: `npm install`
- **Development Server**: `npm run dev` (starts on port 3000)
- **Production Build**: `npm run build`
- **Frames Asset Sync**: `node setup_frames.js` (copies cinematic source frame folders to `public/frames`)
