var mnistWorker = new Worker('mnist-worker.js');

var drawImage = setuprendering();
var out = document.getElementById('out');

mnistWorker.addEventListener('message', function (e) {
    var text = [
        'Step: ', e.data.step, '\n',
        'Time: ', e.data.time, 'ms\n', 
        'Complete: ', e.data.progress.toFixed(1), ' %\n',

    ].join('');
    if(e.data.result){
        text = [text, 'Result: ', e.data.result, '\n'].join('');
    }
    out.textContent = text;
    e.data.bytes && drawImage(e.data.bytes);
}, false);

mnistWorker.postMessage('START');

function setuprendering() {
    var res = 4, w = 28 * res, h = 28 * res;

    var out = document.getElementById('out');
    var canvas = document.getElementById('canvas');
    canvas.width = w;
    canvas.height = h;
    var context = canvas.getContext('2d');

    return function drawImage(bytes) {
        var imageData = context.getImageData(0, 0, 28, 28);

        for (var i = 0; i < bytes.length; i++) {
            var tone = 255 - bytes[i];
            imageData.data[i * 4] = tone;
            imageData.data[i * 4 + 1] = tone;
            imageData.data[i * 4 + 2] = tone;
            imageData.data[i * 4 + 3] = 255;
        }
        context.putImageData(imageData, 0, 0);
    }
}