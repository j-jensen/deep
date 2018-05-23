importScripts("../../test-data/mnist/mnist.js");
importScripts("../../libs/matrix.js");
importScripts("../../part5/src/multi-layer-nn.js");

var nn = new MultiLayerNetwork(784, [40], 10, 0.4);

self.addEventListener('message', function (e) {
    if (e.data == 'START') {
        loadMNIST(function (data) {
            startTraining(data.train_images, data.train_labels)
                .then(startTesting.bind(null, data.test_images, data.test_labels));
        });
    }
}, false);

function startTesting(images, labels, trainingTime) {
    console.log('Trainingtime:', trainingTime);
    var total = images.length,
        getTestingData = getRandomSet(images, labels),
        start = Date.now(),
        errors = [];

    for (var i = 0; i < total; i++) {
        var now = Date.now(),
            testData = getTestingData(),
            prediction = nn.predict(testData.inputs.map(scale.bind(null, 255))),
            guess = classify(prediction);

        if (testData.target != guess) {
            errors.push({
                guess: guess,
                target: testData.target,
                inputs: testData.inputs,
            });
        }
        self.postMessage({
            step: 'Testing',
            bytes: testData.inputs,
            time: Date.now() - now,
            progress: (1 + i) * 100 / total,
            result: 'Guess: ' + guess + ' Target: ' + testData.target,
            guess: guess,
            target: testData.target,
            prediction: prediction
        });
    }
    self.postMessage({
        step: 'Done',
        time: Date.now() - start,
        progress: (1 + i) * 100 / total,
        result: 'Error percent ' + (errors.length * 100 / total).toFixed(1) + '%'
    });
}

function startTraining(images, labels) {
    var total = images.length,
        getTrainingData = getRandomSet(images, labels);

    return new Promise(function (resolve) {
        var start = Date.now();
        for (var i = 0; i < total; i++) {
            var now = Date.now(),
                testData = getTrainingData(i);

            nn.train(testData.inputs.map(scale.bind(null, 255)), declasify(testData.target));
            self.postMessage({
                step: 'Training',
                bytes: testData.inputs,
                time: Date.now() - now,
                progress: (1 + i) * 100 / total
            });
        }
        resolve(Date.now() - start);
    })
}

function getRandomSet(typedImages, typedLabels) {
    var images = Array.from(typedImages),
        labels = Array.from(typedLabels);

    return function () {
        var i = Math.floor(Math.random() * images.length),
            inputs = Array.from(images.splice(i, 1)[0]),
            target = labels.splice(i, 1)[0];


        return {
            inputs: inputs,
            target: target
        };
    };
}
function classify(outputs) {
    return outputs.reduce(function (guess, value, i) {
        if (value >= 0.5) {
            if (guess > -1) {
                return -2;
            }
            return i;
        }
        return guess;
    }, -1);
}

function declasify(num) {
    return Array.from({ length: 10 }, function (_, i) { return i == num ? 1 : 0; });
}

function scale(scale, input) {
    return input / scale;
}
