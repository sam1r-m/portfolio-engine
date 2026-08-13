import type { Metadata } from "next";
import { Libre_Caslon_Text, Montserrat } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { PortfolioRehydrate } from "@/components/providers/portfolio-rehydrate";
import "./globals.css";

const caslon = Libre_Caslon_Text({
  variable: "--font-caslon",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
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
    "Reads a Wealthsimple holdings export and shows what the portfolio is actually made of, with funds broken down into the sectors they hold.",
  openGraph: {
    title: "Portfolio Engine",
    description:
      "Drop the Wealthsimple holdings csv. Live prices, real fund sector weights, cap size and region.",
    url: "https://portfolio.samirmd.com",
    siteName: "Portfolio Engine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Engine",
    description:
      "What a Wealthsimple portfolio is actually made of, at today's prices.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${caslon.variable} ${montserrat.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        {/*
          THESIS: a measuring instrument for one portfolio, not a dashboard
          presenting to an audience. No card grid of donuts, no four-tile hero.
          OWN-WORLD: ruled ground, white panels edge to edge, hairline rules,
          corner registration ticks, Libre Caslon over Montserrat, one
          ultramarine, gain and loss the only other colour.
          STORY: drop the export, read what the portfolio is made of, trust the
          numbers enough to skip the spreadsheet.
          FIRST VIEWPORT: value measured against book value on a real scale,
          with the basket line under it.
          FORM: instrument panel, user-pinned.
        */}
        <PortfolioRehydrate />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
