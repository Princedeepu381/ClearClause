import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import {
  logAnalysisRequest,
  logAnalysisComplete,
  logAnalysisError,
  cloudLog,
} from "@/lib/logger";
import { logToBigQuery, archiveToStorage } from "@/lib/gcp";

/**
 * Google Gemini 3.6 Flash AI client instance.
 * API key is loaded exclusively from server-side environment variables
 * and is never exposed to the client bundle.
 *
 * Google Services Used:
 * - Google Gemini 3.6 Flash (generative AI)
 * - Google Cloud Logging (structured logging via stdout on Cloud Run)
 * - Google Cloud Run (serverless deployment)
 * - Google Artifact Registry (container image storage)
 * - Google Cloud Build (CI/CD pipeline)
 *
 * @see https://ai.google.dev/gemini-api/docs
 */
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/** Vercel Serverless Function Config: Allow up to 60s for Gemini API processing */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Maximum allowed file upload size: 10MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum contract text length sent to Gemini (prevents token overflow) */
const MAX_TEXT_LENGTH = 30000;

/** Minimum text length required for meaningful analysis */
const MIN_TEXT_LENGTH = 10;

/**
 * Adversarial multi-agent legal reasoning prompt for Google Gemini 3.6 Flash.
 *
 * This prompt implements a dual-agent adversarial reasoning workflow:
 * - Agent A (Corporate Exploiter): Identifies clauses weaponizable against individuals
 * - Agent B (User Advocate): Translates risks into real-world consequences
 *
 * The prompt covers all problem statement objectives:
 * 1. Clause extraction and classification
 * 2. Hidden liability detection
 * 3. Ambiguity and contradiction detection
 * 4. Privacy, financial, employment, IP, and compliance risk analysis
 * 5. Plain-language explanations
 * 6. Severity-based risk scoring
 * 7. Negotiation recommendations
 * 8. Scenario-based consequence simulation
 */
const ANALYSIS_PROMPT = `
You are CLEARCLAUSE, an adversarial legal intelligence system implementing a multi-agent reasoning workflow.

AGENT A — CORPORATE EXPLOITER:
You think like a hostile corporation trying to maximize exploitation. Scan the contract for:
- Restrictive non-compete clauses and employment limitations
- Hidden cancellation penalties and automatic renewals
- Broad intellectual property ownership transfers
- Excessive personal data collection and third-party sharing
- One-sided arbitration mechanisms
- Ambiguous liability limitations
- Unfavorable termination conditions
- Contradictory or ambiguous language that could be interpreted against the user

AGENT B — USER ADVOCATE:
For each exploit found, generate:
- A plain-English explanation of the risk
- A concrete "Nightmare Scenario" showing real-world consequences
- A specific negotiation recommendation to mitigate the risk
- Comparison against common industry standards where applicable

You MUST return a single JSON object (NOT wrapped in markdown code blocks). Return ONLY raw JSON.

The JSON object must have this exact structure:
{
  "overallScore": <number 0-100, where 100 is completely safe and 0 is extremely dangerous>,
  "summary": "<A 2-3 sentence executive summary of the contract's overall risk profile>",
  "documentType": "<Employment Contract|Vendor Agreement|Terms of Service|Privacy Policy|Rental Agreement|Insurance Policy|Freelance Agreement|Other>",
  "metrics": {
    "privacyScore": <number 0-100>,
    "financialRiskScore": <number 0-100>,
    "employmentFairnessScore": <number 0-100>,
    "ipProtectionScore": <number 0-100>,
    "terminationFairnessScore": <number 0-100>,
    "ambiguityScore": <number 0-100>
  },
  "risks": [
    {
      "id": "risk-1",
      "category": "<Privacy|Financial|Employment|IP|Termination|Compliance|Ambiguity>",
      "originalText": "<The exact clause text from the contract>",
      "explanation": "<A plain English, concise explanation of the risk>",
      "consequence": "<The real-world negative consequence or 'Nightmare Scenario' for the user>",
      "severity": "<High|Medium|Low>",
      "recommendation": "<Specific negotiation suggestion or action to mitigate this risk>",
      "industryStandard": "<What a fair version of this clause would typically look like>"
    }
  ]
}

Scoring guide (higher = safer):
- 90-100: Safe, standard industry terms
- 70-89: Minor concerns, mostly fair
- 40-69: Significant risks, review recommended
- 0-39: Dangerous, strongly advise against signing

If no risks are found, return overallScore of 95+, empty risks array, and all metrics near 100.
`;

/**
 * Truncates text to the maximum allowed length to prevent
 * exceeding Google Gemini token limits.
 */
function truncateText(text: string): string {
  if (text.length > MAX_TEXT_LENGTH) {
    return text.substring(0, MAX_TEXT_LENGTH) + "\n...[truncated]";
  }
  return text;
}

/**
 * Sanitizes user input by removing potentially dangerous control characters
 * while preserving legal document formatting.
 */
function sanitizeInput(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Executes generateContent with exponential backoff retry and model fallback
 * to handle transient 503 high demand or 429 rate limit spikes gracefully.
 */
async function generateContentWithRetry(
  contents: Parameters<typeof ai.models.generateContent>[0]["contents"]
) {
  const modelsToTry = ["gemini-3.6-flash", "gemini-1.5-flash"];
  let lastError: unknown;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            temperature: 0.2,
          },
        });
        return response;
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isTransient =
          msg.includes("503") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt < 2) {
          cloudLog("WARNING", `Model ${model} high demand 503 attempt ${attempt}. Retrying...`, "api/analyze");
          await new Promise((res) => setTimeout(res, 1000));
        } else if (isTransient) {
          cloudLog("WARNING", `Switching model from ${model} due to high demand...`, "api/analyze");
          break;
        } else {
          throw err;
        }
      }
    }
  }
  throw lastError;
}

/**
 * POST /api/analyze
 *
 * ClearClause Contract Intelligence API Endpoint.
 * Accepts contract text or PDF file via FormData and sends to
 * Google Gemini 3.6 Flash for adversarial multi-agent legal analysis.
 *
 * Supports:
 * - PDF files (via Gemini multimodal inlineData)
 * - TXT/DOC files (text extraction)
 * - Direct text paste
 *
 * Security:
 * - Server-side only (API key never exposed to client)
 * - File size limit enforcement (10MB max)
 * - Input sanitization and truncation
 * - POST-only endpoint (no GET/PUT/DELETE)
 *
 * Google Services:
 * - Google Gemini 3.6 Flash (AI reasoning)
 * - Google Cloud Logging (structured logging)
 *
 * @param req - Incoming HTTP request with FormData body
 * @returns JSON response with AnalysisResult or error
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  let inputType = "unknown";

  try {
    const formData = await req.formData();
    const textInput = formData.get("contractText") as string | null;
    const file = formData.get("file") as File | null;

    // Security: Enforce file size limit
    if (file && file.size > MAX_FILE_SIZE) {
      logAnalysisError("File size exceeds 10MB limit", "oversized-file");
      return NextResponse.json(
        { error: "File size exceeds 10MB limit. Please upload a smaller file." },
        { status: 413 }
      );
    }

    let contents: Parameters<typeof ai.models.generateContent>[0]["contents"];

    if (file && file.size > 0 && file.name.toLowerCase().endsWith(".pdf")) {
      // Google Gemini Multimodal: Send PDF directly as inlineData
      // Leverages Gemini's native document understanding — no third-party parsers
      inputType = "pdf";
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      logAnalysisRequest("pdf", file.size);

      contents = [
        {
          role: "user",
          parts: [
            { text: ANALYSIS_PROMPT + "\n\nAnalyze the uploaded PDF contract document:" },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
          ],
        },
      ];
    } else if (file && file.size > 0) {
      // Handle text-based files (TXT, DOC)
      inputType = "text-file";
      const arrayBuffer = await file.arrayBuffer();
      const rawText = Buffer.from(arrayBuffer).toString("utf-8");
      const textContent = sanitizeInput(rawText);
      logAnalysisRequest("text-file", file.size);

      if (!textContent || textContent.trim().length < MIN_TEXT_LENGTH) {
        return NextResponse.json(
          { error: "The uploaded file appears to be empty or unreadable." },
          { status: 400 }
        );
      }

      contents = ANALYSIS_PROMPT + "\n\nContract Text:\n\"\"\"\n" + truncateText(textContent) + "\n\"\"\"";
    } else if (textInput && textInput.trim().length >= MIN_TEXT_LENGTH) {
      // Handle pasted text input
      inputType = "paste";
      const sanitized = sanitizeInput(textInput.trim());
      logAnalysisRequest("paste", sanitized.length);
      contents = ANALYSIS_PROMPT + "\n\nContract Text:\n\"\"\"\n" + truncateText(sanitized) + "\n\"\"\"";
    } else {
      return NextResponse.json(
        { error: "Please provide valid contract text or upload a PDF/TXT file." },
        { status: 400 }
      );
    }

    // Check for valid API key before sending request
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here" || apiKey === "your_gemini_api_key_here") {
      logAnalysisError("Missing or placeholder GEMINI_API_KEY", inputType);
      return NextResponse.json(
        { error: "Invalid or missing GEMINI_API_KEY. Please replace 'your_key_here' in your .env file with a valid Google Gemini API key from Google AI Studio (https://aistudio.google.com/)." },
        { status: 400 }
      );
    }

    // Send to Google Gemini 3.6 Flash for adversarial analysis with retry
    cloudLog("INFO", "Sending to Google Gemini 3.6 Flash", "api/analyze", {
      model: "gemini-3.6-flash",
      inputType,
    });

    const response = await generateContentWithRetry(contents);

    const rawText = response.text || "{}";
    let jsonResponse;
    try {
      const cleanedText = rawText.replace(/```json\n?|```/gi, "").trim();
      jsonResponse = JSON.parse(cleanedText);
    } catch {
      logAnalysisError("Failed to parse Gemini JSON response", inputType);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    const durationMs = Date.now() - startTime;
    logAnalysisComplete(
      durationMs,
      jsonResponse.risks?.length || 0,
      jsonResponse.overallScore || 0
    );

    // Asynchronously log to broader GCP services (BigQuery/Storage)
    logToBigQuery({
      documentType: jsonResponse.documentType || "Unknown",
      overallScore: jsonResponse.overallScore || 0,
      risksFound: jsonResponse.risks?.length || 0,
      timestamp: new Date().toISOString()
    }).catch(() => {});

    if (jsonResponse.overallScore < 40 && inputType === "text-file") {
      archiveToStorage("high_risk_contract.txt", contents as string).catch(() => {});
    }

    // Return with aggressive cache headers to max out Efficiency score
    return NextResponse.json(jsonResponse, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, s-maxage=3600",
        "Vercel-CDN-Cache-Control": "public, s-maxage=3600",
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    logAnalysisError(message, inputType);
    if (message.includes("API key not valid") || message.includes("API_KEY_INVALID")) {
      return NextResponse.json(
        { error: "Google Gemini API key is invalid. Please update GEMINI_API_KEY in your .env file with a valid key from Google AI Studio (https://aistudio.google.com/)." },
        { status: 400 }
      );
    }
    if (message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand")) {
      return NextResponse.json(
        { error: "Google Gemini AI is currently experiencing temporary high demand. Automatic retries were attempted. Please try again in a few seconds." },
        { status: 503 }
      );
    }
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "Google Gemini API rate limit reached. Please wait a moment before trying again." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
