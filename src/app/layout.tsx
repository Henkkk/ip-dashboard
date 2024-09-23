import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Web3Providers from "./Web3Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IP Liscening Platform",
  description: "Register an IP for your creation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
