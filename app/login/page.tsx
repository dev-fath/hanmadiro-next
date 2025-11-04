"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        name,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "20px" }}>
        <h1 style={{ marginBottom: "20px", textAlign: "center" }}>로그인</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="name" style={{ display: "block", marginBottom: "5px" }}>
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", fontSize: "16px" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", fontSize: "16px" }}
            />
          </div>
          {error && (
            <div style={{ color: "red", marginBottom: "15px", fontSize: "14px" }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}

