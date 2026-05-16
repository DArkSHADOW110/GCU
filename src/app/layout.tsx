import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-geist-sans" 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-geist-mono" 
});

export const metadata: Metadata = {
  title: "FinPulse - Next-Gen Banking Dashboard",
  description: "Multi-bank dashboard with AI-powered money management. Premium glassmorphism fintech experience.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d14" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
