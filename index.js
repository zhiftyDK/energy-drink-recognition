const nn = require("./modules/imageclassifier");

nn.run("./booster.jpg").then(data => {
    console.log(data);
});