import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "英語学習タイプ診断",
  description: "あなたの英語学習タイプを診断して、最適な学習方法を見つけましょう！",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.className}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
