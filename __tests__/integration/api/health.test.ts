import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/health/route";
import { checkAllServices } from "@/lib/health";
import { createMockRequest } from "@/__tests__/utils/test-helpers";

vi.mock("@/lib/health");

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 서비스가 정상일 때 200 응답을 반환해야 함", async () => {
    (checkAllServices as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: "healthy",
      services: {
        database: {
          status: "healthy",
          responseTime: 10,
          lastChecked: new Date().toISOString(),
        },
        firebase: {
          status: "healthy",
          responseTime: 5,
          lastChecked: new Date().toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    });

    const request = createMockRequest();
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.data.status).toBe("healthy");
    expect(data.message).toContain("healthy");
  });

  it("일부 서비스에 문제가 있을 때 503 응답을 반환해야 함", async () => {
    (checkAllServices as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: "unhealthy",
      services: {
        database: {
          status: "healthy",
          responseTime: 10,
          lastChecked: new Date().toISOString(),
        },
        firebase: {
          status: "unhealthy",
          responseTime: 5000,
          lastChecked: new Date().toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    });

    const request = createMockRequest();
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.code).toBe(503);
    expect(data.data.status).toBe("unhealthy");
  });

  it("헬스체크 실패 시 에러 응답을 반환해야 함", async () => {
    (checkAllServices as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("헬스체크 실패"));

    const request = createMockRequest();
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe(500);
    expect(data.message).toContain("오류");
  });
});

