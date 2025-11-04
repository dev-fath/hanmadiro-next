import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAuth, logRequest, generalRateLimiter } from "@/lib/api/middleware";

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: 회원 목록 조회
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 회원 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          loginAttempts: true,
          lockedUntil: true,
        },
      }),
      prisma.user.count(),
    ]);

    logEnd();
    return successResponse(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "회원 목록을 조회했습니다"
    );
  } catch (error) {
    logEnd();
    return errorResponse(error);
  }
}

