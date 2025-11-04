import { describe, it, expect } from "vitest";
import { createMessageSchema, updateMessageSchema } from "@/lib/validation/message";

describe("메시지 검증", () => {
  describe("createMessageSchema", () => {
    it("유효한 메시지는 통과해야 함", () => {
      const result = createMessageSchema.safeParse({
        title: "테스트 제목",
        body: "테스트 내용",
      });
      expect(result.success).toBe(true);
    });

    it("title이 최대 255자를 초과하면 실패해야 함", () => {
      const result = createMessageSchema.safeParse({
        title: "a".repeat(256),
        body: "테스트 내용",
      });
      expect(result.success).toBe(false);
    });

    it("body가 최대 255자를 초과하면 실패해야 함", () => {
      const result = createMessageSchema.safeParse({
        title: "테스트 제목",
        body: "a".repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it("title이 없으면 실패해야 함", () => {
      const result = createMessageSchema.safeParse({
        body: "테스트 내용",
      });
      expect(result.success).toBe(false);
    });

    it("body가 없으면 실패해야 함", () => {
      const result = createMessageSchema.safeParse({
        title: "테스트 제목",
      });
      expect(result.success).toBe(false);
    });

    it("빈 문자열은 실패해야 함", () => {
      const result1 = createMessageSchema.safeParse({
        title: "",
        body: "내용",
      });
      expect(result1.success).toBe(false);

      const result2 = createMessageSchema.safeParse({
        title: "제목",
        body: "",
      });
      expect(result2.success).toBe(false);
    });
  });

  describe("updateMessageSchema", () => {
    it("유효한 메시지 업데이트는 통과해야 함", () => {
      const result = updateMessageSchema.safeParse({
        title: "업데이트 제목",
        body: "업데이트 내용",
      });
      expect(result.success).toBe(true);
    });

    it("일부 필드만 업데이트할 수 있어야 함", () => {
      const result = updateMessageSchema.safeParse({
        title: "제목만 업데이트",
      });
      expect(result.success).toBe(true);
    });

    it("빈 객체도 통과해야 함", () => {
      const result = updateMessageSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

