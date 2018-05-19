
var neuron = new BiasedNeuron();
var test_data = Array.from({ length: 1000 }, function () {
    var rdm = Math.random();
    return { input: rdm, target: rdm >= 0 ? 0 : 1 }
});
// Training
for (var i = 0; i < 50; i++) {
    var data = test_data[Math.floor(Math.random() * test_data.length)];
    neuron.train(data.input, data.target);
}

var n = test_data.length,
    success = 0;

// Testing
for (var i = 0; i < 10; i++) {
    var data = i == 0 ? { input: 0, target: 1 } : test_data[Math.floor(Math.random() * test_data.length)];
    var prediction = neuron.predict(data.input) >= .5;
    success += (prediction == data.target) ? 1 : 0;
}

console.log('Success rate: ' + Math.floor(success / 10 * 100) + '%');

