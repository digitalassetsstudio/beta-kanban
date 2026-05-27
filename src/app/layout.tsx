import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanban Command — Project Dashboard",
  description: "Interactive Kanban project dashboard with drag & drop, timeline views, and priority heatmaps.",
  keywords: ["Kanban", "Project Dashboard", "Task Management", "Drag & Drop"],
  authors: [{ name: "Kanban Command" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Kanban Command — Project Dashboard",
    description: "Interactive Kanban project dashboard with drag & drop, timeline views, and priority heatmaps.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanban Command — Project Dashboard",
    description: "Interactive Kanban project dashboard with drag & drop, timeline views, and priority heatmaps.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-gray-200`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
