const express = require("express");
const cors = require("cors");
const { mongoClient } = require("./server");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoClient();

function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

app.get("/api/orders/:order_id", async (req, res) => {
  const db = await mongoClient();

  const orderid = req.params.order_id;

  const data = await db
    .collection("database.Orders")
    .find({ order_id: orderid });
  var stringprint = JSON.stringify(data);

  if (data !== undefined)
    res.status(200).json(`Order exists ${stringprint} and ${data}`);
  else res.status(200).json(`Order doesn't exist`);
});

app.listen(port, () => {
  console.log(`The port is listening on ${port}`);
});

app.post("/api/orders", async (req, res) => {
  const db = await mongoClient();
  if (!db) res.status(500).json("Systems Unavailable");

  const newOrder = db
    .collection("Orders")
    .insertOne({ order_id: guidGenerator(), order_status: "CREATED" });

  res
    .status(200)
    .json({ body: newOrder, message: "Order is created successfully" });
});

app.delete("/api/orders/:order_id", async (req, res) => {
  const db = await mongoClient();

  const orderid = req.params.order_id;
  if (!db) res.status(500).json("Systems Unavailable");

  const datas = db.collection("Orders").findOne({ order_id: orderid });

  //res.status(200).json(data.order_id);

  if (!datas) res.status(200).json("Order cannot be found");

  const updatedData = db
    .collection("Orders")
    .updateOne({ order_id: orderid }, { $set: { order_status: "DELETED" } });
  res.status(200).json("Orde has been cancelled");
}); //or i can use remove

app.patch("/api/orders/:order_id", async (req, res) => {
  const db = await mongoClient();

  const orderid = req.params.order_id;

  var datas = db.collection("Orders").findOne({ order_id: orderid });
  const currentOrderStatus = datas.order_status;

  //res.status(200).json(data.order_id);

  if (!datas) res.status(200).json("Order cannot be found");

  let nextOrderStatus;

  switch (currentOrderStatus) {
    case "CREATED":
      nextOrderStatus = "PROCESSED";
      break;
    case "DELETED":
      nextOrderStatus = "DELETED";
      break;
    default:
      nextOrderStatus = "FULLFILLED";
  }

  /*db.collection("Orders").updateOne( 
    { order_id: orderid },
    { $set: { order_status: nextOrderStatus } }
  ); */

  const { data } = db
    .collection("Orders")
    .findOneAndUpdate(
      { order_id: orderid },
      { $set: { order_status: nextOrderStatus } }
    );

  res.status(200).json(`Order status has been updated ${data}`);
});
