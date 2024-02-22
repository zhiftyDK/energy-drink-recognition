const fs = require("fs");
const sharp = require("sharp");

function getTrainingData() {
    return new Promise((resolve, reject) => {
        const trainingdata = [];
        fs.readdirSync("./data/").forEach((folder, i) => {
            const oneHot = [];
            fs.readdirSync("./data/").forEach(() => {
                oneHot.push(0);
            });
            oneHot[i] = 1;
            const images = fs.readdirSync(`./data/${folder}/`);
            images.forEach((image) => {
                let buffer = fs.readFileSync(`./data/${folder}/${image}`)
                sharp(buffer).resize(32, 32).raw().toBuffer().then(buffer => {
                    trainingdata.push({
                        input: [...buffer],
                        output: oneHot,
                        path: `./data/${folder}/${image}`,
                        tag: folder
                    });
                    if(trainingdata.length == fs.readdirSync("./data/").length) {
                        resolve(trainingdata);
                    }
                })
            });
        });
    });
}

function getRunningData(path) {
    return new Promise((resolve, reject) => { 
        let buffer = fs.readFileSync(path)
        sharp(buffer).resize(32, 32).raw().toBuffer().then(buffer => {
            resolve([...buffer]);
        });
    });
}

module.exports = {getTrainingData, getRunningData};