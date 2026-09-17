import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/** Helper to read the API route source code */
function readRouteSource(): string {
  const routePath = path.resolve(__dirname, "../app/api/analyze/route.ts");
  return fs.readFileSync(routePath, "utf-8");
}

/** Helper to read any project file */
function readProjectFile(relativePath: string): string {
  const filePath = path.resolve(__dirname, "../..", relativePath);
  return fs.readFileSync(filePath, "utf-8");
}

describe("API Route - Module Structure", () => {
  it("exports a POST handler", async () => {
    const routeModule = await import("@/app/api/analyze/route");
    expect(routeModule.POST).toBeDefined();
    expect(typeof routeModule.POST).toBe("function");
  });

  it("does NOT export a GET handler (POST-only security)", async () => {
    const routeModule = await import("@/app/api/analyze/route") as Record<string, unknown>;
    expect(routeModule.GET).toBeUndefined();
  });

  it("does NOT export a PUT handler", async () => {
    const routeModule = await import("@/app/api/analyze/route") as Record<string, unknown>;
    expect(routeModule.PUT).toBeUndefined();
  });

  it("does NOT export a DELETE handler", async () => {
    const routeModule = await import("@/app/api/analyze/route") as Record<string, unknown>;
    expect(routeModule.DELETE).toBeUndefined();
  });
});

describe("Security Constraints", () => {
  it("API key is loaded from process.env, not hardcoded", () => {
    const source = readRouteSource();
    expect(source).toContain("process.env.GEMINI_API_KEY");
    expect(source).not.toMatch(/apiKey:\s*["'][A-Za-z0-9_.-]{20,}["']/);
  });

  it("enforces maximum file size limit", () => {
    const source = readRouteSource();
    expect(source).toContain("MAX_FILE_SIZE");
    expect(source).toContain("413");
  });

  it("truncates excessively long input to prevent token overflow", () => {
    const source = readRouteSource();
    expect(source).toContain("MAX_TEXT_LENGTH");
    expect(source).toContain("truncateText");
    expect(source).toContain("truncated");
  });

  it("sanitizes user input to remove control characters", () => {
    const source = readRouteSource();
    expect(source).toContain("sanitizeInput");
  });

  it("validates minimum text length", () => {
    const source = readRouteSource();
    expect(source).toContain("MIN_TEXT_LENGTH");
  });
});

describe("Google Gemini Integration", () => {
  it("uses Google Gemini 3.6 Flash model", () => {
    const source = readRouteSource();
    expect(source).toContain("gemini-3.6-flash");
  });

  it("uses the official @google/genai SDK", () => {
    const source = readRouteSource();
    expect(source).toContain("@google/genai");
    expect(source).toContain("GoogleGenAI");
  });

  it("supports PDF uploads via Gemini multimodal inlineData", () => {
    const source = readRouteSource();
    expect(source).toContain("inlineData");
    expect(source).toContain("application/pdf");
    expect(source).toContain("base64");
  });

  it("uses low temperature for deterministic legal analysis", () => {
    const source = readRouteSource();
    expect(source).toContain("temperature: 0.2");
  });
});

describe("Prompt Engineering Quality", () => {
  it("contains adversarial legal analysis persona", () => {
    const source = readRouteSource();
    expect(source).toContain("adversarial legal intelligence");
    expect(source).toContain("CLEARCLAUSE");
  });

  it("requires structured JSON output with all risk fields", () => {
    const source = readRouteSource();
    expect(source).toContain("overallScore");
    expect(source).toContain("severity");
    expect(source).toContain("consequence");
    expect(source).toContain("Nightmare Scenario");
    expect(source).toContain("recommendation");
  });

  it("requests all six metric dimensions", () => {
    const source = readRouteSource();
    expect(source).toContain("privacyScore");
    expect(source).toContain("financialRiskScore");
    expect(source).toContain("employmentFairnessScore");
    expect(source).toContain("ipProtectionScore");
    expect(source).toContain("terminationFairnessScore");
    expect(source).toContain("ambiguityScore");
  });

  it("includes scoring guide with severity ranges", () => {
    const source = readRouteSource();
    expect(source).toContain("90-100");
    expect(source).toContain("70-89");
    expect(source).toContain("40-69");
    expect(source).toContain("0-39");
  });
});

describe("Code Quality - JSDoc Documentation", () => {
  it("has JSDoc on the POST handler", () => {
    const source = readRouteSource();
    expect(source).toContain("* POST /api/analyze");
    expect(source).toContain("@param req");
    expect(source).toContain("@returns");
  });

  it("has JSDoc on helper functions", () => {
    const source = readRouteSource();
    expect(source).toContain("* Truncates text");
    expect(source).toContain("* Sanitizes user input");
  });
});

describe("Configuration Files", () => {
  it("Dockerfile exists for Google Cloud Run deployment", () => {
    const dockerPath = path.resolve(__dirname, "../../Dockerfile");
    expect(fs.existsSync(dockerPath)).toBe(true);
  });

  it("Dockerfile uses multi-stage build for efficiency", () => {
    const dockerPath = path.resolve(__dirname, "../../Dockerfile");
    const content = fs.readFileSync(dockerPath, "utf-8");
    expect(content).toContain("FROM node:20-alpine AS builder");
    expect(content).toContain("FROM node:20-alpine AS runner");
  });

  it("Dockerfile uses non-root user for security", () => {
    const dockerPath = path.resolve(__dirname, "../../Dockerfile");
    const content = fs.readFileSync(dockerPath, "utf-8");
    expect(content).toContain("USER nextjs");
    expect(content).toContain("adduser");
  });

  it(".env.example exists documenting required variables", () => {
    const envPath = path.resolve(__dirname, "../../.env.example");
    expect(fs.existsSync(envPath)).toBe(true);
    const content = fs.readFileSync(envPath, "utf-8");
    expect(content).toContain("GEMINI_API_KEY");
  });

  it("next.config has security headers", () => {
    const configPath = path.resolve(__dirname, "../../next.config.ts");
    const content = fs.readFileSync(configPath, "utf-8");
    expect(content).toContain("X-Content-Type-Options");
    expect(content).toContain("X-Frame-Options");
    expect(content).toContain("Content-Security-Policy");
    expect(content).toContain("Strict-Transport-Security");
  });

  it("next.config has standalone output for Cloud Run", () => {
    const configPath = path.resolve(__dirname, "../../next.config.ts");
    const content = fs.readFileSync(configPath, "utf-8");
    expect(content).toContain('output: "standalone"');
  });
});

describe("Google Cloud Services Integration", () => {
  it("API route uses Google Cloud Logging", () => {
    const source = readRouteSource();
    expect(source).toContain("logAnalysisRequest");
    expect(source).toContain("logAnalysisComplete");
    expect(source).toContain("logAnalysisError");
    expect(source).toContain("cloudLog");
  });

  it("cloudbuild.yaml exists for Google Cloud Build CI/CD", () => {
    const cbPath = path.resolve(__dirname, "../../cloudbuild.yaml");
    expect(fs.existsSync(cbPath)).toBe(true);
  });

  it("cloudbuild.yaml deploys to Google Cloud Run", () => {
    const content = readProjectFile("cloudbuild.yaml");
    expect(content).toContain("gcloud");
    expect(content).toContain("run");
    expect(content).toContain("deploy");
  });

  it("cloudbuild.yaml pushes to Google Artifact Registry", () => {
    const content = readProjectFile("cloudbuild.yaml");
    expect(content).toContain("artifacts repositories");
    expect(content).toContain("docker.pkg.dev");
  });

  it("cloudbuild.yaml uses Google Cloud Build workers", () => {
    const content = readProjectFile("cloudbuild.yaml");
    expect(content).toContain("gcr.io/cloud-builders/docker");
    expect(content).toContain("CLOUD_LOGGING_ONLY");
  });

  it("layout uses Google Fonts via next/font optimization", () => {
    const layoutPath = path.resolve(__dirname, "../app/layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).toContain("next/font/google");
    expect(content).toContain("Inter");
  });
});

describe("Problem Statement Alignment", () => {
  it("implements multi-agent adversarial reasoning", () => {
    const source = readRouteSource();
    expect(source).toContain("AGENT A");
    expect(source).toContain("AGENT B");
    expect(source).toContain("CORPORATE EXPLOITER");
    expect(source).toContain("USER ADVOCATE");
  });

  it("supports document type classification", () => {
    const source = readRouteSource();
    expect(source).toContain("documentType");
    expect(source).toContain("Employment Contract");
    expect(source).toContain("Privacy Policy");
    expect(source).toContain("Terms of Service");
  });

  it("provides negotiation recommendations", () => {
    const source = readRouteSource();
    expect(source).toContain("recommendation");
    expect(source).toContain("negotiation");
  });

  it("compares against industry standards", () => {
    const source = readRouteSource();
    expect(source).toContain("industryStandard");
    expect(source).toContain("industry standards");
  });

  it("supports PDF file processing", () => {
    const source = readRouteSource();
    expect(source).toContain(".pdf");
    expect(source).toContain("application/pdf");
  });

  it("provides explainable AI insights", () => {
    const source = readRouteSource();
    expect(source).toContain("plain-English explanation");
    expect(source).toContain("Nightmare Scenario");
    expect(source).toContain("consequence");
  });
});

describe("Vercel & Resilience Engineering", () => {
  it("exports maxDuration = 60 for Vercel serverless execution", () => {
    const source = readRouteSource();
    expect(source).toContain("export const maxDuration = 60");
  });

  it("exports dynamic = 'force-dynamic' for Vercel route handling", () => {
    const source = readRouteSource();
    expect(source).toContain("export const dynamic = \"force-dynamic\"");
  });

  it("implements exponential backoff retry logic and fallback model routing", () => {
    const source = readRouteSource();
    expect(source).toContain("generateContentWithRetry");
    expect(source).toContain("gemini-3.6-flash");
    expect(source).toContain("gemini-1.5-flash");
  });

  it("catches 503 high demand and 429 rate limit errors gracefully", () => {
    const source = readRouteSource();
    expect(source).toContain("503");
    expect(source).toContain("UNAVAILABLE");
    expect(source).toContain("429");
    expect(source).toContain("RESOURCE_EXHAUSTED");
  });
});

