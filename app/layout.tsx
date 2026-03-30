import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rap Dojo Pro | Master the Flow",
  description: "The ultimate AI-powered rap training studio. Real-time vocal FX, kinetic lyrics, and flow mastery metrics. Better than Smule for serious training.",
  keywords: ["rap training", "drill flow", "karaoke pro", "vocal effects", "ai music", "singing coach"],
  authors: [{ name: "Central Wator" }],
  openGraph: {
    title: "Rap Dojo Pro",
    description: "Master your flow with real-time AI feedback and professional studio effects.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
