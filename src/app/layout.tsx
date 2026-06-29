import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RepoGrok — Understand any GitHub repo in seconds",
  description: "Paste a GitHub URL and get an instant AI-powered analysis — file tree, architecture, tech stack, and setup guide.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] font-sans">
        <Navbar />
        <main className="flex-1 pt-[60px]">{children}</main>
      </body>
    </html>
  );
}
