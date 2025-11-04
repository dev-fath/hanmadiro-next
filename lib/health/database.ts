import { prisma } from "@/lib/db/client";

export interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  responseTime: number;
  error?: string;
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return {
      status: "healthy",
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: "unhealthy",
      responseTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

