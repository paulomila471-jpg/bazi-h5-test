"use client";

import { useEffect, useState } from "react";
import { Card, PrimaryButton, fieldClass } from "@/components/ui";

const adminSessionKey = "bazi_admin_authed";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthed(window.sessionStorage.getItem(adminSessionKey) === "true");
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (response.ok) {
      window.sessionStorage.setItem(adminSessionKey, "true");
      setAuthed(true);
    } else {
      const body = await response.json().catch(() => ({ message: "登录失败" }));
      setError(body.message || "管理员密码不正确");
    }

    setLoading(false);
  }

  if (authed) return <>{children}</>;

  return (
    <div className="page-shell pt-8">
      <Card>
        <p className="mb-2 text-sm text-gold">测试版后台，仅供本人本地使用。</p>
        <h1 className="text-2xl font-semibold text-[#fff7e8]">管理员登录</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          请输入部署环境变量 ADMIN_PASSWORD 设置的后台密码。该密码不会放入 NEXT_PUBLIC 环境变量。
        </p>
        <form className="mt-5 space-y-4" onSubmit={login}>
          <input
            className={fieldClass}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="管理员密码"
            type="password"
            value={password}
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <PrimaryButton disabled={loading || !password} type="submit">
            {loading ? "验证中..." : "进入后台"}
          </PrimaryButton>
        </form>
      </Card>
    </div>
  );
}
