import { z } from "zod";

export const nameSchema = z
  .string()
  .min(1, "이름은 필수입니다")
  .refine(
    (value) => {
      const byteLength = Buffer.byteLength(value, "utf8");
      return byteLength <= 50;
    },
    {
      message: "이름은 최대 50바이트까지 허용됩니다",
    }
  );

export function validateName(name: string): { success: boolean; error?: string } {
  try {
    nameSchema.parse(name);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message };
    }
    return { success: false, error: "이름 검증에 실패했습니다" };
  }
}

