import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payparo Dashboard",
  description: "Sell & Buy Everything Instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} text-white bg-[#09090B] antialiased`}
        suppressHydrationWarning
      >
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "bg-[#1a1d27] border border-white/10 text-white",
              title: "text-white font-semibold",
              description: "text-white/50",
              success: "border-emerald-500/30",
              error: "border-red-500/30",
            },
          }}
        />
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
