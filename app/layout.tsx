import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";
import { TestVersionNotice } from "@/components/TestVersionNotice";

export const metadata: Metadata = {
  title: "东方命理 AI 咨询",
  description: "八字命理 H5 测试版"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <TestVersionNotice />
        <main className="mx-auto max-w-3xl">{children}</main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
