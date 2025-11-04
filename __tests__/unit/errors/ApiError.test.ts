import { describe, it, expect } from "vitest";
import {
  ApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "@/lib/errors/ApiError";

describe("에러 클래스", () => {
  describe("ApiError", () => {
    it("기본 에러를 생성해야 함", () => {
      const error = new ApiError(500, "테스트 에러");
      expect(error.message).toBe("테스트 에러");
      expect(error.code).toBe(500);
      expect(error).toBeInstanceOf(Error);
    });

    it("커스텀 상태 코드를 설정할 수 있어야 함", () => {
      const error = new ApiError(400, "테스트 에러");
      expect(error.code).toBe(400);
    });
  });

  describe("ValidationError", () => {
    it("검증 에러를 생성해야 함", () => {
      const error = new ValidationError("입력값이 유효하지 않습니다");
      expect(error.message).toBe("입력값이 유효하지 않습니다");
      expect(error.statusCode).toBe(400);
      expect(error).toBeInstanceOf(ApiError);
    });

    it("에러 세부 정보를 포함할 수 있어야 함", () => {
      const details = [{ field: "name", message: "이름은 필수입니다" }];
      const error = new ValidationError("검증 실패", details);
      expect(error.details).toEqual(details);
    });
  });

  describe("NotFoundError", () => {
    it("404 에러를 생성해야 함", () => {
      const error = new NotFoundError("리소스를 찾을 수 없습니다");
      expect(error.message).toBe("리소스를 찾을 수 없습니다");
      expect(error.statusCode).toBe(404);
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe("UnauthorizedError", () => {
    it("401 에러를 생성해야 함", () => {
      const error = new UnauthorizedError("인증이 필요합니다");
      expect(error.message).toBe("인증이 필요합니다");
      expect(error.statusCode).toBe(401);
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe("ForbiddenError", () => {
    it("403 에러를 생성해야 함", () => {
      const error = new ForbiddenError("권한이 없습니다");
      expect(error.message).toBe("권한이 없습니다");
      expect(error.statusCode).toBe(403);
      expect(error).toBeInstanceOf(ApiError);
    });
  });
});

