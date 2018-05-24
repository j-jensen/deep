var nn = new MultiLayerNetwork(2, 2, 2, 0.4);

var w = 200, h = 200, res = 4;
var out = document.getElementById('out');
var canvas = document.getElementById('canvas');
canvas.width = w;
canvas.height = h;
var context = canvas.getContext('2d');
var td = [
    { inputs: [0, 0], target: [0, 1] },
    { inputs: [0, 1], target: [1, 0] },
    { inputs: [1, 0], target: [1, 0] },
    { inputs: [1, 1], target: [0, 1] }
];

var cols = w / res,
    rows = h / res,
    last = Array.from({ length: cols }, function () { return Array.from({ length: rows }, function () { return 0; }) });
animate();
var time;

function animate(stamp) {
    var rate = Math.round((stamp - time));
    time = stamp;
    requestAnimationFrame(animate);
    for (var i = 0; i < 1000; i++) {
        var data = td[Math.round(Math.random() * 3)];
        nn.train(data.inputs, data.target);
    }
    update(rate);
}

function update(rate) {
    context.strokeStyle = 'black'
    out.innerText = [(1000 * 1000 / rate).toFixed(0).padStart(7), 'trainings/sec'].join(' ');
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < cols; j++) {
            var inputs = [i / cols, j / rows];
            var r = nn.predict(inputs)[0];
            var tone = Math.floor(r * 255);
            context.fillStyle = 'rgb(' + tone + ',' + tone + ',' + tone + ')';
            context.fillRect(i * res, j * res, res, res);
            if (tone != last[i][j]) {
                context.fillStyle = 'rgb(' + tone + ',' + tone + ',20)';
                context.fillRect(i * res, j * res, res, res);
            }
            last[i][j] = tone;
        }
    }
}