/* Required */

const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

/* Mongodb login */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4yyh4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/* Main Function */

async function run() {
  /* Get All Products */
  try {
    app.get("/allproducts", async (req, res) => {
      await client.connect();
      const database = client.db("gpushop");
      const products = database.collection("products");
      const allitems = products.find({});
      const result = await allitems.toArray();
      res.send(result);
    });
  } finally {
    await client.close();
  }
  /* Get Upcoming Products */
  try {
    app.get("/upcoming", async (req, res) => {
      await client.connect();
      const database = client.db("gpushop");
      const products = database.collection("upcoming");
      const allitems = products.find({});
      const result = await allitems.toArray();
      res.send(result);
    });
  } finally {
    await client.close();
  };
  /* Get Product Detail */
  try {
    app.get("/details/:id", async (req, res) => {
      await client.connect();
      const id = req.params.id
      const database = client.db("gpushop");
      const products = database.collection("products");
      const findby = {_id: ObjectId(id)};
      const result = await products.findOne(findby);
      res.send(result);
    });
  } finally {
    await client.close();
  };
}
run().catch(console.dir);

/* For Checking */

app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log("listening to", port);
});
