const imageClassifier = require("./modules/image-classifier");
const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const fs = require("fs");
const Datastore = require("nedb");
const energydrinksdb = new Datastore("./data/energydrinks.db");
const ratingsdb = new Datastore("./data/ratings.db");
energydrinksdb.loadDatabase();
ratingsdb.loadDatabase();

//Load energydrinks that doesnt exist into database
fs.readdirSync("./energydrinks/").forEach(energydrink => {
    energydrinksdb.findOne({name: energydrink}, (err, docs) => {
        if(err) throw new Error("An error occured!");
        if(docs === null) {
            const energyDrinkObject = {
                name: energydrink
            }
            energydrinksdb.insert(energyDrinkObject);
        }
    });
});

app.use(cors());
app.use(express.json());

app.post("/compare", multer().single("file"), (req, res) => {
    imageClassifier.compare(req.file.buffer).then(result => {
        res.json(result);
        console.log(result);
    });
});

app.post("/ratings/create", (req, res) => {
    if(req.body.rating < 1 || req.body.rating > 10) {
        return res.send({error: true, message: "Rating must be between 1 and 10!"});
    }
    energydrinksdb.findOne({name: req.body.energydrink}, (err, docs) => {
        if(docs != null) {
            const ratingObject = {
                name: req.body.name,
                comment: req.body.comment,
                rating: req.body.rating,
                energydrink: req.body.energydrink
            }
            ratingsdb.insert(ratingObject);
            return res.send({error: false, message: "Rating has been registered successfully!"});
        }
    })
});

app.post("/ratings/get", (req, res) => {
    console.log(req.body.energydrink);
    ratingsdb.find({energydrink: req.body.energydrink}, (err, docs) => {
        if(err) {
            return res.send({error: true, message: "An error occured!"});
        }
        if(docs == null) {
            return res.send({error: true, message: "Energydrink does not exist!"});
        }
        console.log(docs);
        return res.send({error: false, ratings: docs});
    })
});

// imageClassifier.process("./energydrinks/");

app.listen(3000, () => {
    console.log("Server is running!");
});