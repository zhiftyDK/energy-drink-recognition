// Importer biblotekker for filhåndtering, billedbehandling og maskinlæring.
const fs = require("fs");
const sharp = require("sharp");
const { loadImage, createCanvas } = require('canvas');
const tf = require('@tensorflow/tfjs');
const mobilenetModule = require('@tensorflow-models/mobilenet');
const knnClassifier = require('@tensorflow-models/knn-classifier');

// Opret en klasse af en K-Nearest Neighbors klassifikator.
const classifier = knnClassifier.create();

// Sæt TensorFlow.js' miljø til produktionsmodus for at optimere ydeevnen.
tf.env().set('PROD', true);

// Definer størrelsen på de billeder, der vil blive behandlet, til 64x64 pixels.
let imageSize = 64;

// Asynkron funktion til at gemme klassifikator-dataset i en JSON-fil.
async function saveDatasetToJson(dataset, filename) {
    const jsonDataset = {};
    // Konverterer hvert klassedatasæt til en liste af arrays fra tensor data.
    Object.keys(dataset).forEach((key) => {
        const data = dataset[key].dataSync();   // Synkroniser tensor data.
        jsonDataset[key] = Array.from(data);    // Omdan tensor data til et normalt array.
    });
    // Skriver den konverterede datasæt til en fil i JSON-format.
    fs.writeFileSync(filename, JSON.stringify(jsonDataset));
    console.log(`Dataset saved to ${filename}`);
}

// Asynkron funktion til at indlæse et klassifikator-dataset fra en JSON-fil.
async function loadDatasetFromJson(filename) {
    const jsonDataset = JSON.parse(fs.readFileSync(filename));  // Indlæs JSON-data fra fil.
    const dataset = {};
    // Omdanner JSON-data til TensorFlow tensors for hver klasse.
    Object.keys(jsonDataset).forEach((key) => {
        const data = jsonDataset[key];
        dataset[key] = tf.tensor2d(data, [data.length / 1024, 1024]);   // Genopret tensor fra flad array.
    });
    return dataset;
}

// Asynkron funktion til at behandle et billede fra en filsti eller en buffer og konvertere det til en tensor.
async function getImage(pathOrBuffer) {
    let buffer;
    // Aflæser billedet som en buffer fra enten en sti eller direkte buffer.
    if(typeof pathOrBuffer === "string") {
        buffer = fs.readFileSync(pathOrBuffer);  // Læs filen fra en sti.
    } else {
        buffer = pathOrBuffer;  // Anvend den givne buffer.
    }
    // Brug Sharp til at ændre billedets størrelse og fjerne alpha-kanalen.
    const resizedBuffer = await sharp(buffer).resize(imageSize, imageSize).removeAlpha().toBuffer();
    // Indlæs og tegn billedet på et lærred for at forberede det til tensor-konvertering.
    const image = await loadImage(resizedBuffer);
    const canvas = createCanvas(imageSize, imageSize);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    return tf.browser.fromPixels(canvas);   // Omdan lærreds pixels til en TensorFlow.js tensor.
}

// Asynkron funktion til at indlæse og træne klassifikatoren med billeder fra en bestemt mappe.
async function process(datasetPath) {
    const mobilenet = await mobilenetModule.load(); // Indlæs MobileNet model til feature-ekstraktion.
    let totalImages = 0;
    let iteration = 0;
    // Iterer over hvert billede i billedmappen og trænner klassifikatoren.
    fs.readdirSync(datasetPath).forEach(classLabel => {
        totalImages += fs.readdirSync(datasetPath + classLabel).length;
        fs.readdirSync(datasetPath + classLabel).forEach(async (imagePath) => {
            const image = await getImage(`${datasetPath}${classLabel}/${imagePath}`);
            const logits = mobilenet.infer(image, true);    // Udtrækker informationer ud fra billedet.
            classifier.addExample(logits, classLabel);   // Tilføj eksemplet til klassifikatoren under den relevante klasse.
            iteration++;
            console.log(`Processing images: ${iteration}/${totalImages}`);
            if(iteration == totalImages) {
                const dataset = classifier.getClassifierDataset();  // Hent klassifikatorens datasæt.
                await saveDatasetToJson(dataset, "model.json");     // Gem datasættet til en JSON-fil.
            }
        });
    });
}

// Asynkron funktion til at sammenligne et billede med den trænede klassifikator og forudsige klassen.
async function compare(imagePathOrBuffer) {
    if(fs.existsSync("model.json")) {
        const mobilenet = await mobilenetModule.load(); // Genindlæs MobileNet modellen.
        const dataset = await loadDatasetFromJson("model.json");    // Indlæs klassifikatorens trænede datasæt.
        classifier.setClassifierDataset(dataset);   // Sæt klassifikatorens datasæt.
        const image = await getImage(imagePathOrBuffer);
        const logits = mobilenet.infer(image, true);    // Udtager informationer ud fra billedet.
        const prediction = await classifier.predictClass(logits);   // Forudsige klassen for billedet, det vil sige den gætter på vilken energi drik det er.
        return prediction;
    } else {
        throw new Error("No model file exists!");
    }
}

// Eksportér funktionerne og imageSize variablen til brug i andre moduler.
module.exports = {process, compare, imageSize};