/**
 * Fetches a current price from Yahoo Finance's public (unofficial) chart
 * endpoint. No API key needed, which is why it's used for v1 — but it's
 * unofficial and can rate-limit or change shape without notice. If it
 * becomes unreliable, swap this out for a keyed provider (Finnhub, Alpha
 * Vantage, Twelve Data all have usable free tiers) — every call site in
 * this app goes through this one function, so that's a one-file change.
 *
 * Works for both equities ("AVGO") and FX pairs ("CAD=X" = USD/CAD).
 */
export async function getPrice(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const json = await res.json()
    const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice
    return typeof price === 'number' ? price : null
  } catch {
    return null
  }
}
