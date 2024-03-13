const imageClassifier = require("./modules/image-classifier");
const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const Datastore = require("nedb");
const energydrinksdb = new Datastore("./data/energydrinks.db");
const ratingsdb = new Datastore("./data/ratings.db");
energydrinksdb.loadDatabase();
ratingsdb.loadDatabase();

app.use(cors());

app.post("/compare", multer().single("file"), (req, res) => {
    imageClassifier.compare(req.file.buffer).then(result => {
        res.json(result);
    });
});

// imageClassifier.process("./data/");



app.listen(3000, () => {
    console.log("Server is running!");
});