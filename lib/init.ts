import { validateEnv } from "@/lib/validation/env";
import logger from "@/lib/logger";

// 애플리케이션 시작 시 환경변수 검증
try {
  validateEnv();
  logger.info("Environment variables validated successfully");
} catch (error) {
  logger.error("Environment validation failed", { error });
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
}

