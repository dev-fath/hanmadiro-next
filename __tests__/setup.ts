import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { server } from "./mocks/server";

// MSW 서버 시작/종료
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// 환경변수 모킹
vi.mock("@/lib/validation/env", () => ({
  getEnv: vi.fn(() => ({
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    NEXTAUTH_URL: "http://localhost:3000",
    NEXTAUTH_SECRET: "test-secret-key-minimum-32-characters-long",
    FIREBASE_PROJECT_ID: "test-project",
    FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n",
    FIREBASE_CLIENT_EMAIL: "test@test.iam.gserviceaccount.com",
    CRON_API_KEY: "test-cron-api-key",
    NODE_ENV: "test",
  })),
  validateEnv: vi.fn(),
}));

// Prisma 모킹
vi.mock("@/lib/db/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    pushToken: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    message: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    messageAssignment: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    pushLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

// Firebase 모킹
vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdmin: vi.fn(() => ({
    messaging: () => ({
      send: vi.fn(),
    }),
  })),
}));

// Logger 모킹
vi.mock("@/lib/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// NextAuth 모킹
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
  default: vi.fn(),
}));

// API Middleware 모킹
vi.mock("@/lib/api/middleware", async () => {
  const actual = await vi.importActual("@/lib/api/middleware");
  return {
    ...actual,
    logRequest: vi.fn(() => vi.fn()),
    generalRateLimiter: vi.fn(() => true),
    registerRateLimiter: vi.fn(() => true),
    loginRateLimiter: vi.fn(() => true),
    requireAuth: vi.fn(),
  };
});

