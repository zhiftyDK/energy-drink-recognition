const tf = require('@tensorflow/tfjs');
const mobilenetModule = require('@tensorflow-models/mobilenet');
const knnClassifier = require('@tensorflow-models/knn-classifier');
const classifier = knnClassifier.create();
const { loadImage, createCanvas } = require('canvas');
const fs = require("fs");
const sharp = require("sharp");

tf.env().set('PROD', true);

const imageSize = 64;

async function saveDatasetToJson(dataset, filename) {
    // Convert dataset to JSON
    const jsonDataset = {};
    Object.keys(dataset).forEach((key) => {
        const data = dataset[key].dataSync();
        jsonDataset[key] = Array.from(data);
    });

    // Write JSON to file
    fs.writeFileSync(filename, JSON.stringify(jsonDataset));
    console.log(`Dataset saved to ${filename}`);
}

async function loadDatasetFromJson(filename) {
    // Read JSON file
    const jsonDataset = JSON.parse(fs.readFileSync(filename));

    // Convert JSON data to tensors
    const dataset = {};
    Object.keys(jsonDataset).forEach((key) => {
        const data = jsonDataset[key];
        dataset[key] = tf.tensor2d(data, [data.length / 1024, 1024]);
    });

    return dataset;
}

function process() {
    return new Promise((resolve, reject) => {
        mobilenetModule.load().then(mobilenet => {
            let totalImages = 0;
            fs.readdirSync("./data/").forEach(classlabel => {
                totalImages += fs.readdirSync("./data/" + classlabel).length;
            });
            let iteration = 0;
            fs.readdirSync("./data/").forEach(classlabel => {
                fs.readdirSync("./data/" + classlabel).forEach(image => {
                    const imagePath = `./data/${classlabel}/${image}`;
                    const buffer = fs.readFileSync(imagePath);
                    sharp(buffer).resize(imageSize, imageSize).removeAlpha().toBuffer().then(buffer => {
                        loadImage(buffer).then(image => {
                            const canvas = createCanvas(imageSize, imageSize);
                            const ctx = canvas.getContext("2d");
                            ctx.drawImage(image, 0, 0);
                            console.log(canvas.height);
                            const logits = mobilenet.infer(tf.browser.fromPixels(canvas), true);
                            classifier.addExample(logits, classlabel);
                            iteration++;
                            console.log(`Processing images: ${iteration}/${totalImages}`);
                            if(iteration == totalImages) {
                                const dataset = classifier.getClassifierDataset();
                                console.log(dataset);
                                saveDatasetToJson(dataset, "model.json").then(() => {
                                    resolve();
                                });
                            }
                        })
                    });
                })
            });
        });
    });
}

function compare(imagePath) {
    return new Promise((resolve, reject) => {
        mobilenetModule.load().then(mobilenet => {
            const buffer = fs.readFileSync(imagePath);
            if(fs.existsSync("model.json")) {
                loadDatasetFromJson("model.json").then(dataset => {
                    classifier.setClassifierDataset(dataset);
                    sharp(buffer).resize(imageSize, imageSize).removeAlpha().toBuffer().then(buffer => {
                        loadImage(buffer).then(image => {
                            const canvas = createCanvas(imageSize, imageSize);
                            const ctx = canvas.getContext("2d");
                            ctx.drawImage(image, 0, 0);
                            const logits = mobilenet.infer(tf.browser.fromPixels(canvas), true);
                            classifier.predictClass(logits).then(data => {
                                resolve(data);
                            });
                        });
                    });
                });
            } else {
                reject("You need to process the images!");
            }
        });
    });
}

module.exports = {process, compare};