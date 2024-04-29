// Importerer moduler fra billedklassificering fra image-classifier.
const imageClassifier = require("./modules/image-classifier");

// Importer andre relevante ind biblotekker.
const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const Datastore = require("nedb");

// Opretter og initialiserer databaser for energidrikke og ratings.
const energydrinksdb = new Datastore("./data/energydrinks.db");
const ratingsdb = new Datastore("./data/ratings.db");

// Indlæser databaserne fra filsystemet, så de er klar til brug.
energydrinksdb.loadDatabase();
ratingsdb.loadDatabase();

// Aktiverer CORS på alle ruter for at tillade alle CORS-anmodninger.
app.use(cors());

// Opretter en POST-rute til at sammenligne billeder ved hjælp af multer til at håndtere filuploads.
app.post("/compare", multer().single("file"), (req, res) => {
    // Anvender imageClassifier's compare-funktion på den uploadede fil.
    imageClassifier.compare(req.file.buffer).then(result => {
        // Sender resultatet tilbage som JSON og udskriver det til konsollen.
        res.json(result);
        console.log(result);
    });
});

// Den kommenteret linje er kun brugt når klassifikatoren skal trænes med nye data.
// imageClassifier.process("./energydrinks/");

// Starter serveren på port 3000 og udskriver en besked til konsollen.
app.listen(3000, () => {
    console.log("Server is running!");
});