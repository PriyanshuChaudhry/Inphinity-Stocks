require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const { HoldingsModel } = require("./model/HoldingsModel");

const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

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
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.get("/allOrders", async (req, res) => {
  const allOrders = await OrdersModel.find({}).sort({ _id: -1 });
  res.json(allOrders);
});

app.post("/newOrder", async (req, res) => {
  const name = req.body.name;
  const qty = Number(req.body.qty);
  const price = Number(req.body.price);
  const mode = req.body.mode === "SELL" ? "SELL" : "BUY";

  const newOrder = new OrdersModel({ name, qty, price, mode });
  await newOrder.save();

  const existing = await HoldingsModel.findOne({ name });

  if (mode === "BUY") {
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

  broadcastEvent({ type: "data-updated" });

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("App started!");
  mongoose.connect(uri);
  console.log("DB started!");
});