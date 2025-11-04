import winston from "winston";
import path from "path";
import fs from "fs";

const logsDir = path.join(process.cwd(), "logs");

// logs 디렉토리가 없으면 생성
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// 민감한 정보를 마스킹하는 함수
function maskSensitiveData(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  const sensitiveKeys = ["password", "token", "secret", "authorization", "apiKey", "api_key"];
  const masked = { ...(obj as Record<string, unknown>) };

  for (const key in masked) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
      masked[key] = "***MASKED***";
    } else if (typeof masked[key] === "object") {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  defaultMeta: { service: "hanmadiro-next" },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 모든 로그 파일 (일별)
    new winston.transports.File({
      filename: path.join(logsDir, `app-${new Date().toISOString().split("T")[0]}.log`),
      maxsize: 5242880, // 5MB
      maxFiles: 30, // 30일치 보관
    }),
  ],
});

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 로깅 메서드 래퍼 (민감 정보 마스킹)
const originalLog = logger.log.bind(logger);
logger.log = function (level: string, message: string, meta?: unknown) {
  const maskedMeta = meta ? maskSensitiveData(meta) : undefined;
  return originalLog(level, message, maskedMeta as Record<string, unknown> | undefined);
};

export default logger;

