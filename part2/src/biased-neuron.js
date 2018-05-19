function BiasedNeuron() {
    var lr = 0.2;

    var w = Math.random(),
        bias = Math.random();

    this.predict = function (input) {
        var out = sigmoid(w * input + bias * 1);
        return out;
    };

    this.train = function (input, target) {
        var actual = this.predict(input);
        // Calculate gradient wrt w
        var gradient_w = (target - actual) * (actual * (1 - actual)) * input;

        // Calculate gradient wrt bias
        var gradient_bias = (target - actual) * (actual * (1 - actual))

        // Adjust the weights
        w += gradient_w * lr;
        bias += gradient_bias * lr;
    };
}