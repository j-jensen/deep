
'use strict';

var VALUES = Symbol('Matrix values'),
    SHAPE = Symbol('Matrix shape');

function Matrix(values, shape) {
    if (shape[0] * shape[1] != values.length) {
        throw new Error('Shape and values do not match.');
    }

    this[VALUES] = Float64Array.from(values);
    this[SHAPE] = shape;
}

function matrixMap(values, shape, fn) {
    if (typeof values == 'number') {
        values = new Float64Array(values);
    }
    var r = 0, c = -1;
    return values.map(function (value, i) {
        if (++c >= shape[1]) {
            c = 0, r++;
        }

        return fn(value, r, c, i);
    });
}

function matrixReduce(values, shape, fn, mem) {
    if (typeof values == 'number') {
        values = new Float64Array(values);
    }
    var r = 0, c = -1;
    return values.reduce(function (m, value, i) {
        if (++c >= shape[1]) {
            c = 0, r++;
        }

        return fn(m, value, r, c, i);
    }, mem);
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

    equals: function (m) {
        return this.isSameShape(m) && this[VALUES].every(function (value, i) {
            return m[VALUES][i] === value;
        });
    },

    isSameShape: function (m) {
        return m[SHAPE][0] == this[SHAPE][0] && m[SHAPE][1] == this[SHAPE][1];
    },

    map: function (fn, context) {
        var self = this,
            m, values, r, c;

        if (typeof fn == 'function') {
            values = matrixMap(this[VALUES], self[SHAPE], fn);
        }
        else {
            throw new Error('map only accepts arguments of type mapping-function.');
        }
        return new Matrix(values, this[SHAPE]);
    },

    multiply: function (m, returnAsValues) {
        var self = this,
            values,
            cRows,
            cColumns;

        if (m instanceof Matrix) {
            cRows = this[SHAPE][0];
            cColumns = m[SHAPE][1];

            if (m[SHAPE][0] == this[SHAPE][1]) {

                values = matrixMap(cRows * cColumns, [cRows, cColumns], function (_, r, c) {
                    var aCols = self[SHAPE][1];

                    return self[VALUES].slice(r * aCols, r * aCols + aCols)
                        .reduce(function (sum, aValue, i) {
                            return sum += aValue * m[VALUES][i * cColumns + c];
                        }, 0);
                })

                return returnAsValues ? values : new Matrix(values, [cRows, cColumns]);
            }
            // Entrywise product (Hadamard)
            if (this.isSameShape(m)) {
                var values = this[VALUES].map(function (value, i) {
                    return value * m[VALUES][i];
                });
                return returnAsValues ? values : new Matrix(values, this[SHAPE]);
            }
            throw new Error('Multiplication of two matrices demands that either: A and B has same shape (Hadamard product), or A.columns equals B.rows (matrix product).');
        }
        if (m instanceof Float64Array || Array.isArray(m)) { // Handle array as a 'm.length by 1' matrix. Resulting in 'this[SHAPE][0] by 1' matrix
            if (Array.isArray(m)) {
                m = Float64Array.from(m);
            }
            if (m.length == this[SHAPE][1]) {
                values = Float64Array.from({ length: this[SHAPE][0] }, function (_, r) {
                    return m.reduce(function (sum, bValue, c) {
                        return sum += bValue * self[VALUES][r * self[SHAPE][1] + c];
                    }, 0);
                });

                return returnAsValues ? values : new Matrix(values, [this[SHAPE][0], 1]);
            }
            else if (m.length == this[SHAPE][0] && this[SHAPE][1] == 1) {// Hadamar product
                values = m.map(function (v, i) { return v * self[VALUES][i]; });
                return returnAsValues ? values : new Matrix(values, this[SHAPE]);
            }
            else {
                throw new Error('Argument array length should match, this.columns.length.');
            }
        }
        if (typeof m == 'number') { // Scalar product
            values = this[VALUES].map(function (value, i) {
                return value * m;
            });

            return returnAsValues ? values : new Matrix(values, this[SHAPE]);
        }

        throw new Error('Argument for multiply should be a number or a Matrix.');
    },

    print: function () {
        var self = this;
        console.table(matrixReduce(this[VALUES], this[SHAPE], function (rows, v, r, c) {
            rows[r][c] = v;
            return rows;
        }, Array.from({ length: this[SHAPE][0] }, function () { return Array.from({ length: self[SHAPE][1] }); })));
    },

    resize: function (shape, defaultValue) {
        var self = this, values;

        if (shape[0] < 1 || shape[1] < 1) { // Shape argument is deltas
            if (this[SHAPE][0] + shape[0] < 1 || this[SHAPE][1] + shape[1] < 1) {
                throw new Error('Relative resizing must result in shape minimum [1,1]');
            }
            shape = [this[SHAPE][0] + shape[0], this[SHAPE][1] + shape[1]];
        }

        values = matrixReduce(this[VALUES], this[SHAPE], function (values, value, r, c, i) {
            if (r < shape[0] && c < shape[1]) {
                values.set([value], r * shape[1] + c);
            }
            return values;
        }, Float64Array.from({ length: shape[0] * shape[1] }, function () { return defaultValue || 0 }));

        return new Matrix(values, shape);
    },

    subtract: function (m) {
        if (!this.isSameShape(m)) {
            throw new Error('add only accepts argument of same shape Matrix');
        }
        var values = this[VALUES].map(function (value, i) {
            return value - m[VALUES][i];
        });

        return new Matrix(values, this[SHAPE]);
    },

    transpose: function () {
        var self = this,
            shape = [this[SHAPE][1], this[SHAPE][0]];

        var values = matrixMap(shape[0] * shape[1], shape, function (value, r, c) {
            return self[VALUES][c * shape[0] + r];
        })

        return new Matrix(values, shape);
    }
};