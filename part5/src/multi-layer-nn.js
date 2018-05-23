/*
i1 --- o1
  \  /
   \/
   /\
  /  \
b ---- o2
*/
function Layer(inputs, outputs) {
    var weights = new Matrix(randomWeights(outputs * (inputs + 1)), [outputs, (inputs + 1)]);

    Object.defineProperty(this, 'weights', {
        get: function () { return weights; },
        set: function (w) { weights = w; },
    });

    this.feedforward = function (neurons) {
        var neuronsWBias = neurons.concat(1);

        return weights.multiply(neuronsWBias, true).map(sigmoid);
    };
    this.toString = function () {
        return inputs + '-->' + outputs;
    };
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
                    .transpose() // Weights pointing to H(i) is in column i of weights_oh
                    .multiply(gradients[i + 1]) // Sumarize all node gradients, witch directly recieves input from hidden layer (Calculate derivative of E for hidden neurons)
                    .multiply(dH_dHnet);

            }
            return gradients;
        }, [])
            .forEach(function (gradient, i) {
                var delta_weights = gradient.multiply(new Matrix(neurons[i].concat(1), [neurons[i].length + 1, 1]).transpose()).multiply(-1 * learning_rate);
                layers[i].weights = layers[i].weights.add(delta_weights);
            });
    };
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