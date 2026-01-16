import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindFlow - Collaborative Mindmaps & Flowcharts",
  description: "Beautiful, effortless collaborative mindmapping inspired by Apple design",
  keywords: ["mindmap", "flowchart", "collaboration", "brainstorming", "productivity"],
  authors: [{ name: "MindFlow" }],
  openGraph: {
    title: "MindFlow - Collaborative Mindmaps",
    description: "Beautiful, effortless collaborative mindmapping",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
