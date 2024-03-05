const knn = require("./modules/knn");

// knn.imageSize = 128;

// knn.process();

knn.compare("./Rtest.jpg").then(result => {
    console.log(result);
});