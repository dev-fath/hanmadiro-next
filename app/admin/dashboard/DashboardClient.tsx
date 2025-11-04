"use client";

import { useEffect, useState } from "react";

interface Stats {
  overall: {
    totalSent: number;
    successCount: number;
    successRate: string;
  };
  today: {
    totalSent: number;
    successCount: number;
    successRate: string;
  };
  activeTokens: number;
  totalMessages: number;
  messageStats: Array<{
    messageId: string;
    sentCount: number;
    successCount: number;
  }>;
}

interface Health {
  status: string;
  services: {
    database: {
      status: string;
      responseTime: number;
      lastChecked: string;
    };
    firebase: {
      status: string;
      responseTime: number;
      lastChecked: string;
    };
  };
  timestamp: string;
}

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/health"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData.data);
      }
    } catch (error) {
      console.error("Failed to refresh data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    return status === "healthy" ? "green" : "red";
  };

  const getStatusText = (status: string) => {
    return status === "healthy" ? "정상" : "오류";
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ margin: 0 }}>대시보드</h1>
        <button
          onClick={refreshData}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "새로고침 중..." : "새로고침"}
        </button>
      </div>

      {/* 헬스체크 섹션 */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ marginBottom: "15px" }}>서비스 상태</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
          {health && (
            <>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3 style={{ marginTop: 0 }}>데이터베이스</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: getStatusColor(health.services.database.status),
                    }}
                  />
                  <span>{getStatusText(health.services.database.status)}</span>
                </div>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                  응답 시간: {health.services.database.responseTime}ms
                </p>
                <p style={{ margin: "5px 0", fontSize: "12px", color: "#999" }}>
                  마지막 확인: {new Date(health.services.database.lastChecked).toLocaleString("ko-KR")}
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Firebase</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: getStatusColor(health.services.firebase.status),
                    }}
                  />
                  <span>{getStatusText(health.services.firebase.status)}</span>
                </div>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                  응답 시간: {health.services.firebase.responseTime}ms
                </p>
                <p style={{ margin: "5px 0", fontSize: "12px", color: "#999" }}>
                  마지막 확인: {new Date(health.services.firebase.lastChecked).toLocaleString("ko-KR")}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 통계 섹션 */}
      <div>
        <h2 style={{ marginBottom: "15px" }}>통계</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
          {stats && (
            <>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: "16px" }}>전체 발송</h3>
                <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
                  {stats.overall.totalSent.toLocaleString()}
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                  성공: {stats.overall.successCount.toLocaleString()} ({stats.overall.successRate})
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: "16px" }}>오늘 발송</h3>
                <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
                  {stats.today.totalSent.toLocaleString()}
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                  성공: {stats.today.successCount.toLocaleString()} ({stats.today.successRate})
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: "16px" }}>활성 토큰</h3>
                <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
                  {stats.activeTokens.toLocaleString()}
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: "16px" }}>총 메시지</h3>
                <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
                  {stats.totalMessages.toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {!stats && !health && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <p>데이터를 불러올 수 없습니다.</p>
        </div>
      )}
    </div>
  );
}

