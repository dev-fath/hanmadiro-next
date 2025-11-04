import { getFirebaseAdmin } from "@/lib/firebase/admin";

export interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  responseTime: number;
  error?: string;
}

export async function checkFirebaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const admin = getFirebaseAdmin();
    // Firebase Admin이 초기화되었는지 확인
    if (!admin) {
      throw new Error("Firebase Admin이 초기화되지 않았습니다");
    }

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

