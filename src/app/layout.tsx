import type { Metadata, Viewport } from "next";
import { Lora, Playfair_Display } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Documentation Reflection Companion · Spark by Sher",
  description:
    "Help educators revisit children's documentation through multiple lenses—without replacing educator interpretation.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Reflect",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f4ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
