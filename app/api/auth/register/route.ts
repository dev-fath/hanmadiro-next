import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { validateName, nameSchema } from "@/lib/validation/name";
import { validatePassword } from "@/lib/validation/password";
import { ValidationError } from "@/lib/errors/ApiError";
import { logRequest, registerRateLimiter } from "@/lib/api/middleware";
import logger from "@/lib/logger";

const registerSchema = z.object({
  name: nameSchema,
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [인증]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 description: 사용자 이름 (최대 50바이트)
 *                 example: "홍길동"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: 비밀번호 (영문, 숫자, 특수문자 포함, 최소 8자)
 *                 example: "Password123!"
 *     responses:
 *       201:
 *         description: 회원가입이 완료되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: 요청 제한 초과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(req: NextRequest) {
  const logEnd = logRequest(req);

  try {
    if (!registerRateLimiter(req)) {
      return errorResponse(new Error("너무 많은 요청입니다"), "요청 제한을 초과했습니다");
    }

    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      throw new ValidationError(
        validated.error.errors[0]?.message || "입력값이 유효하지 않습니다",
        validated.error.errors
      );
    }

    const { name, password } = validated.data;

    // 이름 검증
    const nameValidation = validateName(name);
    if (!nameValidation.success) {
      throw new ValidationError(nameValidation.error || "이름 검증에 실패했습니다");
    }

    // 비밀번호 검증
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.success) {
      throw new ValidationError(passwordValidation.error || "비밀번호 검증에 실패했습니다");
    }

    // 중복 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (existingUser) {
      throw new ValidationError("이미 존재하는 사용자 이름입니다");
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    logger.info("User registered", { userId: user.id, name: user.name });

    logEnd();
    return successResponse(user, "회원가입이 완료되었습니다", 201);
  } catch (error) {
    logEnd();
    return errorResponse(error);
  }
}

