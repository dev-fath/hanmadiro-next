import { checkDatabaseHealth } from "./database";
import { checkFirebaseHealth } from "./firebase";

export interface ServiceHealth {
  status: "healthy" | "unhealthy";
  responseTime: number;
  lastChecked: string;
  error?: string;
}

export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  services: {
    database: ServiceHealth;
    firebase: ServiceHealth;
  };
  timestamp: string;
}

export async function checkAllServices(): Promise<HealthCheckResponse> {
  const [databaseResult, firebaseResult] = await Promise.all([
    checkDatabaseHealth(),
    checkFirebaseHealth(),
  ]);

  const now = new Date().toISOString();

  const services = {
    database: {
      status: databaseResult.status,
      responseTime: databaseResult.responseTime,
      lastChecked: now,
      ...(databaseResult.error && { error: databaseResult.error }),
    },
    firebase: {
      status: firebaseResult.status,
      responseTime: firebaseResult.responseTime,
      lastChecked: now,
      ...(firebaseResult.error && { error: firebaseResult.error }),
    },
  };

  const overallStatus =
    services.database.status === "healthy" && services.firebase.status === "healthy"
      ? "healthy"
      : "unhealthy";

  return {
    status: overallStatus,
    services,
    timestamp: now,
  };
}

