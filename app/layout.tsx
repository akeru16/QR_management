import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR来店管理MVP",
  description: "QRコードを使った来店管理・クーポン配布Webアプリ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-paper text-ink">{children}</body>
    </html>
  );
}
