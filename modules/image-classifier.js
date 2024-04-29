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

async function getImage(pathOrBuffer) {
    let buffer;
    if(typeof pathOrBuffer === "string") {
        buffer = fs.readFileSync(pathOrBuffer);
    } else {
        buffer = pathOrBuffer;
    }
    const resizedBuffer = await sharp(buffer).resize(imageSize, imageSize).removeAlpha().toBuffer();
    const image = await loadImage(resizedBuffer);
    const canvas = createCanvas(imageSize, imageSize);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    return tf.browser.fromPixels(canvas);
}

async function process(datasetPath) {
    const mobilenet = await mobilenetModule.load();
    let totalImages = 0;
    let iteration = 0;
    fs.readdirSync(datasetPath).forEach(classLabel => {
        totalImages += fs.readdirSync(datasetPath + classLabel).length;
        fs.readdirSync(datasetPath + classLabel).forEach(async (imagePath) => {
            const image = await getImage(`${datasetPath}${classLabel}/${imagePath}`);
            const logits = mobilenet.infer(image, true);
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

async function compare(imagePathOrBuffer) {
    if(fs.existsSync("model.json")) {
        const mobilenet = await mobilenetModule.load();
        const dataset = await loadDatasetFromJson("model.json");
        classifier.setClassifierDataset(dataset);
        const image = await getImage(imagePathOrBuffer);
        const logits = mobilenet.infer(image, true);
        const prediction = await classifier.predictClass(logits);
        return prediction;
    } else {
        throw new Error("No model file exists!");
    }
}

module.exports = {process, compare, imageSize};