import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";

export async function cleanupInvalidTokens(): Promise<void> {
  const startTime = Date.now();

  try {
    logger.info("Cleanup invalid tokens started");

    // 유효하지 않은 토큰 삭제 (30일 이상 사용되지 않은 토큰)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.pushToken.deleteMany({
      where: {
        AND: [
          { isValid: false },
          {
            OR: [
              { lastUsedAt: { lt: thirtyDaysAgo } },
              { lastUsedAt: null, createdAt: { lt: thirtyDaysAgo } },
            ],
          },
        ],
      },
    });

    const executionTime = Date.now() - startTime;

    // Cron 작업 로그 기록
    await prisma.cronJobLog.create({
      data: {
        jobName: "cleanup-tokens",
        executedAt: new Date(),
        status: "SUCCESS",
        executionTimeMs: executionTime,
      },
    });

    logger.info("Cleanup invalid tokens completed", {
      deletedCount: result.count,
      executionTimeMs: executionTime,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;

    await prisma.cronJobLog.create({
      data: {
        jobName: "cleanup-tokens",
        executedAt: new Date(),
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : String(error),
        executionTimeMs: executionTime,
      },
    });

    logger.error("Cleanup invalid tokens failed", { error, executionTimeMs: executionTime });
    throw error;
  }
}

