"use client";

import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { Card } from "@/components/ui";

const modules = [
  ["人工解锁订单", "/admin/manual-orders"],
  ["用户留资", "/admin/leads"],
  ["新建人工报告", "/admin/reports/new"],
  ["敏感词命中日志", "/admin"],
  ["AI生成失败日志", "/admin"]
] as const;

export default function AdminPage() {
  return (
    <AdminGate>
      <div className="page-shell pt-8">
        <p className="mb-3 text-sm text-gold">后台管理</p>
        <h1 className="mb-6 text-2xl font-semibold text-[#fff7e8]">H5测试版后台</h1>
        <Card className="mb-4">
          <p className="text-sm leading-7 text-slate-300">
            当前为测试版后台，用于查看人工解锁订单、留资、生成和复制人工深度版报告。正式上线前建议改为服务端管理员权限。
          </p>
        </Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {modules.map(([label, href]) => (
            <Link href={href} key={label}>
              <Card>
                <h2 className="text-base font-semibold text-gold">{label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">点击进入管理。</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminGate>
  );
}
