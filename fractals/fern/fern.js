//
// Barnsley Fern Visualization
// Author: Quinn Booth
//

//#region SKELETON

// HTML elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const back_button = document.getElementById("back_button");
const description = document.getElementById("description");

// Enable re-direct to home page
back_button.addEventListener("click", function() {
    window.location.href = "../../index.html";
});

// Ensure everything fits on screen when resized
window.addEventListener('resize', fit);

// Clear the canvas
function reset_canvas() {
    ctx.fillStyle = "#0E0B16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Make everything fit on screen
function fit() {
    if (window.innerWidth * 0.65 > window.innerHeight * 0.8) {
        canvas.height = Math.floor(window.innerHeight * 0.8 * 0.75);
        canvas.width = canvas.height;
    } else {
        canvas.width = Math.floor(window.innerWidth * 0.65 * 0.75);
        canvas.height = canvas.width;
    }
    canvas.style.left = (window.innerWidth <= 915) ? "40%" : "";
    description.style.height = (window.innerHeight <= 520) ? "120px" : "275px";
    reset_canvas();
}

// Resize everything upon launch and plot initial fractal
fit();

//#endregion


// Coefficients, summands, and probabilities used to generate Barnsley Fern.
// Kept as dictionaries for legibility.

const coeffient = {
    0: [[0, 0], [0, 0.16]],
    1: [[0.85, 0.04], [-0.04, 0.85]],
    2: [[0.2, -0.26], [0.23, 0.22]],
    3: [[-0.15, 0.28], [0.26, 0.24]]
};

const summand = {
    0: [[0], [0]],
    1: [[0], [1.6]],
    2: [[0], [1.6]],
    3: [[0], [0.44]]
}

const probability = {
    0: 0.01,
    1: 0.85,
    2: 0.07,
    3: 0.07
}

// Create a point class so we can easily draw multiple ferns

class Point {
    
    constructor (canvas_x, canvas_y, scale) {
        this.canvas_x = canvas_x;
        this.canvas_y = canvas_y;
        this.scale = scale;
        this._x = 0;
        this._y = 0;
    }

    set x(x) {
        const x_diff = x - this._x;
        this.canvas_x += x_diff * this.scale;
        this._x = x;
    }
    
    get x() {
        return this._x;
    }
    
    set y(y) {
        const y_diff = y - this._y;
        this.canvas_y -= y_diff * this.scale;  // Canvas y-coords are measured from top, let's invert it
        this._y = y;
    }
    
    get y() {
        return this._y;
    }

}

// Write functions to carry out matrix multiplication and addition

function add_matrix(m1, m2) {
    if (m1.length != m2.length || m1[0].length != m2[0].length) {
        throw new Error("Matrices must have same dimensions for addition.");
    }
    let sum = [];
    for (let i = 0; i < m1.length; i++) {
        sum.push([]);
        for (let j = 0; j < m1[0].length; j++) {
            sum[i].push(m1[i][j] + m2[i][j]);
        }
    }
    return sum;
}

function multiply_matrix(m1, m2) {
    if (m1[0].length != m2.length) {
        throw new Error("Matrices must follow a x n * n x b dimension structure for multiplication.")
    }
    let product = [];
    for (let i = 0; i < m1.length; i++) {
        product.push([]);
        for (let j = 0; j < m2[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            product[i].push(sum);
        }
    }
    return product;
}

// Implement a function that executes the Barnsley Fern algorithm and draws on the canvas

function fern(coefficients, summands, probabilities, iterations, x, y, scale, color) {

    ctx.fillStyle = color;

    const buckets = {
        0: probabilities[0],
        1: probabilities[0] + probabilities[1],
        2: probabilities[0] + probabilities[1] + probabilities[2]
    }

    let n = 0;
    let point = new Point(x, y, scale);

    while (n < iterations) {

        const p = Math.random();
        let pick = 0;
        n++;

        for (let i = 0; i < 4; i++) {
            pick = i;
            if (i >= buckets.length || p < buckets[i]) break;
        }

        const product_matrix = multiply_matrix(coefficients[pick], [[point.x], [point.y]]);
        const sum_matrix = add_matrix(product_matrix, summands[pick]);

        point.x = sum_matrix[0][0];
        point.y = sum_matrix[1][0];

        ctx.fillRect(point.canvas_x, point.canvas_y, 1, 1);

    }
}

// Simplified settings for the specific Barnsley Fern

function barnsley(x, y, scale, color, iterations) {
    fern(coeffient, summand, probability, iterations, x, y, scale, color);
}

// Draw nice two-toned Barnsley Fern on boot

reset_canvas();
barnsley(canvas.width * 0.4, canvas.height * 0.9, canvas.height * 0.08, "blue", 10000);
barnsley(canvas.width * 0.4, canvas.height * 0.9, canvas.height * 0.08, "green", 70000);


