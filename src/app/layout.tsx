import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalStateProvider } from "@/components/GlobalContext";
import { Toaster } from '../components/ui/toaster';

const JetBrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Regular.ttf",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={JetBrainsMono.className + " bg-black"}>
        <GlobalStateProvider>
          <Toaster />
          <main className="flex min-h-screen flex-col items-center justify-between">
            {children}
          </main>
        </GlobalStateProvider>
      </body>
    </html>
  );
}
