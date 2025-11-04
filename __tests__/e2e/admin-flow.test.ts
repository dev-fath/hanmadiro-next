import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as statsGET } from "@/app/api/stats/route";
import { GET as usersGET } from "@/app/api/auth/users/route";
import { GET as logsGET } from "@/app/api/logs/route";
import { prisma } from "@/lib/db/client";
import { createMockRequest, createMockSession } from "@/__tests__/utils/test-helpers";
import { getServerSession } from "next-auth";

vi.mock("@/lib/db/client");
vi.mock("next-auth");

describe("어드민 플로우 E2E 테스트", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("인증된 사용자의 어드민 기능 접근", () => {
    it("통계 조회 → 회원 목록 조회 → 로그 조회 플로우가 작동해야 함", async () => {
      (requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // 통계 조회
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      (prisma.pushLog.count as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(100) // totalLogs
        .mockResolvedValueOnce(95) // successLogs
        .mockResolvedValueOnce(10) // todayLogs
        .mockResolvedValueOnce(9); // todaySuccessLogs
      (prisma.pushToken.count as ReturnType<typeof vi.fn>).mockResolvedValue(50);
      (prisma.message.count as ReturnType<typeof vi.fn>).mockResolvedValue(20);
      (prisma.pushLog.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const statsRequest = createMockRequest({ method: "GET" });
      const statsResponse = await statsGET(statsRequest);
      const statsData = await statsResponse.json();

      expect(statsResponse.status).toBe(200);
      expect(statsData.code).toBe(200);
      expect(statsData.data.overall.totalSent).toBe(100);

      // 회원 목록 조회
      const mockUsers = [
        {
          id: "user-1",
          name: "사용자1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "user-2",
          name: "사용자2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsers);
      (prisma.user.count as ReturnType<typeof vi.fn>).mockResolvedValue(2);

      const usersRequest = createMockRequest({ method: "GET" });
      const usersResponse = await usersGET(usersRequest);
      const usersData = await usersResponse.json();

      expect(usersResponse.status).toBe(200);
      expect(usersData.code).toBe(200);
      expect(usersData.data.users).toHaveLength(2);

      // 로그 조회
      const mockLogs = [
        {
          id: "log-1",
          pushTokenId: "token-1",
          messageId: "msg-1",
          sentAt: new Date(),
          success: true,
          errorMessage: null,
        },
      ];

      (prisma.pushLog.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockLogs);
      (prisma.pushLog.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

      const logsRequest = createMockRequest({ method: "GET" });
      const logsResponse = await logsGET(logsRequest);
      const logsData = await logsResponse.json();

      expect(logsResponse.status).toBe(200);
      expect(logsData.code).toBe(200);
      expect(logsData.data.logs).toHaveLength(1);
    });
  });

  describe("인증되지 않은 사용자의 접근 차단", () => {
    it("인증 없이 통계 조회는 401을 반환해야 함", async () => {
      const { UnauthorizedError } = await import("@/lib/errors/ApiError");
      (requireAuth as ReturnType<typeof vi.fn>).mockRejectedValue(new UnauthorizedError());

      const request = createMockRequest({ method: "GET" });
      const response = await statsGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.code).toBe(401);
    });

    it("인증 없이 회원 목록 조회는 401을 반환해야 함", async () => {
      const { UnauthorizedError } = await import("@/lib/errors/ApiError");
      (requireAuth as ReturnType<typeof vi.fn>).mockRejectedValue(new UnauthorizedError());

      const request = createMockRequest({ method: "GET" });
      const response = await usersGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.code).toBe(401);
    });
  });
});

