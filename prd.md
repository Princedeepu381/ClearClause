# Product Requirements Document: CLEARCLAUSE — AI Rights & Contract Intelligence System

## 1. Product Overview
CLEARCLAUSE is an AI-powered contract intelligence platform that analyzes legal and quasi-legal documents to identify potentially harmful, exploitative, ambiguous, or high-risk clauses before users agree to them. Built entirely on a **Google-native technology stack**, the system leverages **Google Gemini 2.5 Flash** for adversarial multi-agent legal reasoning, **Google Cloud Run** for serverless deployment, **Google Artifact Registry** for container management, and **Google Fonts** for optimized typography — demonstrating deep, end-to-end integration of Google Cloud services.

The platform extracts and classifies contractual clauses, evaluates risk through severity scoring, reasons about real-world consequences via adversarial AI agents, and provides explainable, plain-language insights — empowering individuals and organizations to make informed decisions.

## 2. Target Audience
- Independent developers, freelance creators, and open-source maintainers who sign vendor and employment contracts
- Startups and small businesses evaluating partnership, licensing, or subscription agreements
- Privacy-conscious individuals reviewing terms of service or data collection policies
- Legal teams seeking AI-assisted first-pass contract risk triage

## 3. Core Features

### 3.1 Adversarial Legal Reasoning Engine (Powered by Google Gemini 2.5 Flash)
A multi-agent contract evaluation pipeline orchestrated through the **Google Gemini 2.5 Flash API** via the `@google/genai` SDK:
- **Agent A (Corporate Exploiter):** Scans contract text to identify hostile legal traps, hidden liabilities, and one-sided obligations from an adversarial corporate perspective.
- **Agent B (User Advocate):** Intercepts Agent A's findings and maps each exploit into real-world operational consequences — the "Nightmare Scenario."

All inference executes server-side within isolated **Next.js Route Handlers**, ensuring API keys remain fully protected and never exposed to the client.

### 3.2 Severity-Based Risk Scoring & Classification
Each detected risk is classified into **High / Medium / Low** severity tiers, providing users with an at-a-glance understanding of which clauses demand immediate attention. The scoring leverages Gemini's contextual reasoning to go beyond keyword matching.

### 3.3 Explainable AI Insights
Every identified risk provides:
- **Original Clause Text:** The exact confusing legal language
- **Plain-English Explanation:** What the clause actually means for the user
- **Real-World Consequence:** The tangible impact if the user signs without modification

### 3.4 Multi-Category Agreement Support
The system analyzes diverse contract types including:
- Employment agreements (non-compete, IP assignment)
- Vendor and freelance contracts (indemnification, liability caps)
- Subscription terms (auto-renewal, cancellation penalties)
- Privacy policies (data collection, third-party sharing)
- Platform terms of service (arbitration, governing law)

## 4. Google Services Integration Matrix

| Google Service              | Integration Purpose                                                 |
|-----------------------------|----------------------------------------------------------------------|
| **Google Gemini 2.5 Flash** | Core AI engine for adversarial legal reasoning and risk analysis     |
| **Google Cloud Run**        | Serverless container deployment for the production application       |
| **Google Artifact Registry**| Container image storage and versioned deployment management          |
| **Google Fonts (Inter)**    | Optimized web typography via Next.js font system                     |
| **Google Cloud Build**      | CI/CD pipeline for automated container builds                        |
| **Google Cloud Logging**    | Centralized production monitoring and error tracking                 |

## 5. Evaluation & Compliance Metrics
- **Explainability:** Every risk explicitly lists the exact original text, a concrete real-world consequence, and clear severity classification. Zero opaque black-box predictions.
- **Legal Reasoning Quality:** Adversarial multi-agent reasoning that understands contractual implications beyond surface-level keyword detection.
- **Risk Identification Accuracy:** Tested against known exploitative contract templates to validate detection of non-compete restrictions, IP transfers, liability caps, privacy violations, and arbitration traps.
- **Accessibility:** WCAG-compliant dark theme, semantic HTML, proper heading hierarchy, and keyboard-navigable interactive components.
- **Open-Source Footprint:** Fully open-source codebase with zero opaque processing and complete structural clarity.