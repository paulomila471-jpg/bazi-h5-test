"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ScrollText } from "lucide-react";
import { Card, PrimaryButton } from "@/components/ui";

export default function RecommendPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  useEffect(() => {
    setQuestion(window.localStorage.getItem("bazi_question") || "");
  }, []);

  return (
    <div className="page-shell pt-12">
      <p className="mb-3 text-sm text-gold">推荐分析方式</p>
      <h1 className="mb-6 text-2xl font-semibold leading-tight text-[#fff7e8]">
        你的问题更适合使用八字命理
      </h1>

      <Card>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-gold/12 text-gold">
          <ScrollText className="h-6 w-6" />
        </div>
        <p className="text-base leading-8 text-[#efe2c4]">
          你的问题更适合使用八字命理，因为你问的是人生整体趋势、命局结构或阶段运势。
        </p>
        {question && (
          <p className="mt-4 rounded-md border border-gold/15 bg-[#07111f] p-3 text-sm leading-6 text-slate-300">
            {question}
          </p>
        )}
        <PrimaryButton
          className="mt-6 gap-2"
          onClick={() => router.push("/bazi/form")}
          type="button"
        >
          开始八字命理分析
          <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </Card>
    </div>
  );
}
