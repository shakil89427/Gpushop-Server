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
  /* Add To Cart */
  try {
    app.post("/addtocart", async (req, res) => {
      await client.connect();
      const data = req.body
      const database = client.db("cart");
      const cart = database.collection(data.userId);
      const findby = {_id:data._id};
      const result = await cart.findOne(findby);
      if(!result){
        data.quantity = 1
        const again = await cart.insertOne(data)
        res.send(again)
      }
      else{
        const newquantity = result.quantity+1
        const updated = {
          $set:{quantity: newquantity}
        }
        const update = await cart.updateOne(findby,updated)
        res.send(update)
      }
    });
  } finally {
    await client.close();
  };
  /* Get All from cart */
  try {
    app.get("/allcart/:id", async (req, res) => {
      await client.connect();
      const userId = req.params.id
      const database = client.db("cart");
      const cart = database.collection(userId);
      const allitems = cart.find({});
      const result = await allitems.toArray();
      res.send(result)
    });
  } finally {
    await client.close();
  };
  /* Delate from cart */
  try {
    app.delete("/deletefromcart/:id", async (req, res) => {
      await client.connect();
      const userId = req.query.uid
      const id = req.params.id
      const database = client.db("cart");
      const cart = database.collection(userId);
      const item = {_id:id};
      const result = await cart.deleteOne(item)
      res.send(result)
    });
  } finally {
    await client.close();
  };
  /* Add Review */
  try {
    app.post("/addreview", async (req, res) => {
      await client.connect();
      const data = req.body
      const database = client.db("reviews");
      const reviews = database.collection('allreviews');
      const result = await reviews.insertOne(data)
      res.send(result)
    });
  } finally {
    await client.close();
  };
  /* Get All Reviews */
  try {
    app.get("/allreviews", async (req, res) => {
      await client.connect();
      const database = client.db("reviews");
      const reviews = database.collection('allreviews');
      const allitems = reviews.find({});
      const result = await allitems.toArray();
      res.send(result)
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
