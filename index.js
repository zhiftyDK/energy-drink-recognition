const knn = require("./modules/knn");

// knn.process()

knn.compare("./Rtest.jpg").then(result => {
    console.log(result);
});