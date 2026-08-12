/** Synthetic, in the export's format. */
export const DEMO_HOLDINGS_CSV_PATH = "/demo/sample_holdings_report.csv";
export const DEMO_HOLDINGS_FILE_NAME = "sample_holdings_report.csv";

export async function fetchDemoHoldingsCsv(): Promise<string> {
  const res = await fetch(DEMO_HOLDINGS_CSV_PATH);
  if (!res.ok) {
    throw new Error("Could not load the sample portfolio.");
  }
  return res.text();
}
