function Neuron() {
    var learningRate = 0.1;

    var weight = Math.random();

    this.predict = function (input) {
        return sigmoid(input * weight);
    };

    this.train = function (input, target) {
        var actual = this.predict(input),
            gradient = (target - actual) * dSigmoid(actual) * (1 - dSigmoid(actual));

        weight += gradient * learningRate;
    };
}
