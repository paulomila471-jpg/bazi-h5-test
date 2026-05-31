import Link from "next/link";
import { getBeianInfo, wechatId } from "@/lib/compliance/config";

const links = [
  ["用户协议", "/terms"],
  ["隐私政策", "/privacy"],
  ["免责声明", "/disclaimer"],
  ["AI生成说明", "/ai-disclosure"],
  ["联系我们", "/contact"]
] as const;

export function SiteFooter() {
  const { icpBeian, icpLicense, policeBeian } = getBeianInfo();

  return (
    <footer className="mx-auto max-w-3xl px-5 pb-24 pt-8 text-center text-xs leading-6 text-slate-500">
      <div className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {links.map(([label, href]) => (
          <Link className="text-slate-400 hover:text-gold" href={href} key={href}>
            {label}
          </Link>
        ))}
      </div>
      <div className="space-y-1">
        <p>ICP备案号：{icpBeian || "备案中/待备案"}</p>
        <p>经营性ICP许可证：{icpLicense || "暂未开放站内经营性服务"}</p>
        {policeBeian ? <p>{policeBeian}</p> : null}
        <p>联系方式：{wechatId}</p>
      </div>
    </footer>
  );
}
