import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "푸시 메시지 관리 시스템 API",
      version: "1.0.0",
      description: "푸시 메시지 관리 시스템의 API 문서",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: process.env.NEXTAUTH_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            code: {
              type: "integer",
              description: "HTTP 상태 코드",
            },
            data: {
              type: "object",
              description: "응답 데이터",
            },
            message: {
              type: "string",
              description: "응답 메시지",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            code: {
              type: "integer",
              description: "에러 코드",
            },
            data: {
              type: "null",
            },
            message: {
              type: "string",
              description: "에러 메시지",
            },
          },
        },
        PushToken: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            token: {
              type: "string",
            },
            isValid: {
              type: "boolean",
            },
            lastUsedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Message: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            title: {
              type: "string",
              maxLength: 255,
            },
            body: {
              type: "string",
              maxLength: 255,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
              maxLength: 50,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        PushLog: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            pushTokenId: {
              type: "string",
              format: "uuid",
            },
            messageId: {
              type: "string",
              format: "uuid",
            },
            sentAt: {
              type: "string",
              format: "date-time",
            },
            success: {
              type: "boolean",
            },
            errorMessage: {
              type: "string",
              nullable: true,
            },
          },
        },
        Stats: {
          type: "object",
          properties: {
            overall: {
              type: "object",
              properties: {
                totalSent: {
                  type: "integer",
                },
                successCount: {
                  type: "integer",
                },
                successRate: {
                  type: "string",
                },
              },
            },
            today: {
              type: "object",
              properties: {
                totalSent: {
                  type: "integer",
                },
                successCount: {
                  type: "integer",
                },
                successRate: {
                  type: "string",
                },
              },
            },
            activeTokens: {
              type: "integer",
            },
            totalMessages: {
              type: "integer",
            },
          },
        },
        HealthCheck: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["healthy", "unhealthy"],
            },
            services: {
              type: "object",
              properties: {
                database: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                    },
                    responseTime: {
                      type: "integer",
                    },
                    lastChecked: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
                firebase: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                    },
                    responseTime: {
                      type: "integer",
                    },
                    lastChecked: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "인증",
        description: "인증 관련 API",
      },
      {
        name: "푸시 토큰",
        description: "푸시 토큰 관리 API",
      },
      {
        name: "메시지",
        description: "메시지 관리 API",
      },
      {
        name: "푸시 발송",
        description: "푸시 메시지 발송 API",
      },
      {
        name: "발송 기록",
        description: "발송 기록 조회 API",
      },
      {
        name: "통계",
        description: "통계 조회 API",
      },
      {
        name: "헬스체크",
        description: "서비스 헬스체크 API",
      },
      {
        name: "Cron",
        description: "Cron 작업 API",
      },
    ],
  },
  apis: [
    "./app/api/**/*.ts",
    "./app/api/**/route.ts",
  ], // API 파일 경로
};

export const swaggerSpec = swaggerJsdoc(options);

