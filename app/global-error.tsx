"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>문제가 발생했습니다</h1>
          <p>죄송합니다. 예상치 못한 오류가 발생했습니다.</p>
          <button onClick={() => reset()}>다시 시도</button>
        </div>
      </body>
    </html>
  );
}

