import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.samirmd.com"),
  title: {
    default: "Portfolio Engine",
    template: "%s · Portfolio Engine",
  },
  description:
    "Sector, industry, geography, currency and account-type breakdowns for your Wealthsimple portfolio. ETFs dissolved. Nothing leaves your browser.",
  openGraph: {
    title: "Portfolio Engine",
    description:
      "The portfolio breakdown Wealthsimple doesn't show you. Sector and industry breakdowns from your Holdings Report. Runs entirely in your browser.",
    url: "https://portfolio.samirmd.com",
    siteName: "Portfolio Engine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Engine",
    description:
      "Sector, industry and geography breakdowns for your Wealthsimple portfolio.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
