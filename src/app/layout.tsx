import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "GitSense — AI-Powered Repository Intelligence",
  description:
    "Understand any GitHub repository in minutes. AI-powered code search, architecture visualization, and intelligent codebase navigation.",
  keywords: [
    "GitHub",
    "repository analysis",
    "code search",
    "AI",
    "developer tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
