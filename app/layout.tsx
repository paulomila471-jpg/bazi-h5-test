import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppChrome } from "@/components/AppChrome";

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
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
