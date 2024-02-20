const {getTrainingData, getRunningData} = require("./modules/trainingdata");
const { Architect, Network, Trainer } = require("synaptic");
const fs = require("fs");

// getTrainingData().then(data => {
//     console.log(data);
//     let inputLength = data[0].input.length;
//     let outputLength = data[0].output.length;

//     // train the network
//     var myNetwork = new Architect.Perceptron(inputLength, 8, 8, outputLength);
//     var trainer = new Trainer(myNetwork)
//     trainer.train(data, {
//         rate: .1,
//         iterations: 50000,
//         error: .005,
//         shuffle: true,
//         log: 50,
//         cost: Trainer.cost.CROSS_ENTROPY
//     });

//     //Save the model
//     fs.writeFileSync("./model.json", JSON.stringify(myNetwork.toJSON()), {encoding: "utf8"});
// });

getRunningData("./booster-original-24stk.jpg").then(data => {
    const imported = Network.fromJSON(JSON.parse(fs.readFileSync("./model.json", {encoding: "utf8"})));
    const output = imported.activate(data);
    if (Math.max.apply(null, output) > 0.75) {
        console.log(output);
        console.log(fs.readdirSync("./data/")[output.indexOf(Math.max.apply(null, output))]);
    }
});