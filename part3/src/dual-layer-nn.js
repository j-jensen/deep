function DualLayerNetwork(noInput, noHidden, noOutput, learningRate) {
    var weights_hi = new Matrix(randomWeights(noHidden * (noInput + 1)), [noHidden, noInput + 1]);
    var weights_oh = new Matrix(randomWeights(noOutput * (noHidden + 1)), [noOutput, noHidden + 1]);
    var learning_rate = learningRate || .01;

    this.predict = function (inputs_arr, returnIntermediates) {
        if (inputs_arr.length != noInput) {
            throw new Error('feedforward argument should match constructed number of inputs.');
        }
        var I = new Matrix(inputs_arr.concat(1), [inputs_arr.length + 1, 1]), // Adding bias to inputs
            H = weights_hi.multiply(I).map(sigmoid).resize([1, 0], 1), // Adding bias to hidden layer
            O = weights_oh.multiply(H).map(sigmoid);

        return !returnIntermediates
            ? O[VALUES]
            : {
                I: I,
                O: O,
                H: H
            };
    };

    this.train = function (inputs_array, targets_array) {
        var targets = new Matrix(targets_array, [noOutput, 1]),
            prediction = this.predict(inputs_array, true);

        // Output layer
        var dE_dO = prediction.O.subtract(targets);
        var dO_dOnet = prediction.O.map(function (o) { return o * (1 - o); });
        var gradients_OH = dE_dO.multiply(dO_dOnet);

        var delta_weights_oh = gradients_OH.multiply(prediction.H.transpose())
            .multiply(-1 * learning_rate);

        // Hidden layer
        var dH_dHnet = prediction.H.resize([-1, 0]).map(function (h) { return h * (1 - h); }); // Bias do not change, so it doesent count
        // Backprobagation
        var gradients_HI = weights_oh.resize([0, -1]).transpose() // We don't need column with bias weights
            .multiply(gradients_OH) // Sumarize all node gardients, witch directly recieves input from hidden layer
            .multiply(dH_dHnet);

        var delta_weights_hi = gradients_HI.multiply(prediction.I.transpose())
            .multiply(-1 * learning_rate);

        // Update weights
        weights_oh = weights_oh.add(delta_weights_oh);
        weights_hi = weights_hi.add(delta_weights_hi);

    };

    this.toJS = function () {
        return {
            wih: weights_hi[VALUES],
            who: weights_oh[VALUES]
        };
    };
    this.initFromJS = function (obj) {
        weights_hi = new Matrix(obj.wih, [noHidden, noInput + 1]);
        weights_oh = new Matrix(obj.who, [noOutput, noHidden + 1])
    }
}

function randomWeights(n) {
    return Array.from({ length: n }, randomWeight);
}

function randomWeight() {
    return (Math.random() - 0.5) * 2;
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function dSigmoid(y) {
    return sigmoid(y) * (1 - sigmoid(y));
}