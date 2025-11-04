import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/db/client";
import { createMockRequest } from "@/__tests__/utils/test-helpers";
import bcrypt from "bcrypt";

vi.mock("@/lib/db/client");
vi.mock("bcrypt");
vi.mock("@/lib/api/middleware", async () => {
  const actual = await vi.importActual("@/lib/api/middleware");
  return {
    ...actual,
    logRequest: vi.fn(() => vi.fn()),
    registerRateLimiter: vi.fn(() => true),
  };
});

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("유효한 회원가입 요청은 성공해야 함", async () => {
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue("hashed-password");
    (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-id",
      name: "테스트유저",
      createdAt: new Date(),
    } as never);

    const request = createMockRequest({
      method: "POST",
      body: {
        name: "테스트유저",
        password: "Password123!",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.code).toBe(201);
    expect(data.data.name).toBe("테스트유저");
    expect(bcrypt.hash).toHaveBeenCalledWith("Password123!", 10);
  });

  it("중복된 사용자 이름은 400을 반환해야 함", async () => {
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "existing-user-id",
      name: "테스트유저",
    } as never);

    const request = createMockRequest({
      method: "POST",
      body: {
        name: "테스트유저",
        password: "Password123!",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(400);
    expect(data.message).toContain("이미 존재");
  });

  it("유효하지 않은 비밀번호는 400을 반환해야 함", async () => {
    const request = createMockRequest({
      method: "POST",
      body: {
        name: "테스트유저",
        password: "weak",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(400);
  });

  it("유효하지 않은 이름은 400을 반환해야 함", async () => {
    const request = createMockRequest({
      method: "POST",
      body: {
        name: "a".repeat(51),
        password: "Password123!",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(400);
  });
});

