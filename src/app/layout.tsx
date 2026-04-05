import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthListener from "@/components/AuthListener";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Commerce Canvas",
  description: "Next-generation e-commerce experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthListener>
            <Navbar />
            {children}
          </AuthListener>
        </Providers>
      </body>
    </html>
  );
}
