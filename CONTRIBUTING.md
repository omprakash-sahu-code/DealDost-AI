# Contributing to DealDost AI

This guide contains everything you need to know about setting up your local environment, building the application, and contributing code to the **DealDost AI** platform.

---

## 🛠️ Local Development Setup

To run DealDost AI locally, make sure you have [Node.js (v18+)](https://nodejs.org/) installed.

### 1. Clone & Install Dependencies
Clone the repository and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory of the project:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dealdost
JWT_SECRET=your-secure-jwt-256-bit-random-secret
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 3. Sync Cinematic Animation Frames (Optional)
Preload the cinematic landing page scroll frames using:
```bash
node setup_frames.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🏗️ Code Quality & Verification

To verify that your changes compile and are type-safe before committing:

### Run TypeScript Compilation check
```bash
npx tsc --noEmit
```

### Build Production Bundle
```bash
npm run build
```

---

## 🚀 Pull Request Guidelines

1. **Create a Feature Branch**: Always develop on a descriptive feature branch (e.g., `feature/custom-escro-fields` or `fix/jwt-expiration`).
2. **Write Commit Messages**: Follow the established prefix convention:
   * `feat(feature-name): commit message`
   * `fix(bug-name): commit message`
   * `chore(docs): commit message`
3. **Verify Locally**: Ensure `npm run build` runs successfully with zero compilation or type-safety issues prior to opening a PR.
4. **Submit PR**: Target the `main` branch. Provide a descriptive breakdown of your changes using our structured PR template.
