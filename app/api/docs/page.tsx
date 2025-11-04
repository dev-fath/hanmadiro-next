"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data: Record<string, unknown>) => setSpec(data))
      .catch((err) => console.error("Failed to load Swagger spec", err));
  }, []);

  if (!spec) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>API 문서를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <SwaggerUI spec={spec} />
    </div>
  );
}

