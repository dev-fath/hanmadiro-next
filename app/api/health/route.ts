import { checkAllServices } from "@/lib/health";
import { successResponse, errorResponse } from "@/lib/api/response";
import logger from "@/lib/logger";

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 서비스 헬스체크
 *     tags: [헬스체크]
 *     description: 데이터베이스 및 Firebase 연결 상태를 확인합니다
 *     responses:
 *       200:
 *         description: 모든 서비스가 정상입니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/HealthCheck'
 *                 message:
 *                   type: string
 *       503:
 *         description: 일부 서비스에 문제가 있습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/HealthCheck'
 *                 message:
 *                   type: string
 */
export async function GET() {
  try {
    const healthCheck = await checkAllServices();

    return successResponse(
      healthCheck,
      healthCheck.status === "healthy" ? "All services are healthy" : "Some services are unhealthy",
      healthCheck.status === "healthy" ? 200 : 503
    );
  } catch (error) {
    logger.error("Health check failed", { error });
    return errorResponse(error, "헬스체크 중 오류가 발생했습니다");
  }
}

