import express from "express";
import { MongoClient, Db } from "mongodb";
import { connectDB } from "./database";

// DB settings
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "edge_data";
let db: Db;

// 接続周りの処理をする。
connectDB(client, dbName).then((returnDB: Db) => {
  db = returnDB;
});

// Server settings
const port = 3030;
const app = express();

// Router settings
app.listen(port, async () => {
  console.log("listening on port " + port);
});

app.get("/api/edge_data/:SensorName", async (req, res) => {
  const collection = db.collection(req.params.SensorName);
  const data = await collection.find({}).toArray();
  res.send(JSON.stringify(data));
});
