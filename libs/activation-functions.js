function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function dSigmoid(x) {
    return sigmoid(x) * (1 - sigmoid(x));
}