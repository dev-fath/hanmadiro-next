import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/validation/password";

describe("비밀번호 검증", () => {
  describe("validatePassword", () => {
    it("유효한 비밀번호는 통과해야 함", () => {
      const result = validatePassword("Password123!");
      expect(result.success).toBe(true);
    });

    it("영문, 숫자, 특수문자를 모두 포함한 비밀번호는 통과해야 함", () => {
      const result = validatePassword("Test123@");
      expect(result.success).toBe(true);
    });

    it("최소 8자 이상이어야 함", () => {
      const result = validatePassword("Pass1!");
      expect(result.success).toBe(false);
      expect(result.error).toContain("8자");
    });

    it("영문이 없으면 실패해야 함", () => {
      const result = validatePassword("12345678!");
      expect(result.success).toBe(false);
      expect(result.error).toContain("영문자");
    });

    it("숫자가 없으면 실패해야 함", () => {
      const result = validatePassword("Password!");
      expect(result.success).toBe(false);
      expect(result.error).toContain("숫자");
    });

    it("특수문자가 없으면 실패해야 함", () => {
      const result = validatePassword("Password123");
      expect(result.success).toBe(false);
      expect(result.error).toContain("특수문자");
    });

    it("빈 문자열은 실패해야 함", () => {
      const result = validatePassword("");
      expect(result.success).toBe(false);
      expect(result.error).toContain("8자");
    });

    it("대소문자 구분 없이 영문 포함 확인", () => {
      const result1 = validatePassword("PASSWORD123!");
      expect(result1.success).toBe(true);

      const result2 = validatePassword("password123!");
      expect(result2.success).toBe(true);
    });
  });
});

