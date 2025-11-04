import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
  .regex(/[a-zA-Z]/, "비밀번호는 영문자를 포함해야 합니다")
  .regex(/[0-9]/, "비밀번호는 숫자를 포함해야 합니다")
  .regex(/[^a-zA-Z0-9]/, "비밀번호는 특수문자를 포함해야 합니다");

export function validatePassword(password: string): { success: boolean; error?: string } {
  try {
    passwordSchema.parse(password);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
      return { success: false, error: error.errors[0]?.message };
    }
    return { success: false, error: "비밀번호 검증에 실패했습니다" };
  }
}

export { passwordSchema };

