import { describe, it, expect, vi } from "vitest";
import { successResponse, errorResponse } from "@/lib/api/response";
import { ApiError, ValidationError } from "@/lib/errors/ApiError";

describe("API 응답 유틸리티", () => {
  describe("successResponse", () => {
    it("성공 응답을 생성해야 함", () => {
      const data = { id: "123", name: "테스트" };
      const response = successResponse(data);
      expect(response.status).toBe(200);
    });

    it("커스텀 메시지를 설정할 수 있어야 함", async () => {
      const response = successResponse({}, "작업이 완료되었습니다");
      const body = await response.json();
      expect(body.message).toBe("작업이 완료되었습니다");
    });

    it("커스텀 상태 코드를 설정할 수 있어야 함", () => {
      const response = successResponse({}, "생성되었습니다", 201);
      expect(response.status).toBe(201);
    });
  });

  describe("errorResponse", () => {
    it("ApiError를 처리해야 함", async () => {
      const error = new ValidationError("입력값이 유효하지 않습니다");
      const response = errorResponse(error);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.code).toBe(400);
      expect(body.message).toBe("입력값이 유효하지 않습니다");
    });

    it("예상치 못한 에러를 처리해야 함", async () => {
      const error = new Error("테스트 에러");
      const response = errorResponse(error);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.code).toBe(500);
    });

    it("문자열 에러를 처리해야 함", async () => {
      const response = errorResponse("에러 메시지");
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.code).toBe(500);
    });
  });
});

