import { describe, it, expect, vi, beforeEach } from "vitest";
import { logToBigQuery, archiveToStorage } from "@/lib/gcp";

vi.mock("@google-cloud/bigquery", () => {
  return {
    BigQuery: class {
      dataset() {
        return {
          table() {
            return {
              insert: vi.fn().mockResolvedValue([{}]),
            };
          },
        };
      }
    },
  };
});

vi.mock("@google-cloud/storage", () => {
  return {
    Storage: class {
      bucket() {
        return {
          file() {
            return {
              save: vi.fn().mockResolvedValue({}),
            };
          },
        };
      }
    },
  };
});

describe("GCP Integration - BigQuery & Storage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("skips BigQuery insertion when local without GCP credentials", async () => {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.K_SERVICE;

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await logToBigQuery({
      documentType: "Employment Contract",
      overallScore: 75,
      risksFound: 3,
      timestamp: new Date().toISOString(),
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("attempts BigQuery insertion when Cloud Run env K_SERVICE is present", async () => {
    process.env.K_SERVICE = "clearclause-service";

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await logToBigQuery({
      documentType: "Terms of Service",
      overallScore: 40,
      risksFound: 5,
      timestamp: new Date().toISOString(),
    });

    expect(spy).toHaveBeenCalled();
    delete process.env.K_SERVICE;
  });

  it("skips Storage archiving when local without GCP credentials", async () => {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.K_SERVICE;

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await archiveToStorage("test.txt", "contract text");

    expect(spy).not.toHaveBeenCalled();
  });

  it("attempts Storage archiving when Cloud Run env K_SERVICE is present", async () => {
    process.env.K_SERVICE = "clearclause-service";

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await archiveToStorage("high_risk.txt", "content");

    expect(spy).toHaveBeenCalled();
    delete process.env.K_SERVICE;
  });
});
