"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { getManualOrders, getManualStatusLabel, type ManualOrderRecord } from "@/lib/manualOrders";
import { hasSupabaseConfig } from "@/lib/supabase/client";

export default function ManualOrdersPage() {
  const [orders, setOrders] = useState<ManualOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const databaseReady = hasSupabaseConfig();

  useEffect(() => {
    getManualOrders()
      .then((items) => setOrders(items))
      .catch((error) => {
        console.error("Failed to load manual orders:", error);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">测试版后台，仅供本人本地使用。</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#fff7e8]">人工解锁待处理报告</h1>

      {!databaseReady ? (
        <Card className="mb-4 border-gold/20 bg-gold/[0.06]">
          <p className="text-sm leading-7 text-[#efe2c4]">
            数据库未配置，请联系管理员。当前只能读取本机浏览器里的测试记录，外部用户手机提交后不会同步到这里。
          </p>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <p className="text-sm leading-7 text-slate-300">正在读取订单...</p>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <p className="text-sm leading-7 text-slate-300">
            暂无待处理报告。用户在结果页点击“我已联系，等待报告”后会出现在这里。
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.reportCode || order.id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-[#fff7e8]">{order.reportCode}</h2>
                <span className="rounded-md bg-gold/12 px-2 py-1 text-xs text-gold">
                  {getManualStatusLabel(order.manualUnlockStatus)}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
                <p>出生日期：{order.birthDate}</p>
                <p>出生时间：{order.birthTime}</p>
                <p>性别：{order.gender === "male" ? "男" : "女"}</p>
                <p>分析方向：{order.focus}</p>
                <p>创建时间：{new Date(order.createdAt).toLocaleString("zh-CN")}</p>
                <p>状态：{getManualStatusLabel(order.manualUnlockStatus)}</p>
              </div>
              <Link
                className="mt-4 inline-flex min-h-10 items-center rounded-md bg-gold px-4 text-sm font-semibold text-[#08101d]"
                href={`/admin/manual-orders/${order.reportCode}`}
              >
                查看详情
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
