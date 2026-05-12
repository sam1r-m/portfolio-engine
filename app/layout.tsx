import type { Metadata } from "next";
import { Libre_Caslon_Text, Montserrat } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { PortfolioRehydrate } from "@/components/providers/portfolio-rehydrate";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const libreCaslon = Libre_Caslon_Text({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.samirmd.com"),
  title: {
    default: "Portfolio Engine",
    template: "%s · Portfolio Engine",
  },
  description:
    "Holdings report charts in the browser. Sector and industry breakdowns for Wealthsimple exports.",
  openGraph: {
    title: "Portfolio Engine",
    description:
      "Parse your Wealthsimple holdings csv locally. Charts for sector, industry, geography, and more.",
    url: "https://portfolio.samirmd.com",
    siteName: "Portfolio Engine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Engine",
    description:
      "Local first portfolio breakdowns from a Wealthsimple holdings export.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${libreCaslon.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <PortfolioRehydrate />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
