"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global runtime error:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, background: "#050b14", color: "#fff7e8" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>页面加载异常，请刷新重试。</h1>
            <p style={{ color: "#cbd5e1", lineHeight: 1.8 }}>
              如果多次刷新仍无法打开，请稍后再试或联系管理员。
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: 24,
                minHeight: 44,
                padding: "0 18px",
                border: 0,
                borderRadius: 6,
                background: "#d8b56d",
                color: "#08101d",
                fontWeight: 700
              }}
              type="button"
            >
              刷新重试
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
