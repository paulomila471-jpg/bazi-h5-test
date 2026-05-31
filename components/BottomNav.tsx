"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Compass, ScrollText, UserRound } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "咨询", icon: Compass },
  { href: "/bazi/form", label: "八字", icon: ScrollText },
  { href: "/history", label: "记录", icon: Clock3 },
  { href: "/mine", label: "我的", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gold/20 bg-[#050b14]/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              className={clsx(
                "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs transition",
                active ? "text-gold" : "text-slate-400"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
