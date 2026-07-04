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
Duplicate the provided `.env.example` template to create a `.env.local` file:
```bash
cp .env.example .env.local
```
Then, configure the required variables. Detailed setup and guides for obtaining each credential can be found in the comments within `.env.example`:
- **`MONGODB_URI`**: Obtained from your MongoDB Atlas dashboard (Connect -> Drivers).
- **`OPENROUTER_API_KEY`**: Obtained from your OpenRouter dashboard settings.

### 3. Run Development Server
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

---

## 🔍 Troubleshooting: MongoDB SRV DNS Issues

If you receive errors like `querySrv ENOTFOUND` or database connection timeouts in your local development terminal when using a `mongodb+srv://` connection string, this is a common DNS resolution issue on local networks/Windows.

### Solution:
Switch your `MONGODB_URI` in `.env.local` to the standard `mongodb://` protocol by explicitly listing the cluster shard nodes.
1. In MongoDB Atlas, select **Connect** -> **Connect your application** -> **Drivers**.
2. Select **Node.js** as the driver and select an older version (e.g., **2.2.12 or earlier**) or choose to show the connection string template listing shards explicitly.
3. Your connection string format will look like this:
   ```env
   MONGODB_URI="mongodb://<user>:<password>@shard-00-00.mongodb.net:27017,shard-00-01.mongodb.net:27017,shard-00-02.mongodb.net:27017/?ssl=true&replicaSet=atlas-shard-0&authSource=admin"
   ```
4. List the shard nodes explicitly to bypass DNS SRV queries entirely. Mongoose will connect directly.

