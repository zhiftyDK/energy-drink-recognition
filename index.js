const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

const IMAGE_WIDTH = 224;
const IMAGE_HEIGHT = 224;
const NUM_CLASSES = 2;

const trainingdata = fs.readdirSync("./trainingdata/");

trainingdata.map(folder => {
    console.log(folder);
})

const cats = catsFiles.map((file) => {
  const filePath = `${catsDir}/${file}`;
  const buffer = fs.readFileSync(filePath);
  const decodedImage = tf.node.decodeImage(buffer);
  const resizedImage = tf.image.resizeBilinear(decodedImage, [IMAGE_WIDTH, IMAGE_HEIGHT]);
  return resizedImage;
});

const dogs = dogsFiles.map((file) => {
  const filePath = `${dogsDir}/${file}`;
  const buffer = fs.readFileSync(filePath);
  const decodedImage = tf.node.decodeImage(buffer);
  const resizedImage = tf.image.resizeBilinear(decodedImage, [IMAGE_WIDTH, IMAGE_HEIGHT]);
  return resizedImage;
});

const images = cats.concat(dogs);
const labels = tf.tensor2d(
  Array.from({ length: cats.length }).fill([1, 0])
  .concat(Array.from({ length: dogs.length }).fill([0, 1]))
);