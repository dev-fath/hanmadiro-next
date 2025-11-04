import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/push-tokens/route";
import { prisma } from "@/lib/db/client";
import { createMockRequest } from "@/__tests__/utils/test-helpers";

vi.mock("@/lib/db/client");

describe("POST /api/push-tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("새로운 토큰을 등록할 수 있어야 함", async () => {
    const newToken = {
      id: "token-id",
      token: "fcm-token-123",
      isValid: true,
      lastUsedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.pushToken.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(newToken);

    const request = createMockRequest({
      method: "POST",
      body: {
        token: "fcm-token-123",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.code).toBe(201);
    expect(prisma.pushToken.upsert).toHaveBeenCalledWith({
      where: { token: "fcm-token-123" },
      update: {
        isValid: true,
        lastUsedAt: expect.any(Date),
      },
      create: {
        token: "fcm-token-123",
        isValid: true,
        lastUsedAt: expect.any(Date),
      },
    });
  });

  it("기존 토큰은 업데이트되어야 함", async () => {
    const existingToken = {
      id: "token-id",
      token: "fcm-token-123",
      isValid: true,
      lastUsedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.pushToken.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(existingToken);

    const request = createMockRequest({
      method: "POST",
      body: {
        token: "fcm-token-123",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.code).toBe(201);
  });

  it("토큰이 없으면 400을 반환해야 함", async () => {
    const request = createMockRequest({
      method: "POST",
      body: {},
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(400);
  });
});

