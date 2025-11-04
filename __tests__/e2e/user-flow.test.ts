import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { GET as messagesGET, POST as messagesPOST } from "@/app/api/messages/route";
import { prisma } from "@/lib/db/client";
import { createMockRequest } from "@/__tests__/utils/test-helpers";
import bcrypt from "bcrypt";
import { requireAuth } from "@/lib/api/middleware";

vi.mock("@/lib/db/client");
vi.mock("bcrypt");
vi.mock("@/lib/api/middleware", async () => {
  const actual = await vi.importActual("@/lib/api/middleware");
  return {
    ...actual,
    logRequest: vi.fn(() => vi.fn()),
    generalRateLimiter: vi.fn(() => true),
    registerRateLimiter: vi.fn(() => true),
    requireAuth: vi.fn(),
  };
});

describe("사용자 플로우 E2E 테스트", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("회원가입 → 로그인 → 메시지 조회 플로우", () => {
    it("전체 플로우가 정상적으로 작동해야 함", async () => {
      // 1. 회원가입
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue("hashed-password");
      (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "user-id",
        name: "테스트유저",
        createdAt: new Date(),
      } as never);

      const registerRequest = createMockRequest({
        method: "POST",
        body: {
          name: "테스트유저",
          password: "Password123!",
        },
      });

      const registerResponse = await registerPOST(registerRequest);
      const registerData = await registerResponse.json();

      expect(registerResponse.status).toBe(201);
      expect(registerData.code).toBe(201);
      expect(registerData.data.name).toBe("테스트유저");

      // 2. 인증 설정
      (requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // 3. 메시지 조회
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

      const messagesRequest = createMockRequest({
        method: "GET",
      });

      const messagesResponse = await messagesGET(messagesRequest);
      const messagesData = await messagesResponse.json();

      expect(messagesResponse.status).toBe(200);
      expect(messagesData.code).toBe(200);
      expect(messagesData.data).toHaveLength(1);
    });
  });

  describe("회원가입 → 메시지 생성 플로우", () => {
    it("회원가입 후 메시지를 생성할 수 있어야 함", async () => {
      // 회원가입
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue("hashed-password");
      (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "user-id",
        name: "테스트유저",
        createdAt: new Date(),
      } as never);

      const registerRequest = createMockRequest({
        method: "POST",
        body: {
          name: "테스트유저",
          password: "Password123!",
        },
      });

      await registerPOST(registerRequest);

      // 인증 설정
      (requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // 메시지 생성
      const newMessage = {
        id: "new-msg-id",
        title: "새 메시지",
        body: "새 메시지 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.message.create as ReturnType<typeof vi.fn>).mockResolvedValue(newMessage);

      const createRequest = createMockRequest({
        method: "POST",
        body: {
          title: "새 메시지",
          body: "새 메시지 내용",
        },
      });

      const createResponse = await messagesPOST(createRequest);
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData.code).toBe(201);
      expect(createData.data.title).toBe("새 메시지");
    });
  });
});

