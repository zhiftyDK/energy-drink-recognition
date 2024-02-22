const nn = require("./modules/imageclassifier");

nn.run("./data/monster original/ImageHandler.jpg").then(data => {
    console.log(data);
});

// nn.train();