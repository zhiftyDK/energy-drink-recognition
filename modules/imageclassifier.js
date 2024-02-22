const {getTrainingData, getRunningData} = require("./trainingdata");
const { Architect, Network, Trainer } = require("synaptic");
const fs = require("fs");

function train() {
    getTrainingData().then(data => {
        let inputLength = data[0].input.length;
        let outputLength = data[0].output.length;
    
        // train the network
        var myNetwork = new Architect.Perceptron(inputLength, 32, 16, outputLength);
        var trainer = new Trainer(myNetwork)
        trainer.train(data, {
            rate: .1,
            iterations: 50000,
            error: .005,
            shuffle: true,
            log: 1,
            cost: Trainer.cost.CROSS_ENTROPY
        });
    
        //Save the model
        fs.writeFileSync("./model.json", JSON.stringify(myNetwork.toJSON()), {encoding: "utf8"});
    });
}


function run(path) {
    return new Promise((resolve, reject) => {
        getRunningData(path).then(data => {
            const imported = Network.fromJSON(JSON.parse(fs.readFileSync("./model.json", {encoding: "utf8"})));
            const output = imported.activate(data);
    
            resolve({
                tag: fs.readdirSync("./data/")[output.indexOf(Math.max.apply(null, output))],
                probability: Math.max.apply(null, output)
            });
        });
    })
}

module.exports = {train, run};