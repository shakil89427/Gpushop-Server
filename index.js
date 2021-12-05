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
const stripe = require("stripe")(process.env.STRIPE_SECRET);

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
  }

  /* Get Product Detail */
  try {
    app.get("/details/:id", async (req, res) => {
      await client.connect();
      const id = req.params.id;
      const database = client.db("gpushop");
      const products = database.collection("products");
      const findby = { _id: ObjectId(id) };
      const result = await products.findOne(findby);
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Add To Cart */
  try {
    app.post("/addtocart", async (req, res) => {
      await client.connect();
      const data = req.body;
      const database = client.db("cart");
      const cart = database.collection(data.userId);
      const findby = { _id: data._id };
      const result = await cart.findOne(findby);
      if (!result) {
        data.quantity = 1;
        const again = await cart.insertOne(data);
        res.send(again);
      } else {
        const newquantity = result.quantity + 1;
        const updated = {
          $set: { quantity: newquantity },
        };
        const update = await cart.updateOne(findby, updated);
        res.send(update);
      }
    });
  } finally {
    await client.close();
  }

  /* Get All from cart */
  try {
    app.get("/allcart/:id", async (req, res) => {
      await client.connect();
      const userId = req.params.id;
      const database = client.db("cart");
      const cart = database.collection(userId);
      const allitems = cart.find({});
      const result = await allitems.toArray();
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Delate from cart */
  try {
    app.delete("/deletefromcart/:id", async (req, res) => {
      await client.connect();
      const userId = req.query.uid;
      const id = req.params.id;
      const database = client.db("cart");
      const cart = database.collection(userId);
      const item = { _id: id };
      const result = await cart.deleteOne(item);
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Add Review */
  try {
    app.post("/addreview", async (req, res) => {
      await client.connect();
      const data = req.body;
      const database = client.db("reviews");
      const reviews = database.collection("allreviews");
      const result = await reviews.insertOne(data);
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Get All Reviews */
  try {
    app.get("/allreviews", async (req, res) => {
      await client.connect();
      const database = client.db("reviews");
      const reviews = database.collection("allreviews");
      const allitems = reviews.find({});
      const result = await allitems.toArray();
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Place Order */
  try {
    app.post("/placeorder", async (req, res) => {
      await client.connect();
      const data = req.body;
      const userId = data[0].userId;
      const cartdatabase = client.db("cart");
      const cartcollection = cartdatabase.collection(userId);
      const deletequery = { userId: userId };
      const orderdatabase = client.db("orders");
      const allorders = orderdatabase.collection("allorders");
      const result = await allorders.insertMany(data);
      if (result.acknowledged) {
        const newresult = await cartcollection.deleteMany(deletequery);
        if (newresult.acknowledged) {
          res.send(newresult);
        }
      }
    });
  } finally {
    await client.close();
  }

  /* My orders */
  try {
    app.get("/myorders/:id", async (req, res) => {
      await client.connect();
      const findby = req.params.id;
      const database = client.db("orders");
      const allorders = database.collection("allorders");
      const allitems = allorders.find({ useremail: findby });
      const result = await allitems.toArray();
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Delate Order */
  try {
    app.delete("/delateorder/:id", async (req, res) => {
      await client.connect();
      const id = req.params.id;
      const database = client.db("orders");
      const orders = database.collection("allorders");
      const findby = { _id: ObjectId(id) };
      const result = await orders.deleteOne(findby);
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Add Product */
  try {
    app.post("/addproduct", async (req, res) => {
      await client.connect();
      const data = req.body;
      const database = client.db("gpushop");
      const product = database.collection("products");
      const result = await product.insertOne(data);
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Delate Product */
  try {
    app.delete("/delateproduct/:id", async (req, res) => {
      await client.connect();
      const id = req.params.id;
      const database = client.db("gpushop");
      const products = database.collection("products");
      const findby = { _id: ObjectId(id) };
      const result = await products.deleteOne(findby);
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* All orders */
  try {
    app.get("/allorders", async (req, res) => {
      await client.connect();
      const database = client.db("orders");
      const allorders = database.collection("allorders");
      const allitems = allorders.find({});
      const result = await allitems.toArray();
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Change Status */
  try {
    app.post("/changestatus/:id", async (req, res) => {
      await client.connect();
      const id = req.params.id;
      const database = client.db("orders");
      const allorders = database.collection("allorders");
      const findby = { _id: ObjectId(id) };
      const updated = { $set: { status: "Approved" } };
      const result = await allorders.updateOne(findby, updated);
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Delete Review */
  try {
    app.delete("/deletereview/:id", async (req, res) => {
      await client.connect();
      const id = req.params.id;
      const database = client.db("reviews");
      const reviews = database.collection("allreviews");
      const findby = { _id: ObjectId(id) };
      const result = await reviews.deleteOne(findby);
      res.send(result);
    });
  } finally {
    await client.close();
  }

  /* Add User */
  try {
    app.post("/adduser", async (req, res) => {
      await client.connect();
      const data = req.body;
      const email = req.body.email;
      const options = { upsert: true };
      const database = client.db("users");
      const allusers = database.collection("allusers");
      const findby = { email: email };
      const result = await allusers.findOne(findby);
      if (!result) {
        data.role = "user";
        const newresult = await allusers.insertOne(data);
        if (newresult.acknowledged) {
          res.send(data);
        }
      } else {
        const updated = { $set: data };
        const moreresult = await allusers.updateOne(findby, updated, options);
        const finalresult = await allusers.findOne(findby);
        res.send(finalresult);
      }
    });
  } finally {
    await client.close();
  }

  /* Make Admin */
  try {
    app.post("/makeadmin/:id", async (req, res) => {
      await client.connect();
      const email = req.params.id;
      const database = client.db("users");
      const allusers = database.collection("allusers");
      const findby = { email: email };
      const updated = { $set: { role: "Admin" } };
      const result = await allusers.findOne(findby);
      if (!result) {
        res.send(result);
      } else {
        const newresult = await allusers.updateOne(findby, updated);
        res.send(newresult);
      }
    });
  } finally {
    await client.close();
  }

  /* Find User */
  try {
    app.post("/finduser", async (req, res) => {
      await client.connect();
      let data = req.body;
      const email = data.email;
      const database = client.db("users");
      const allusers = database.collection("allusers");
      const findby = { email: email };
      const result = await allusers.findOne(findby);
      if (!result) {
        data["role"] = "user";
        const newresult = await allusers.insertOne(data);
        res.send(newresult);
      } else {
        res.send(result);
      }
    });
  } finally {
    await client.close();
  }

  /* Create Payment intend */
  try {
    app.post("/create-payment-intent", async (req, res) => {
      await client.connect();
      const price = req.body.price * 100;
      const id = req.body.id;
      const data = req.body.data;
      const payment = await stripe.paymentIntents.create({
        amount: price,
        currency: "usd",
        payment_method: id,
        confirm: true,
      });
      if (payment.status === "succeeded") {
        const userId = data[0].userId;
        payment.orderInfo = data;
        const cartdatabase = client.db("cart");
        const cartcollection = cartdatabase.collection(userId);
        const deletequery = { userId: userId };
        const orderdatabase = client.db("orders");
        const allorders = orderdatabase.collection("allorders");
        const result = await allorders.insertOne(payment);
        if (result.acknowledged) {
          const newresult = await cartcollection.deleteMany(deletequery);
          if (newresult.acknowledged) {
            res.send(newresult);
          }
        }
      }
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

/* For Checking */

app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log("listening to", port);
});
