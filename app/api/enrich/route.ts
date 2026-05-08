import { NextResponse } from "next/server";
import { z } from "zod";

// Edge runtime keeps cold starts low. This route only ever sees public
// ticker symbols, never user positions or values.
export const runtime = "edge";

const TickerSchema = z.object({
  symbol: z.string().min(1).max(12),
  mic: z.string().max(8).optional().default(""),
});

const BodySchema = z.object({
  tickers: z.array(TickerSchema).min(1).max(200),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // TODO: actually hit yahoo-finance2 / FMP in the next commit.
  // For now we return an empty map so the dashboard doesn't break.
  return NextResponse.json({ enrichment: {} as Record<string, never> });
}
