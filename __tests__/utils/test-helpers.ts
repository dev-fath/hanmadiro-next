import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { NextRequest } from "next/server";

/**
 * 테스트용 커스텀 렌더 함수
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { ...options });
}

/**
 * 테스트용 NextRequest 생성 헬퍼
 */
export function createMockRequest(
  options: {
    method?: string;
    url?: string;
    body?: unknown;
    headers?: Record<string, string>;
    ip?: string;
  } = {}
): NextRequest {
  const {
    method = "GET",
    url = "http://localhost:3000/api/test",
    body,
    headers = {},
    ip = "127.0.0.1",
  } = options;

  const request = new NextRequest(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  // NextRequest에 ip 속성 추가 (테스트용)
  Object.defineProperty(request, "ip", {
    value: ip,
    writable: false,
  });

  if (body) {
    Object.defineProperty(request, "json", {
      value: async () => body,
      writable: false,
    });
  }

  return request;
}

/**
 * 테스트용 세션 객체 생성
 */
export function createMockSession(userId: string, name: string) {
  return {
    user: {
      id: userId,
      name,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * 테스트용 에러 응답 생성
 */
export function createErrorResponse(code: number, message: string) {
  return {
    code,
    data: null,
    message,
  };
}

/**
 * 테스트용 성공 응답 생성
 */
export function createSuccessResponse<T>(data: T, message: string = "Success", code: number = 200) {
  return {
    code,
    data,
    message,
  };
}

/**
 * 비동기 함수 실행 대기 헬퍼
 */
export async function waitFor(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

