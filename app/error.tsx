"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page runtime error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-[#fff7e8]">页面加载异常，请刷新重试。</h1>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        如果多次刷新仍无法打开，请稍后再试或联系管理员。
      </p>
      <button
        className="mt-6 min-h-12 rounded-md bg-gold px-4 text-sm font-semibold text-[#08101d]"
        onClick={reset}
        type="button"
      >
        刷新重试
      </button>
    </div>
  );
}
