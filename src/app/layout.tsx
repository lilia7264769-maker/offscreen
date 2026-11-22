import { Geist, Inter } from "next/font/google";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-bg-main text-black antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
