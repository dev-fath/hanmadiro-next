export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = (await import("node-cron")).default;
    const { assignDailyMessages } = await import("@/lib/cron/dailyAssignment");
    const { cleanupInvalidTokens } = await import("@/lib/cron/cleanupTokens");
    const logger = (await import("@/lib/logger")).default;
    const { getEnv } = await import("@/lib/validation/env");

    try {
      getEnv(); // 환경변수 검증

      // 일일 메시지 할당 작업: 매일 오전 9시에 실행
      cron.schedule("0 9 * * *", async () => {
        logger.info("Starting scheduled daily message assignment");
        try {
          await assignDailyMessages();
        } catch (error) {
          logger.error("Scheduled daily assignment failed", { error });
        }
      });

      logger.info("Daily message assignment cron scheduled (0 9 * * *)");

      // 유효하지 않은 토큰 정리 작업: 매일 오전 3시에 실행
      cron.schedule("0 3 * * *", async () => {
        logger.info("Starting scheduled token cleanup");
        try {
          await cleanupInvalidTokens();
        } catch (error) {
          logger.error("Scheduled token cleanup failed", { error });
        }
      });

      logger.info("Token cleanup cron scheduled (0 3 * * *)");
    } catch (error) {
      logger.error("Failed to initialize cron jobs", { error });
    }
  }
}

