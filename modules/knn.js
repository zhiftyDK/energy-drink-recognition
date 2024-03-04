const fs = require("fs");
const sharp = require("sharp");
const { loadImage, createCanvas } = require('canvas');
const tf = require('@tensorflow/tfjs');
const mobilenetModule = require('@tensorflow-models/mobilenet');
const knnClassifier = require('@tensorflow-models/knn-classifier');
const classifier = knnClassifier.create();

tf.env().set('PROD', true);

let imageSize = 64;

async function saveDatasetToJson(dataset, filename) {
    const jsonDataset = {};
    Object.keys(dataset).forEach((key) => {
        const data = dataset[key].dataSync();
        jsonDataset[key] = Array.from(data);
    });
    fs.writeFileSync(filename, JSON.stringify(jsonDataset));
    console.log(`Dataset saved to ${filename}`);
}

async function loadDatasetFromJson(filename) {
    const jsonDataset = JSON.parse(fs.readFileSync(filename));
    const dataset = {};
    Object.keys(jsonDataset).forEach((key) => {
        const data = jsonDataset[key];
        dataset[key] = tf.tensor2d(data, [data.length / 1024, 1024]);
    });
    return dataset;
}

async function process() {
    const mobilenet = await mobilenetModule.load();
    let totalImages = 0;
    let iteration = 0;
    fs.readdirSync("./data/").forEach(classLabel => {
        totalImages += fs.readdirSync("./data/" + classLabel).length;
        fs.readdirSync("./data/" + classLabel).forEach(async (imagePath) => {
            const buffer = fs.readFileSync(`./data/${classLabel}/${imagePath}`);
            const resizedBuffer = await sharp(buffer).resize(imageSize, imageSize).removeAlpha().toBuffer();
            const image = await loadImage(resizedBuffer);
            const canvas = createCanvas(imageSize, imageSize);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            const logits = mobilenet.infer(tf.browser.fromPixels(canvas), true);
            classifier.addExample(logits, classLabel);
            iteration++;
            console.log(`Processing images: ${iteration}/${totalImages}`);
            if(iteration == totalImages) {
                const dataset = classifier.getClassifierDataset();
                await saveDatasetToJson(dataset, "model.json");
            }
        });
    });
}

async function compare(imagePath) {
    const mobilenet = await mobilenetModule.load();
    const buffer = fs.readFileSync(imagePath);
    if(fs.existsSync("model.json")) {
        const dataset = await loadDatasetFromJson("model.json");
        classifier.setClassifierDataset(dataset);
        const resizedBuffer = await sharp(buffer).resize(imageSize, imageSize).removeAlpha().toBuffer();
        const image = await loadImage(resizedBuffer);
        const canvas = createCanvas(imageSize, imageSize);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const logits = mobilenet.infer(tf.browser.fromPixels(canvas), true);
        const prediction = await classifier.predictClass(logits);
        return prediction;
    } else {
        throw new Error("No model file exists!");
    }
}

module.exports = {process, compare, imageSize};