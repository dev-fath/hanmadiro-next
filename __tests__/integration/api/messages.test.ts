import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/messages/route";
import { prisma } from "@/lib/db/client";
import { createMockRequest } from "@/__tests__/utils/test-helpers";
import { requireAuth } from "@/lib/api/middleware";

vi.mock("@/lib/db/client");
vi.mock("@/lib/api/middleware", async () => {
  const actual = await vi.importActual("@/lib/api/middleware");
  return {
    ...actual,
    logRequest: vi.fn(() => vi.fn()),
    generalRateLimiter: vi.fn(() => true),
    requireAuth: vi.fn(),
  };
});

describe("GET /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("인증되지 않은 사용자는 401을 받아야 함", async () => {
    (getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.code).toBe(401);
  });

  it("인증된 사용자는 메시지 목록을 받아야 함", async () => {
    (requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const mockMessages = [
      {
        id: "msg-1",
        title: "테스트 제목",
        body: "테스트 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prisma.message.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockMessages);

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].title).toBe("테스트 제목");
  });
});

describe("POST /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("인증되지 않은 사용자는 401을 받아야 함", async () => {
    (getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const request = createMockRequest({
      method: "POST",
      body: { title: "제목", body: "내용" },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.code).toBe(401);
  });

  it("유효한 메시지를 생성할 수 있어야 함", async () => {
    (requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const newMessage = {
      id: "new-msg-id",
      title: "새 제목",
      body: "새 내용",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.message.create as ReturnType<typeof vi.fn>).mockResolvedValue(newMessage);

    const request = createMockRequest({
      method: "POST",
      body: { title: "새 제목", body: "새 내용" },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.code).toBe(201);
    expect(data.data.title).toBe("새 제목");
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: { title: "새 제목", body: "새 내용" },
    });
  });

  it("유효하지 않은 입력은 400을 반환해야 함", async () => {
    (requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const request = createMockRequest({
      method: "POST",
      body: { title: "a".repeat(256), body: "내용" },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(400);
  });
});

