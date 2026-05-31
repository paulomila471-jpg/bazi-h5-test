"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Card, PrimaryButton } from "@/components/ui";
import { detectBaziIntent } from "@/lib/bazi/intent";
import { wechatId } from "@/lib/compliance/config";

const examples = [
  "我想看一生命运",
  "我今年财运怎么样",
  "我适合做什么行业",
  "我的婚姻怎么样"
];

export default function HomePage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  function startAnalysis() {
    const trimmed = question.trim();
    const result = detectBaziIntent(trimmed);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("bazi_question", trimmed);
        window.localStorage.setItem("bazi_intent", JSON.stringify(result));
      } catch (error) {
        console.error("Failed to save bazi question:", error);
      }
    }

    router.push("/recommend");
  }

  return (
    <div className="page-shell flex flex-col justify-center">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-gold">东方命理 AI 咨询</p>
          <Link className="rounded-md border border-gold/20 px-3 py-2 text-xs text-gold" href="/en">
            English Version
          </Link>
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-[#fff7e8]">
          你想咨询什么？
        </h1>
      </div>

      <Card>
        <textarea
          className="min-h-32 w-full resize-none rounded-md border border-gold/20 bg-[#07111f] p-4 text-base leading-7 text-[#fff7e8] outline-none placeholder:text-slate-500 focus:border-gold/70"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="例如：我今年财运怎么样"
          value={question}
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {examples.map((item) => (
            <button
              className="rounded-md border border-gold/15 bg-white/[0.03] px-3 py-2 text-left text-xs leading-5 text-slate-300"
              key={item}
              onClick={() => setQuestion(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <PrimaryButton
          className="mt-5 gap-2"
          disabled={!question.trim()}
          onClick={startAnalysis}
          type="button"
        >
          <Sparkles className="h-4 w-4" />
          开始分析
        </PrimaryButton>
      </Card>

      <Card className="mt-4">
        <p className="text-sm leading-7 text-[#efe2c4]">
          添加微信 <span className="font-semibold text-gold">{wechatId}</span> 获取人工深度版。
        </p>
      </Card>
    </div>
  );
}
