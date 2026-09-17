# Tech Stack & Architecture: CLEARCLAUSE — Google Cloud-Native Platform

## 1. Google Services Integration (Core Infrastructure)

### Google Gemini 2.5 Flash API
- **Role:** Primary AI intelligence engine powering the adversarial legal reasoning pipeline.
- **SDK:** `@google/genai` (official Google Generative AI SDK for Node.js)
- **Architecture:** All Gemini inference executes within isolated Next.js API Route Handlers (`src/app/api/analyze/route.ts`). The `GEMINI_API_KEY` is stored as a server-side environment variable and never exposed to the client bundle.
- **Configuration:** Temperature set to 0.2 for high-precision, deterministic legal analysis. Structured JSON output enforced via system prompt engineering.

### Google Cloud Run
- **Role:** Serverless container hosting for the full-stack Next.js application.
- **Benefits:** Zero infrastructure management, automatic HTTPS, horizontal auto-scaling, and pay-per-request pricing model.
- **Deployment:** Dockerized Next.js standalone output deployed via `gcloud run deploy` with `--allow-unauthenticated` for public access.

### Google Artifact Registry
- **Role:** Centralized container image repository for production-ready Docker images.
- **Workflow:** Images are tagged, versioned, and stored in Artifact Registry before deployment to Cloud Run, enabling rollback and audit capabilities.

### Google Cloud Build
- **Role:** CI/CD automation layer that builds Docker images from source and pushes them to Artifact Registry.
- **Integration:** Triggered on repository pushes for automated build-deploy pipelines.

### Google Cloud Logging
- **Role:** Centralized observability for Cloud Run service logs.
- **Usage:** All API route errors, Gemini response parsing failures, and request metadata are captured via Cloud Run's integrated logging to Google Cloud Logging for production debugging and monitoring.

### Google Fonts (Inter)
- **Role:** Optimized web typography via the Next.js `next/font/google` system.
- **Benefits:** Zero external font file downloads, automatic font subsetting, and layout shift prevention — all served directly from Google's CDN infrastructure.

## 2. Application Framework

### Next.js 16 (App Router) + TypeScript
- **Role:** Full-stack monolithic application framework providing both the React frontend and serverless API backend.
- **Architecture:** App Router for file-system-based routing, Server Components for initial page render, and Client Components for interactive dashboard elements.
- **API Routes:** Secure server-side Route Handlers process all Gemini API calls, ensuring credentials never leak to the browser.

### Tailwind CSS v4
- **Role:** Utility-first CSS framework for rapid, consistent, responsive UI development.
- **Theme:** Custom dark-mode design system (Deep Charcoal `#0a0a0a`, Obsidian `#171717`, structural borders `#333333`) with semantic color tokens for risk severity levels.

### Lucide React
- **Role:** Lightweight, tree-shakeable SVG icon library replacing the need for any local image assets.
- **Benefit:** Contributes to the strict zero-asset footprint — no `.png`, `.jpg`, or `.svg` files in the repository.

## 3. Strict Repository Size Constraint (<10MB)
To comply with the hackathon's repository size rules:
- **Zero Asset Strategy:** Absolute ban on local graphic files. All icons rendered via `lucide-react` components, typography via Google Fonts CDN.
- **Empty `/public` Directory:** No static assets stored locally.
- **Pruned `.gitignore`:** Strips `node_modules/`, `.next/`, `.env`, and local credential files to prevent build inflation.

## 4. Security Architecture
- **Server-Side API Isolation:** All Gemini API calls execute exclusively on the server within Next.js Route Handlers — the API key is never bundled into client JavaScript.
- **No Data Persistence:** Zero user documents, contracts, or analysis results are stored. All processing is ephemeral and stateless.
- **Input Validation:** Contract text is validated for type and presence before Gemini processing.
- **HTTPS Enforcement:** Google Cloud Run provides automatic TLS termination for all production traffic.