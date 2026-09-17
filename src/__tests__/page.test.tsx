import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import Home from "@/app/page";

afterEach(() => {
  cleanup();
});

describe("ClearClause Home Page", () => {
  it("renders navbar with brand title CLEARCLAUSE", () => {
    const { container } = render(<Home />);
    expect(container.textContent).toContain("CLEARCLAUSE");
  });

  it("renders main heading and hero section", () => {
    const { container } = render(<Home />);
    expect(container.textContent).toContain("AI That Reads");
    expect(container.textContent).toContain("the Fine Print");
  });

  it("renders contract text paste area and file upload prompt", () => {
    const { getByPlaceholderText, container } = render(<Home />);
    const textarea = getByPlaceholderText(/paste your legal document/i);
    expect(textarea).not.toBeNull();
    expect(container.textContent).toContain("Click to upload PDF or TXT file");
  });

  it("updates text input value on change", () => {
    const { getByPlaceholderText } = render(<Home />);
    const textarea = getByPlaceholderText(/paste your legal document/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Sample contract clause text for testing." } });
    expect(textarea.value).toBe("Sample contract clause text for testing.");
  });

  it("clears contract text when input is emptied", () => {
    const { getByPlaceholderText } = render(<Home />);
    const textarea = getByPlaceholderText(/paste your legal document/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Text to clear" } });
    expect(textarea.value).toBe("Text to clear");

    fireEvent.change(textarea, { target: { value: "" } });
    expect(textarea.value).toBe("");
  });

  it("triggers API fetch and renders analysis results on form submission", async () => {
    const mockResponse = {
      overallScore: 82,
      summary: "This contract contains standard terms with minor privacy risks.",
      documentType: "Employment Contract",
      metrics: {
        privacyScore: 80,
        financialRiskScore: 85,
        employmentFairnessScore: 90,
        ipProtectionScore: 80,
        terminationFairnessScore: 75,
        ambiguityScore: 82,
      },
      risks: [
        {
          id: "risk-1",
          category: "Privacy",
          originalText: "Company collects personal data.",
          explanation: "Standard data collection clause.",
          consequence: "Your basic info is logged.",
          severity: "Low",
          recommendation: "Ensure GDPR compliance.",
          industryStandard: "Standard terms",
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const { getByPlaceholderText, getByText, container } = render(<Home />);
    const textarea = getByPlaceholderText(/paste your legal document/i);
    fireEvent.change(textarea, { target: { value: "Sample contract clause text that is long enough for testing." } });

    const analyzeButton = getByText("Run Intelligence Matrix");
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(container.textContent).toContain("Employment Contract");
      expect(container.textContent).toContain("This contract contains standard terms");
    });
  });

  it("displays error message if API fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "Invalid API key" }),
    } as unknown as Response);

    const { getByPlaceholderText, getByText, container } = render(<Home />);
    const textarea = getByPlaceholderText(/paste your legal document/i);
    fireEvent.change(textarea, { target: { value: "Sample contract text for testing failure." } });

    const analyzeButton = getByText("Run Intelligence Matrix");
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(container.textContent).toContain("Invalid API key");
    });
  });
});
