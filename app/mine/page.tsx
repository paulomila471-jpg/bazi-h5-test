"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { getGuestUserId } from "@/lib/payments/access";
import { deleteProfile, getProfiles, requestAccountDeletion, type BaziProfileRecord } from "@/lib/reports";

export default function MinePage() {
  const [profiles, setProfiles] = useState<BaziProfileRecord[]>([]);
  const [deletionRequested, setDeletionRequested] = useState(false);

  useEffect(() => {
    setProfiles(getProfiles(getGuestUserId()));
  }, []);

  function removeProfile(profileId: string) {
    const userId = getGuestUserId();
    if (!window.confirm("确认删除这个八字档案及本地关联报告吗？")) return;
    deleteProfile(profileId, userId);
    setProfiles(getProfiles(userId));
  }

  function requestDeletion() {
    requestAccountDeletion(getGuestUserId());
    setDeletionRequested(true);
  }

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">我的</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#fff7e8]">我的八字档案</h1>

      <Card className="mb-4">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-gold text-xl font-semibold text-[#08101d]">
          命
        </div>
        <h2 className="text-lg font-semibold text-[#fff7e8]">游客用户</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          当前使用本地 guest user id。体验版报告与八字档案会保存在本机浏览器中，人工深度版请通过微信咨询。
        </p>
        <button
          className="mt-4 rounded-md border border-red-300/20 px-3 py-2 text-xs text-red-200"
          onClick={requestDeletion}
          type="button"
        >
          申请注销账号
        </button>
        {deletionRequested ? <p className="mt-3 text-xs text-gold">注销申请已记录，正式上线后将进入人工处理流程。</p> : null}
      </Card>

      {profiles.length === 0 ? (
        <Card>
          <p className="text-sm leading-7 text-slate-300">暂无保存的八字档案。</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <h2 className="text-base font-semibold text-[#fff7e8]">{profile.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {profile.gender === "male" ? "男" : "女"} · {profile.birthDate} {profile.birthTime}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link className="text-sm text-gold" href="/bazi/form">
                  重新生成体验版报告
                </Link>
                <button className="text-sm text-red-200" onClick={() => removeProfile(profile.id)} type="button">
                  删除八字档案
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
