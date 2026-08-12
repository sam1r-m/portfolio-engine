import type { Metadata } from "next";
import { Archivo, Azeret_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { PortfolioRehydrate } from "@/components/providers/portfolio-rehydrate";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const azeret = Azeret_Mono({
  variable: "--font-azeret",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.samirmd.com"),
  title: {
    default: "Portfolio Engine",
    template: "%s · Portfolio Engine",
  },
  description:
    "Turns a Wealthsimple holdings export into live portfolio composition: ETF look-through, cap size, region, and a basket backtest.",
  openGraph: {
    title: "Portfolio Engine",
    description:
      "Drop the Wealthsimple holdings csv. Live prices, real ETF sector weights, cap size and region breakdowns.",
    url: "https://portfolio.samirmd.com",
    siteName: "Portfolio Engine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Engine",
    description:
      "Live portfolio composition from a Wealthsimple holdings export.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${azeret.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        {/*
          THESIS: a measuring instrument for one portfolio, not a dashboard that
          presents to anyone. Refuses the card-grid of donuts and the four-tile
          hero the category ships.
          OWN-WORLD: drafting-paper ground, white panels edge to edge, hairline
          rules, corner registration ticks, Archivo + Azeret Mono, one
          ultramarine, gain/loss the only other colour.
          STORY: drop the export, read what the portfolio is actually made of,
          trust the numbers enough not to open a spreadsheet.
          FIRST VIEWPORT: dashboard opens on the value readout measured against
          book value on a real scale, the basket line beneath it.
          FORM: instrument panel, user-pinned.
        */}
        <PortfolioRehydrate />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
