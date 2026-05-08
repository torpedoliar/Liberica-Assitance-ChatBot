import express from "express";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser
  app.use(express.json());

  // Proxy endpoint to fetch stock price
  app.get("/api/stock/price/:ticker", async (req, res) => {
    try {
      const ticker = req.params.ticker;
      // Default to adding .JK for Indonesian stocks if no dot is provided
      const symbol = ticker.includes(".") ? ticker : `${ticker}.JK`;
      
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`);
      if (!response.ok) {
        return res.status(404).json({ error: "Ticker not found" });
      }
      const data = await response.json();
      
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        return res.status(404).json({ error: "Ticker data not found" });
      }

      const meta = data.chart.result[0].meta;

      res.json({
        symbol: meta.symbol,
        price: meta.regularMarketPrice,
        currency: meta.currency,
        exchange: meta.exchangeName,
        status: "REGULAR", // simplifying market state
      });
    } catch (error: any) {
      console.error(`Failed to fetch price for ${req.params.ticker}`, error.message);
      res.status(500).json({ error: "Failed to fetch stock data." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
