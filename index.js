const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
//middle ware
app.use(express.json());
app.use(cors());

//database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbjls.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();

    const database = client.db("IST_Library");
    const bookCollection = database.collection("books");
    const userCollection = database.collection("users");

    // add books
    app.post("/books", async (req, res) => {
      const books = req.body;
      console.log(books);
      const result = await bookCollection.insertOne(books);
      res.json(result);
    });
    // get fixed items from collection
    app.get("/books", async (req, res) => {
      const cursor = bookCollection.find({});
      const items = await cursor.limit(6).toArray();
      res.send(items);
    });

    // get single books
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const event = await bookCollection.findOne(query);
      res.json(event);
    });
    // get single book item
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const event = await bookCollection.findOne(query);
      res.json(event);
    });
    // get all items from collection
    app.get("/allBooks", async (req, res) => {
      const cursor = bookCollection.find({});
      const items = await cursor.toArray();

      res.send(items);
    });

    // get users by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);

      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // add users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    // set users
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // update user role (admin)
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // delete book-item
    app.delete("/allBooks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Ist Online Library is Running...");
});

app.listen(port, () => {
  console.log(`Ist Online Library listening at ${port}`);
});
