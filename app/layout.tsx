import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { BackToTop } from "@/components/common/BackToTop";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "FindMyDoctor — Healthcare Platform",
  description:
    "Find doctors, book appointments, order medicines, and access emergency services in Bangladesh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <Providers>
          <ErrorBoundary>
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
          <Toaster richColors position="top-right" />
                  </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
