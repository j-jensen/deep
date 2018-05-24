function Layer(inputs, outputs) {
    var weights = new Matrix(randomWeights(outputs * (inputs + 1)), [outputs, (inputs + 1)]);

    Object.defineProperty(this, 'weights', {
        value: weights,
        writable: false
    });

    this.feedforward = function (neurons) {
        var neuronsWBias = addBias(neurons);

        return weights.multiply(neuronsWBias, true).map(sigmoid);
    };

    this.adjustWeights = function (delta) {
        weights = weights.add(delta);
    };
}

function addBias(typedArray) {
    var typedArrayWithBias = new Float64Array(typedArray.length + 1);
    typedArrayWithBias.set(typedArray, 0);
    typedArrayWithBias.set([1], typedArray.length);
    return typedArrayWithBias;
}

function MultiLayerNetwork(noInput, hidden, noOutput, learningRate) {
    hidden = [].concat(hidden);
    var layers = hidden.length ? hidden.reduce(function (acc, no, i) {
        if (i == 0) {
            acc.push(new Layer(noInput, no));
        }

        if (i == hidden.length - 1) {
            acc.push(new Layer(no, noOutput));
        }
        else {
            acc.push(new Layer(no, hidden[i + 1]));
        }
        return acc;
    }, []) : [new Layer(noInput, noOutput)];

    var learning_rate = learningRate || .1;

    this.predict = function (inputs_arr, returnIntermediates) {
        if (inputs_arr.length != noInput) {
            throw new Error('feedforward argument should match constructed number of inputs.');
        }

        var neurons = layers.reduce(function (mem, layer) {
            mem.push(layer.feedforward(mem[mem.length - 1]));
            return mem;
        }, [inputs_arr]);

        return !returnIntermediates
            ? neurons[neurons.length - 1]
            : neurons;
    };

    this.train = function (inputs_array, targets_array) {
        var targets = targets_array,
            neurons = this.predict(inputs_array, true);

        layers.reduceRight(function (gradients, layer, i) {
            if (i == layers.length - 1) {
                // ** Output layer **
                var dE_dO = new Matrix(neurons[i + 1].map(function (output, i) { return output - targets[i]; }), [neurons[i + 1].length, 1]);
                var dO_dOnet = neurons[i + 1].map(derivativeOfOutputWRTInput);
                gradients[i] = dE_dO.multiply(dO_dOnet);
            }
            else {
                // ** Internal layer **
                var dH_dHnet = neurons[i + 1].map(derivativeOfOutputWRTInput);

                // Backprobagation
                gradients[i] = layers[i + 1].weights
                    .resize([0, -1])// We don't need column with bias weights
                    .transpose() // Weights pointing to H(i) is in column i of weights fro next layer
                    .multiply(gradients[i + 1]) // Sumarize all node gradients, witch directly recieves input from this layer (Calculate derivative of layer neurons)
                    .multiply(dH_dHnet);

            }
            return gradients;
        }, [])
            .forEach(function (gradient, i) {
                var delta_weights = gradient.multiply(new Matrix(addBias(neurons[i]), [neurons[i].length + 1, 1]).transpose()).multiply(-1 * learning_rate);
                layers[i].adjustWeights(delta_weights);
            });
    };
}

function randomWeights(n) {
    return Float64Array.from({ length: n }, randomWeight);
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