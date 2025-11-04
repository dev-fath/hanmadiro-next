import { describe, it, expect } from "vitest";
import { validateName, nameSchema } from "@/lib/validation/name";

describe("이름 검증", () => {
  describe("validateName", () => {
    it("유효한 이름은 통과해야 함", () => {
      const result = validateName("홍길동");
      expect(result.success).toBe(true);
    });

    it("50바이트 이하의 이름은 통과해야 함", () => {
      const result = validateName("a".repeat(50));
      expect(result.success).toBe(true);
    });

    it("50바이트를 초과하는 이름은 실패해야 함", () => {
      const result = validateName("a".repeat(51));
      expect(result.success).toBe(false);
      expect(result.error).toContain("50바이트");
    });

    it("빈 문자열은 실패해야 함", () => {
      const result = validateName("");
      expect(result.success).toBe(false);
      expect(result.error).toContain("필수");
    });

    it("한글 이름은 바이트 수를 올바르게 계산해야 함", () => {
      // 한글 1자 = 3바이트
      const result = validateName("가".repeat(16)); // 48바이트
      expect(result.success).toBe(true);

      const result2 = validateName("가".repeat(17)); // 51바이트
      expect(result2.success).toBe(false);
    });
  });

  describe("nameSchema", () => {
    it("유효한 이름은 통과해야 함", () => {
      const result = nameSchema.safeParse("홍길동");
      expect(result.success).toBe(true);
    });

    it("빈 문자열은 실패해야 함", () => {
      const result = nameSchema.safeParse("");
      expect(result.success).toBe(false);
    });
  });
});

