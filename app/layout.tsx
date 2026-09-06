import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SQL & NoSQL Quest",
  description: "Interactive SQL and NoSQL learning with instant feedback and credits.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#07111d] text-slate-100">
        {children}
        <footer className="border-t border-white/10 bg-slate-950/80">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-center text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="font-medium text-slate-100">
              © 2026 Manojkumar. Developed and owned by Manojkumar.
            </p>
            <p>
              Portfolio:{" "}
              <a
                href="https://manojkumar-dev.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                manojkumar-dev.vercel.app
              </a>
              <span className="text-slate-500"> · All rights reserved.</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
