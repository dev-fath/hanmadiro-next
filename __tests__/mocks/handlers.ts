import { http, HttpResponse } from "msw";

export const handlers = [
  // Health check
  http.get("http://localhost:3000/api/health", () => {
    return HttpResponse.json({
      code: 200,
      data: {
        status: "healthy",
        services: {
          database: {
            status: "healthy",
            responseTime: 10,
            lastChecked: new Date().toISOString(),
          },
          firebase: {
            status: "healthy",
            responseTime: 5,
            lastChecked: new Date().toISOString(),
          },
        },
        timestamp: new Date().toISOString(),
      },
      message: "All services are healthy",
    });
  }),

  // Stats
  http.get("http://localhost:3000/api/stats", () => {
    return HttpResponse.json({
      code: 200,
      data: {
        overall: {
          totalSent: 100,
          successCount: 95,
          successRate: "95.00%",
        },
        today: {
          totalSent: 10,
          successCount: 9,
          successRate: "90.00%",
        },
        activeTokens: 50,
        totalMessages: 20,
        messageStats: [],
      },
      message: "통계를 조회했습니다",
    });
  }),

  // Messages
  http.get("http://localhost:3000/api/messages", () => {
    return HttpResponse.json({
      code: 200,
      data: [
        {
          id: "test-message-id",
          title: "Test Message",
          body: "Test body",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      message: "메시지 목록을 조회했습니다",
    });
  }),

  http.post("http://localhost:3000/api/messages", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        code: 201,
        data: {
          id: "new-message-id",
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        message: "메시지가 생성되었습니다",
      },
      { status: 201 }
    );
  }),
];

