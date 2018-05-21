
function MultiLayerNetwork(noInput, noHidden, noOutput, learningRate) {

    var weights_hi = new Matrix(randomWeights(noHidden * (noInput + 1)), [noHidden, noInput + 1]);
    var weights_oh = new Matrix(randomWeights(noOutput * (noHidden + 1)), [noOutput, noHidden + 1]);

    var learning_rate = learningRate || .1;

    this.predict = function (inputs_arr, returnIntermediates) {
        if (inputs_arr.length != noInput) {
            throw new Error('feedforward argument should match constructed number of inputs.');
        }
        var I = new Matrix(inputs_arr.concat(1), [inputs_arr.length + 1, 1]), // Adding bias to inputs
            H = weights_hi.multiply(I).map(sigmoid).resize([1, 0], 1), // Adding bias to hidden layer output
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

        // ** Output layer **
        var dE_dO = prediction.O.subtract(targets);
        var dO_dOnet = prediction.O.map(derivativeOfOutputWRTInput);
        var gradients_OH = dE_dO.multiply(dO_dOnet);

        var delta_weights_oh = gradients_OH.multiply(prediction.H.transpose())
            .multiply(-1 * learning_rate);

        var delta_weights_hi = (function probagate(neurons, outgoingWeights, gradientsFromNextLayer, inputNeurons) {
            var dH_dHnet = neurons.resize([-1, 0]).map(derivativeOfOutputWRTInput); // Bias do not change, so it doesn't count
            // Backprobagation
            var gradients_HI = outgoingWeights.resize([0, -1])// We don't need column with bias weights
                .transpose() // Weights pointing to H(i) is in column i of weights_oh
                .multiply(gradientsFromNextLayer) // Sumarize all node gradients, witch directly recieves input from hidden layer (Calculate derivative of E for hidden neurons)
                .multiply(dH_dHnet);

            return gradients_HI.multiply(inputNeurons.transpose())
                .multiply(-1 * learning_rate);

        })(prediction.H, weights_oh, gradients_OH, prediction.I);

        // ** Update weights **
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

function derivativeOfOutputWRTInput(output) {
    return output * (1 - output);
}