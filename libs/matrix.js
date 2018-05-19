
'use strict';

var VALUES = Symbol('Matrix values'),
    SHAPE = Symbol('Matrix shape');

function Matrix(values, shape) {
    /*if (!Array.isArray(values) || !Array.isArray(shape)) {
        throw new Error('Arguments should be an array of values, and an array of shape.');
    }*/
    if (shape[0] * shape[1] != values.length) {
        throw new Error('Shape and values do not match.');
    }
    //Object.freeze(this[VALUES] = values.map(Object.freeze));
    //Object.freeze(this[SHAPE] = shape.map(Object.freeze));
    this[VALUES] = values;
    this[SHAPE] = shape;
}

function mapColumns(values, rows, columns) {
    return Array.from({ length: columns }, function (v, c) {
        return Array.from({ length: rows }, function (v, r) {
            return values[r * columns + c];
        });
    })
}

function mapRows(arr, rows, columns) {
    return Array.from({ length: rows }, function (v, i) {
        return arr.slice(i * columns, i * columns + columns);
    });
}

function array(length, defaultValue) {
    return Array.from({ length: length }, function () { return defaultValue; });
}

Matrix.prototype = {
    add: function (m) {
        if (!this.isSameShape(m)) {
            throw new Error('add only accepts argument of same shape Matrix');
        }
        var values = this[VALUES].map(function (value, i) {
            return value + m[VALUES][i];
        });

        return new Matrix(values, this[SHAPE]);
    },

<<<<<<< HEAD
    subtract: function (m) {
        if (!this.isSameShape(m)) {
            throw new Error('add only accepts argument of same shape Matrix');
        }
        var values = this[VALUES].map(function (value, i) {
            return value - m[VALUES][i];
        });

        return new Matrix(values, this[SHAPE]);
    },

=======
>>>>>>> 3ba6d9a81fcc3debe2046744424b0c22212e516d
    get columns() {
        Object.defineProperty(this, 'columns', {
            value: mapColumns(this[VALUES], this[SHAPE][0], this[SHAPE][1]),
            writable: false,
            configurable: false,
            enumerable: true

        });
        return this.columns;
    },

<<<<<<< HEAD
    get rows() {
        Object.defineProperty(this, 'rows', {
            value: mapRows(this[VALUES], this[SHAPE][0], this[SHAPE][1]),
            writable: false,
            configurable: false,
            enumerable: true

        });
        return this.rows;
    },

    isSameShape: function (m) {
        return m[SHAPE][0] == this[SHAPE][0] && m[SHAPE][1] == this[SHAPE][1];
    },

=======
>>>>>>> 3ba6d9a81fcc3debe2046744424b0c22212e516d
    equals: function (m) {
        return this.isSameShape(m) && this[VALUES].every(function (value, i) {
            return m[VALUES][i] === value;
        });
    },

<<<<<<< HEAD
    resize: function (shape, defaultValue) {
        var rows = this.rows, delta;
        defaultValue = defaultValue || 0;
        if (shape[0] < 1 || shape[1] < 1) { // Shape argument is deltas
            if (this[SHAPE][0] + shape[0] < 1 || this[SHAPE][1] + shape[1] < 1) {
                throw new Error('Relative resizing must result in shape minimum [1,1]');
            }
            shape = [this[SHAPE][0] + shape[0], this[SHAPE][1] + shape[1]];
        }

        if (shape[1] < this[SHAPE][1]) {
            rows = rows.map(function (row) { return row.slice(0, shape[1]); });
        }
        else if (shape[1] > this[SHAPE][1]) {
            delta = shape[1] - this[SHAPE][1];
            rows = rows.map(function (row) { return row.concat(array(delta, defaultValue)) });
        }
        if (shape[0] < this[SHAPE][0]) {
            rows = rows.slice(0, shape[0]);
        }
        else if (shape[0] > this[SHAPE][0]) {
            rows = rows.concat(array(shape[0] - this[SHAPE][0], array(shape[1], defaultValue)));
        }

        return new Matrix([].concat.apply([], rows), shape);
    },

    map: function (fn) {
        var m, values;
        if (typeof fn == 'function') {
            values = this[VALUES].map(fn);
=======
    isSameShape: function (m) {
        return m[SHAPE][0] == this[SHAPE][0] && m[SHAPE][1] == this[SHAPE][1];
    },

    map: function (fn) {
        var self = this,
            m, values, r, c;

        if (typeof fn == 'function') {
            r = 0, c = 0;
            values = this[VALUES].map(function (value) {
                var result = fn(value, r, c);
                if (++c == self[SHAPE][1].length) {
                    c = 0;
                    r++;
                }
                return result;
            });
>>>>>>> 3ba6d9a81fcc3debe2046744424b0c22212e516d
        }
        else if (fn instanceof Matrix && typeof arguments[1] == 'function' && this.isSameShape(fn)) {
            m = fn;
            fn = arguments[1];
            values = this[VALUES].map(function (value, i) {
<<<<<<< HEAD
                return fn(value, m[VALUES][i]);
            });
        }
        else {
            throw new Error('map only accepts arguments of type mapping-function.');
=======
                var result = fn(value, m[VALUES][i], r, c);
                if (++c == self[SHAPE][1].length) {
                    c = 0;
                    r++;
                }
                return result;
            });
        }
        else {
            throw new Error('map only accepts arguments of type mapping-function, or ma same-size matrix and a mapping-function.');
>>>>>>> 3ba6d9a81fcc3debe2046744424b0c22212e516d
        }
        return new Matrix(values, this[SHAPE]);
    },

<<<<<<< HEAD
    reduce: function (fn, agg) {
        var i;
        if (typeof fn == 'function') {
            for (var r = 0; r < this[SHAPE][0]; r++) {
                for (var c = 0; c < this[SHAPE][1]; c++) {
                    i = (r * c) + c;
                    agg = fn(agg, this[VALUES][i], i, r, c);
                }
            }
            return agg;
        }
        else {
            throw new Error('reduce only accepts arguments of type mapping-function.');
        }
    },

=======
>>>>>>> 3ba6d9a81fcc3debe2046744424b0c22212e516d
    multiply: function (m) {
        var self = this,
            values,
            rows,
            columns;

        if (m instanceof Matrix) {
            rows = this[SHAPE][0];
            columns = m[SHAPE][1];

            if (m[SHAPE][0] == this[SHAPE][1]) {
                var iterations = this[SHAPE][1],
                    cr = 0,
                    cc = 0;
                values = Array.from({ length: rows * columns }, function (_, i) {
                    var sum = 0;
<<<<<<< HEAD

=======
>>>>>>> 3ba6d9a81fcc3debe2046744424b0c22212e516d
                    for (var j = 0; j < iterations; j++) {
                        sum += self[VALUES][cr * iterations + j] * m[VALUES][j * columns + cc];
                    }
                    if (cc == (columns - 1)) {
                        cc = 0;
                        cr++;
                    }
                    else {
                        cc++;
                    }
<<<<<<< HEAD
                    //                    if(isNaN(sum))debugger;
                    return sum;
                });

                return new Matrix(values, [rows, columns]);
            }
            // Entrywise product (Hadamard)
            if (m[SHAPE][0] == this[SHAPE][0] && m[SHAPE][1] == this[SHAPE][1]) {
=======
                    return sum;
                });
                return new Matrix(values, [rows, columns]);
            }
            // Entrywise product (Hadamard)
            if (this.isSameShape(m)) {
>>>>>>> 3ba6d9a81fcc3debe2046744424b0c22212e516d
                var values = this[VALUES].map(function (value, i) {
                    return value * m[VALUES][i];
                });
                return new Matrix(values, [rows, columns]);
            }
            throw new Error('Multiplication of two matrices demands that either: A and B has same shape (Hadamard product), or A.columns equals B.rows.');
        }
        if (typeof m == 'number') { // Scalar product
            values = this[VALUES].map(function (value, i) {
                return value * m;
            });

            return new Matrix(values, this[SHAPE]);
        }

        throw new Error('Argument for multiply should be a number or a Matrix.');
    },

    print: function () {
<<<<<<< HEAD
        console.log(this[SHAPE][0] + '-by-' + this[SHAPE][1]);
        mapRows(this[VALUES], this[SHAPE][0], this[SHAPE][1]).map(function (row, i) {
            console.log('| ' + row.map(x => x.toString().padStart(5)).join(',') + ' |');
        });
=======
        console.table(this.rows);
    },

    resize: function (shape, defaultValue) {
        var rows = this.rows, delta;
        defaultValue = defaultValue || 0;
        if (shape[0] < 1 || shape[1] < 1) { // Shape argument is deltas
            if (this[SHAPE][0] + shape[0] < 1 || this[SHAPE][1] + shape[1] < 1) {
                throw new Error('Relative resizing must result in shape minimum [1,1]');
            }
            shape = [this[SHAPE][0] + shape[0], this[SHAPE][1] + shape[1]];
        }

        if (shape[1] < this[SHAPE][1]) {
            rows = rows.map(function (row) { return row.slice(0, shape[1]); });
        }
        else if (shape[1] > this[SHAPE][1]) {
            delta = shape[1] - this[SHAPE][1];
            rows = rows.map(function (row) { return row.concat(array(delta, defaultValue)) });
        }
        if (shape[0] < this[SHAPE][0]) {
            rows = rows.slice(0, shape[0]);
        }
        else if (shape[0] > this[SHAPE][0]) {
            rows = rows.concat(array(shape[0] - this[SHAPE][0], array(shape[1], defaultValue)));
        }

        return new Matrix([].concat.apply([], rows), shape);
    },

    get rows() {
        Object.defineProperty(this, 'rows', {
            value: mapRows(this[VALUES], this[SHAPE][0], this[SHAPE][1]),
            writable: false,
            configurable: false,
            enumerable: true

        });
        return this.rows;
    },

    subtract: function (m) {
        if (!this.isSameShape(m)) {
            throw new Error('add only accepts argument of same shape Matrix');
        }
        var values = this[VALUES].map(function (value, i) {
            return value - m[VALUES][i];
        });

        return new Matrix(values, this[SHAPE]);
>>>>>>> 3ba6d9a81fcc3debe2046744424b0c22212e516d
    },

    transpose: function () {
        return new Matrix(this.columns.reduce(function (values, col) { [].push.apply(values, col); return values; }, []), [this[SHAPE][1], this[SHAPE][0]]);
    }
};