# CLEARCLAUSE — AI Rights & Contract Intelligence System

> **Problem Statement 01** · Open Innovation Hackathon 2026

> **🚀 Live Demo:** [https://lexguard-896956006094.asia-south1.run.app](https://lexguard-896956006094.asia-south1.run.app)

ClearClause is an AI-powered contract intelligence platform that analyzes legal and quasi-legal documents to identify potentially harmful, exploitative, ambiguous, or high-risk clauses before users agree to them.

## Chosen Vertical

**AI Rights & Contract Intelligence** — Detecting hidden liabilities, one-sided obligations, and exploitative language in legal agreements through adversarial multi-agent AI reasoning.

## Approach & Logic

### Adversarial Multi-Agent Reasoning

ClearClause uses **Google Gemini 2.5 Flash** as its core intelligence engine, employing a dual-agent adversarial reasoning workflow:

1. **Agent A (Corporate Exploiter):** Scans the contract from a hostile corporate perspective, identifying clauses that could be weaponized against the individual — non-compete traps, IP seizures, liability waivers, privacy violations, and one-sided arbitration.

2. **Agent B (User Advocate):** Takes each identified exploit and generates:
   - A plain-English explanation
   - A real-world "Nightmare Scenario" consequence
   - A specific negotiation recommendation
   - Comparison against industry standard benchmarks

### 6-Metric Risk Scorecard

Every analyzed document receives a comprehensive scorecard across six risk dimensions:

| Metric | What It Measures |
|---|---|
| **Privacy Protection** | Data collection, third-party sharing, monitoring clauses |
| **Financial Safety** | Liability caps, indemnification, fee structures |
| **Employment Fairness** | Non-compete scope, termination conditions, at-will clauses |
| **IP Protection** | Ownership transfers, moral rights waivers, licensing scope |
| **Termination Fairness** | Notice periods, cause requirements, post-termination obligations |
| **Clause Clarity** | Ambiguous language, contradictions, undefined terms |

### Document Type Classification

ClearClause automatically classifies the document type (Employment Contract, Privacy Policy, Terms of Service, Vendor Agreement, Rental Agreement, etc.) and adjusts its analysis accordingly.

### Severity Classification

Each detected risk is classified as **High**, **Medium**, or **Low** severity with:
- The exact original clause text
- A plain-English explanation
- A real-world consequence scenario
- A risk category tag
- A negotiation recommendation
- Industry standard comparison

## How the Solution Works

1. **Upload or Paste** — Users upload PDF/TXT files or paste contract text directly
2. **Server-Side Processing** — Text is sent to a secure Next.js API Route Handler
3. **AI Analysis** — Google Gemini 2.5 Flash performs adversarial multi-agent reasoning via its multimodal API (PDFs are sent directly to Gemini — no third-party parsing)
4. **Structured Logging** — Every request is logged via Google Cloud Logging-compatible structured JSON
5. **Scorecard Generation** — Structured JSON response populates the interactive dashboard
6. **Interactive Dashboard** — Risk cards with expandable clauses, metric bars, and circular score gauge

## Google Services Integration

| Service | How It's Used | Code Location |
|---|---|---|
| **Google Gemini 2.5 Flash** | Core AI engine — adversarial legal reasoning, multimodal PDF analysis, structured JSON output | `src/app/api/analyze/route.ts` |
| **Google Cloud Run** | Serverless container deployment with auto-scaling | `Dockerfile`, `cloudbuild.yaml` |
| **Google Artifact Registry** | Container image versioning and storage | `cloudbuild.yaml` |
| **Google Cloud Build** | CI/CD pipeline — build, push, deploy automation | `cloudbuild.yaml` |
| **Google Cloud Logging** | Structured JSON logging for monitoring and debugging | `src/lib/logger.ts` |
| **Google BigQuery** | Enterprise analytics tracking for contract risk events | `src/lib/gcp.ts` |
| **Google Cloud Storage** | Secure archiving for high-risk documents | `src/lib/gcp.ts` |
| **Google Analytics** | Traffic and interaction monitoring via next/third-parties | `src/app/layout.tsx` |
| **Google Fonts (Inter)** | Optimized typography via `next/font/google` with layout shift prevention | `src/app/layout.tsx` |

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **AI SDK:** `@google/genai` (Google Generative AI)
- **Styling:** Tailwind CSS v4
- **Icons:** `lucide-react` (zero local assets)
- **Testing:** Vitest + React Testing Library (64 tests)
- **Deployment:** Google Cloud Run (Dockerized, multi-stage)
- **CI/CD:** Google Cloud Build → Artifact Registry → Cloud Run

## Security Measures

- API keys stored server-side only (never in client bundle)
- 10MB file size limit enforcement (HTTP 413)
- Input sanitization (control character removal)
- Text truncation (30K char limit)
- POST-only endpoint (no GET/PUT/DELETE)
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Non-root Docker user
- `.env` gitignored

## Assumptions Made

- Not a replacement for professional legal advice
- PDF parsing uses Gemini's native multimodal capabilities (scanned/image PDFs require OCR)
- Fully stateless — no user data stored
- API key stored server-side via environment variables

## Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/clearclause.git

# 2. Install dependencies
npm install

# 3. Set your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env

# 4. Run tests
npm test

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

## Deploying to Google Cloud Run

```bash
# Using Google Cloud Build CI/CD pipeline
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=asia-south1,_SERVICE_NAME=clearclause
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/analyze/route.ts   # Gemini AI backend (server-side)
│   │   ├── globals.css            # Tailwind + dark theme tokens
│   │   ├── layout.tsx             # Root layout + SEO + Google Fonts
│   │   └── page.tsx               # Landing page + live dashboard
│   ├── components/
│   │   └── RiskCard.tsx            # RiskCard, ScoreCircle, MetricBar
│   ├── lib/
│   │   └── logger.ts              # Google Cloud Logging utility
│   └── __tests__/
│       ├── api.test.ts            # 37 API, security, and integration tests
│       ├── components.test.tsx    # 21 component + accessibility tests
│       └── logger.test.ts         # 7 Cloud Logging tests
├── Dockerfile                     # Multi-stage Cloud Run build
├── cloudbuild.yaml                # Google Cloud Build CI/CD pipeline
├── .dockerignore                  # Docker build exclusions
├── .env.example                   # Required environment variables
├── next.config.ts                 # Security headers + standalone output
├── vitest.config.ts               # Test framework configuration
├── prd.md                         # Product Requirements Document
├── techstack.md                   # Technical Architecture
├── design.md                      # Design System Documentation
└── README.md                      # This file
```

## License

MIT
