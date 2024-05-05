// Importerer moduler fra billedklassificering fra image-classifier.
const imageClassifier = require("./modules/image-classifier");

// Importer andre relevante ind biblotekker.
const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const fs = require("fs");
const Datastore = require("nedb");

// Opretter og initialiserer databaser for energidrikke og ratings.
const energydrinksdb = new Datastore("./data/energydrinks.db");
const ratingsdb = new Datastore("./data/ratings.db");

// Indlæser databaserne fra filsystemet, så de er klar til brug.
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

// Aktiverer CORS på alle ruter for at tillade alle CORS-anmodninger.
app.use(cors());
app.use(express.json());

// Opretter en POST-rute til at sammenligne billeder ved hjælp af multer til at håndtere filuploads.
app.post("/compare", multer().single("file"), (req, res) => {
    // Anvender imageClassifier's compare-funktion på den uploadede fil.
    imageClassifier.compare(req.file.buffer).then(result => {
        // Sender resultatet tilbage som JSON og udskriver det til konsollen.
        res.json(result);
        console.log(result);
    });
});

// POST-rute til at oprette en ny vurdering af en energidrik.
app.post("/ratings/create", (req, res) => {
    // Tjek om rating-værdien ligger inden for det gyldige interval fra 1 til 5.
    if(req.body.rating < 1 || req.body.rating > 5) {
        // Hvis ratingen er uden for intervallet, send fejlmeddelelse til klienten.
        return res.send({error: true, message: "Rating must be between 1 and 5!"});
    }
    // Søger i databasen efter den specifikke energidrik for at sikre, at den eksisterer.
    energydrinksdb.findOne({name: req.body.energydrink}, (err, docs) => {
        // Hvis energidrikken findes i databasen, udfør denne blok.
        if(docs != null) {
            // Opretter et nyt ratingobjekt med de modtagne data fra forespørgslen.
            const ratingObject = {
                name: req.body.name,
                comment: req.body.comment,
                rating: req.body.rating,
                energydrink: req.body.energydrink
            }
            // Indsætter det nye ratingobjekt i ratings-databasen.
            ratingsdb.insert(ratingObject);
            // Sender bekræftelse tilbage til klienten om, at ratingen er registreret.
            return res.send({error: false, message: "Rating has been registered successfully!"});
        }
    })
});

// POST-rute til at hente vurderinger baseret på navnet på en energidrik.
app.post("/ratings/get", (req, res) => {
    // Logger navnet på den energidrik, der anmodes om, til konsollen for fejlsøgning.
    console.log(req.body.energydrink);
    // Finder alle dokumenter i ratings-databasen, der matcher den angivne energidrik.
    ratingsdb.find({energydrink: req.body.energydrink}, (err, docs) => {
        // Hvis der opstår en fejl under databasen forespørgslen, send en fejlbesked.
        if(err) {
            return res.send({error: true, message: "An error occured!"});
        }
        // Hvis ingen dokumenter findes (dvs. ingen ratings er registreret), send en fejlmeddelelse.
        if(docs == null) {
            return res.send({error: true, message: "Energydrink does not exist!"});
        }
        // Hvis ratings findes, send dem tilbage til klienten.
        return res.send({error: false, ratings: docs});
    })
});

// Den kommenteret linje er kun brugt når klassifikatoren skal trænes med nye data.
// imageClassifier.process("./energydrinks/");

// Starter serveren på port 3000 og udskriver en besked til konsollen.
app.listen(3000, () => {
    console.log("Server is running!");
});