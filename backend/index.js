require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { FundsModel } = require("./model/FundsModel");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();

app.use(cors());
app.use(bodyParser.json());


const sseClients = [];

function broadcastEvent(dataObject) {
  const payload = `data: ${JSON.stringify(dataObject)}\n\n`;
  sseClients.forEach((res) => res.write(payload));
}

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders && res.flushHeaders();

  res.write("event: ping\n");
  res.write("data: {}\n\n");

  sseClients.push(res);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

app.get("/allHoldings", async (req, res) => {
  try {
    let allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
  } catch (error) {
    console.error("Error fetching holdings:", error);
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

app.get("/allPositions", async (req, res) => {
  try {
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

app.get("/allOrders", async (req, res) => {
  try {
    const allOrders = await OrdersModel.find({}).sort({ _id: -1 });
    res.json(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("/allFunds", async (req, res) => {
  try {
    let funds = await FundsModel.findOne({});
    if (!funds) {
      // Initialize with default values if no funds record exists
      funds = new FundsModel({
        availableMargin: 100000.0,
        usedMargin: 0.0,
        openingBalance: 100000.0,
        payin: 0.0,
      });
      await funds.save();
    }
    res.json(funds);
  } catch (error) {
    console.error("Error fetching funds:", error);
    res.status(500).json({ error: "Failed to fetch funds" });
  }
});

app.post("/newOrder", async (req, res) => {
  try {
    const name = req.body.name;
    const qty = Number(req.body.qty);
    const price = Number(req.body.price);
    const mode = req.body.mode === "SELL" ? "SELL" : "BUY";

    if (!name || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Invalid order parameters" });
    }

    const totalCost = qty * price;

    // Get or initialize funds
    let funds = await FundsModel.findOne({});
    if (!funds) {
      funds = new FundsModel({
        availableMargin: 100000.0,
        usedMargin: 0.0,
        openingBalance: 100000.0,
        payin: 0.0,
      });
      await funds.save();
    }

    // Check if user has sufficient funds for BUY
    if (mode === "BUY" && funds.availableMargin < totalCost) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // For SELL, check if user has sufficient holdings
    if (mode === "SELL") {
      const existing = await HoldingsModel.findOne({ name });
      if (!existing || Number(existing.qty) < qty) {
        return res.status(400).json({ error: "Insufficient holdings to sell" });
      }
    }

    // Save the order
    const newOrder = new OrdersModel({ name, qty, price, mode });
    await newOrder.save();

    // Update Holdings
    const existing = await HoldingsModel.findOne({ name });

    if (mode === "BUY") {
      // Deduct funds
      funds.availableMargin = Number(funds.availableMargin) - totalCost;
      funds.usedMargin = Number(funds.usedMargin) + totalCost;
      await funds.save();

      if (existing) {
        const newQty = Number(existing.qty) + qty;
        const newAvg = newQty > 0 ? ((Number(existing.avg) * Number(existing.qty)) + (price * qty)) / newQty : 0;
        existing.qty = newQty;
        existing.avg = newAvg;
        existing.price = price; 
        await existing.save();
      } else {
        await new HoldingsModel({ name, qty, avg: price, price, net: "0.00%", day: "0.00%" }).save();
      }
    } else if (mode === "SELL") {
      // Add funds back
      funds.availableMargin = Number(funds.availableMargin) + totalCost;
      funds.usedMargin = Math.max(0, Number(funds.usedMargin) - totalCost);
      await funds.save();

      if (existing) {
        const newQty = Number(existing.qty) - qty;
        if (newQty <= 0) {
          await HoldingsModel.deleteOne({ _id: existing._id });
        } else {
          existing.qty = newQty;
          existing.price = price;
          await existing.save();
        }
      }
    }

    // Update Positions
    const posFilter = { product: "CNC", name };
    const currentPos = await PositionsModel.findOne(posFilter);
    if (mode === "BUY") {
      if (currentPos) {
        const newQty = Number(currentPos.qty) + qty;
        const newAvg = newQty > 0 ? ((Number(currentPos.avg) * Number(currentPos.qty)) + (price * qty)) / newQty : 0;
        currentPos.qty = newQty;
        currentPos.avg = newAvg;
        currentPos.price = price;
        currentPos.isLoss = false;
        await currentPos.save();
      } else {
        await new PositionsModel({ product: "CNC", name, qty, avg: price, price, net: "0.00%", day: "0.00%", isLoss: false }).save();
      }
    } else {
      if (currentPos) {
        const newQty = Number(currentPos.qty) - qty;
        if (newQty <= 0) {
          await PositionsModel.deleteOne({ _id: currentPos._id });
        } else {
          currentPos.qty = newQty;
          currentPos.price = price;
          await currentPos.save();
        }
      }
    }

    // Broadcast update event to all SSE clients
    broadcastEvent({ type: "data-updated" });

    res.json({ success: true });
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).json({ error: "Failed to process order" });
  }
});

app.listen(PORT, () => {
  console.log("App started!");
  mongoose.connect(uri);
  console.log("DB started!");
});