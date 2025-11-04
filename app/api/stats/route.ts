import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAuth, logRequest, generalRateLimiter } from "@/lib/api/middleware";

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: 통계 조회
 *     tags: [통계]
 *     security:
 *       - bearerAuth: []
 *     description: 발송 성공률, 일일 발송 수, 활성 토큰 수 등의 통계를 조회합니다
 *     responses:
 *       200:
 *         description: 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Stats'
 *                 message:
 *                   type: string
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(req: NextRequest) {
  const logEnd = logRequest(req);

  try {
    await requireAuth();

    if (!generalRateLimiter(req)) {
      return errorResponse(new Error("너무 많은 요청입니다"), "요청 제한을 초과했습니다");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLogs,
      successLogs,
      todayLogs,
      todaySuccessLogs,
      activeTokens,
      totalMessages,
      messageStats,
    ] = await Promise.all([
      prisma.pushLog.count(),
      prisma.pushLog.count({ where: { success: true } }),
      prisma.pushLog.count({ where: { sentAt: { gte: today } } }),
      prisma.pushLog.count({ where: { success: true, sentAt: { gte: today } } }),
      prisma.pushToken.count({ where: { isValid: true } }),
      prisma.message.count(),
      prisma.pushLog.groupBy({
        by: ["messageId"],
        _count: { id: true },
        _sum: { success: true },
        where: { success: true },
      }),
    ]);

    const overallSuccessRate =
      totalLogs > 0 ? ((successLogs / totalLogs) * 100).toFixed(2) : "0.00";
    const todaySuccessRate =
      todayLogs > 0 ? ((todaySuccessLogs / todayLogs) * 100).toFixed(2) : "0.00";

    const stats = {
      overall: {
        totalSent: totalLogs,
        successCount: successLogs,
        successRate: `${overallSuccessRate}%`,
      },
      today: {
        totalSent: todayLogs,
        successCount: todaySuccessLogs,
        successRate: `${todaySuccessRate}%`,
      },
      activeTokens,
      totalMessages,
      messageStats: messageStats.map((stat) => ({
        messageId: stat.messageId,
        sentCount: stat._count.id,
        successCount: stat._sum.success || 0,
      })),
    };

    logEnd();
    return successResponse(stats, "통계를 조회했습니다");
  } catch (error) {
    logEnd();
    return errorResponse(error);
  }
}

