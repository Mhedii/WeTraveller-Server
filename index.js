const express = require("express");
const { MongoClient, Collection } = require('mongodb');
const cors = require('cors');
require("dotenv").config();

const ObjectId = require("mongodb").ObjectId;
const app = express();
app.use(cors());
app.use(express.json());

const bodyParser = require("body-parser");
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gy9cw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const uri = "mongodb+srv://mydb1:VHOLkhCNfFSe76m1@cluster0.gy9cw.mongodb.net/travelAgency?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello Worlsssd!");
});

client.connect((err) => {
    const servicesCollection = client.db("travelAgency").collection("Information");
    const usersCollection = client.db("travelAgency").collection("users");
    const ordersCollection = client.db("travelAgency").collection("orders");
    const reviewCollection = client.db("travelAgency").collection("review");

    //add servicesCollection
    app.post("/add", async (req, res) => {
        const result = await servicesCollection.insertOne(req.body);
        res.send(result);
        console.log("result");

    });
    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });
    // get all services
    app.get("/Services", async (req, res) => {
        const result = await servicesCollection.find({}).toArray();
        res.send(result);
    });

    // // // single service
    app.get("/singleOrder/:id", async (req, res) => {
        console.log(req.params.id);
        const result = await servicesCollection
            .find({ _id: ObjectId(req.params.id) })
            .toArray();
        res.send(result[0]);
        console.log(result);
    });

    // // // insert order and

    app.post("/addOrders", async (req, res) => {
        const result = await ordersCollection.insertOne(req.body);
        res.send(result);
    });

    // // //  my order

    app.get("/myOrder/:email", async (req, res) => {
        const result = await ordersCollection
            .find({ email: req.params.email })
            .toArray();
        console.log(result);
        res.send(result);
    });

    // cofirm order
    app.post("/confirmBooking", async (req, res) => {
        const result = await ordersCollection.insertOne(req.body);
        res.send(result);
    });
    //Delete items
    app.delete("/deleteOrders/:id", async (req, res) => {
        const result = await ordersCollection.deleteOne({
            _id: ObjectId(req.params.id),
        });
        res.send(result);
    });
    // // // review
    app.post("/addSReview", async (req, res) => {
        const result = await reviewCollection.insertOne(req.body);
        res.send(result);
    });
    app.post('/reviews', async (req, res) => {
        const reviews = await reviewCollection.insertOne(req.body);
        res.json(reviews);
    });
    //See Review
    app.get("/seeReview", async (req, res) => {
        const result = await reviewCollection.find({}).toArray();
        res.send(result);
    });
    //add user
    app.post("/addUserInfo", async (req, res) => {
        console.log("req.body");
        const result = await usersCollection.insertOne(req.body);
        res.json(result);
        console.log(result);
    });
    //  make admin

    app.put("/makeAdmin", async (req, res) => {
        const filter = { email: req.body.email };
        const result = await usersCollection.find(filter).toArray();
        if (result) {
            const documents = await usersCollection.updateOne(filter, {
                $set: { role: "admin" },
            });
            console.log(documents);
        }
        else {
            const role = "admin";
            const result = await usersCollection.insertOne(req.body.email, {
                role: role,
            });
        }

        console.log(result);
    });

    // check admin or not
    app.get("/checkAdmin/:email", async (req, res) => {
        const result = await usersCollection
            .find({ email: req.params.email })
            .toArray();
        console.log(result);
        res.send(result);
    });
    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })
    /// all order
    app.get("/allOrders", async (req, res) => {
        // console.log("hello");
        const result = await ordersCollection.find({}).toArray();
        res.send(result);
    });

    // status update
    app.put("/statusUpdate/:id", async (req, res) => {
        const filter = { _id: ObjectId(req.params.id) };
        console.log(req.params.id);
        const result = await ordersCollection.updateOne(filter, {
            $set: {
                status: req.body.status,
            },
        });
        res.send(result);
        console.log(result);
    });
    //update
    app.put("/updateStatus/:id", (req, res) => {
        const id = req.params.id;
        const updatedStatus = req.body.status;
        const filter = { _id: ObjectId(id) };
        console.log(updatedStatus);
        ordersCollection
            .updateOne(filter, {
                $set: { status: updatedStatus },
            })
            .then((result) => {
                res.send(result);
            });
    });
    /// all product
    app.get("/allProducts", async (req, res) => {

        const result = await servicesCollection.find({}).toArray();
        res.send(result);
    });
    //Delete items
    app.delete("/deleteProducts/:id", async (req, res) => {
        const result = await servicesCollection.deleteOne({
            _id: ObjectId(req.params.id),
        });
        res.send(result);
    });
});

app.listen(process.env.PORT || port);
