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
const color_picker = document.getElementById('color_picker');

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

// Allow user to pick a color for their fractals
color_picker.addEventListener('change', function(event) {
    user_color = event.target.value;
});

// Let user plot ferns by clicking on canvas
canvas.addEventListener('click', function(event) {
    const canvas_bounds = canvas.getBoundingClientRect();
    const canvas_x = event.clientX - canvas_bounds.left;
    const canvas_y = event.clientY - canvas_bounds.top;
    //barnsley(event.clientX - canvas_bounds.left, event.clientY - canvas_bounds.top, canvas.height * 0.08, user_color, 10000, 0.1);
    fern(user_coefficient, user_summand, user_probability, iterations, canvas_x, canvas_y, user_scale, user_color, user_speed);
});

// Resize everything upon launch and plot initial fractal
fit();

//#endregion

// Coefficients, summands, and probabilities used to generate Barnsley Fern and other variants.
// Kept as dictionaries for legibility.

const barnsley_coefficient = {
    0: [[0, 0], [0, 0.16]],
    1: [[0.85, 0.04], [-0.04, 0.85]],
    2: [[0.2, -0.26], [0.23, 0.22]],
    3: [[-0.15, 0.28], [0.26, 0.24]]
};

const cyclosorus_coefficient = {
    0: [[0, 0], [0, 0.25]],
    1: [[0.95, 0.005], [-0.005, 0.93]],
    2: [[0.035, -0.2], [0.16, 0.04]],
    3: [[-0.04, 0.2], [0.16, 0.04]]
};

const tree_coefficient = {
    0: [[0, 0], [0, 0.5]],
    1: [[0.42, -0.42], [0.42, 0.42]],
    2: [[0.42, 0.42], [-0.42, 0.42]],
    3: [[0.1, 0], [0, 0.1]]
};

const barnsley_summand = {
    0: [[0], [0]],
    1: [[0], [1.6]],
    2: [[0], [1.6]],
    3: [[0], [0.44]]
};

const cyclosorus_summand = {
    0: [[0], [-0.4]],
    1: [[-0.002], [0.5]],
    2: [[-0.09], [0.02]],
    3: [[0.083], [0.12]]
};

const tree_summand = {
    0: [[0], [0]],
    1: [[0], [0.2]],
    2: [[0], [0.2]],
    3: [[0], [0.2]]
};

const barnsley_probability = {
    0: 0.01,
    1: 0.85,
    2: 0.07,
    3: 0.07
};

const cyclosorus_probability = {
    0: 0.02,
    1: 0.84,
    2: 0.07,
    3: 0.07
};

const tree_probability = {
    0: 0.05,
    1: 0.4,
    2: 0.4,
    3: 0.15
};


// User variables
const iterations = 50000;  // 50000 is a good sweet spot
var user_coefficient = Object.assign({}, barnsley_coefficient);
var user_summand = Object.assign({}, barnsley_summand);
var user_probability = Object.assign({}, barnsley_probability);
var user_scale = canvas.height * 0.08;
var user_speed = 0.1;
var user_color = "green";

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

function fern(coefficients, summands, probabilities, iterations, x, y, scale, color, delay) {

    const buckets = {
        0: probabilities[0],
        1: probabilities[0] + probabilities[1],
        2: probabilities[0] + probabilities[1] + probabilities[2]
    }

    let point = new Point(x, y, scale);

    for (let n = 0; n < iterations; n++) {

        (function (n) {

            setTimeout(function() {

                ctx.fillStyle = color;
                const p = Math.random();
                let pick = 0;

                for (let i = 0; i < 4; i++) {
                    pick = i;
                    if (i >= buckets.length || p < buckets[i]) break;
                }

                const product_matrix = multiply_matrix(coefficients[pick], [[point.x], [point.y]]);
                const sum_matrix = add_matrix(product_matrix, summands[pick]);

                point.x = sum_matrix[0][0];
                point.y = sum_matrix[1][0];

                ctx.fillRect(point.canvas_x, point.canvas_y, 1, 1);

            }, delay * n);

        })(n);

    }
}

// Simplified settings for the specific Barnsley Fern variations

function barnsley(x, y, scale, color, iterations, delay) {
    fern(barnsley_coefficient, barnsley_summand, barnsley_probability, iterations, x, y, scale, color, delay);
}

function cyclosorus(x, y, scale, color, iterations, delay) {
    fern(cyclosorus_coefficient, cyclosorus_summand, cyclosorus_probability, iterations, x, y, scale, color, delay);
}

function tree(x, y, scale, color, iterations, delay) {
    fern(tree_coefficient, tree_summand, tree_probability, iterations, x, y, scale, color, delay);
}

function select_barnsley() {
    user_coefficient = Object.assign({}, barnsley_coefficient);
    user_summand = Object.assign({}, barnsley_summand);
    user_probability = Object.assign({}, barnsley_probability);
}

function select_cyclosorus() {
    user_coefficient = Object.assign({}, cyclosorus_coefficient);
    user_summand = Object.assign({}, cyclosorus_summand);
    user_probability = Object.assign({}, cyclosorus_probability);
}

function select_tree() {
    user_coefficient = Object.assign({}, tree_coefficient);
    user_summand = Object.assign({}, tree_summand);
    user_probability = Object.assign({}, tree_probability);
}

// Draw nice two-toned Barnsley Fern on boot

reset_canvas();
barnsley(canvas.width * 0.4, canvas.height * 0.9, canvas.height * 0.08, "blue", 10000, 0.1);
barnsley(canvas.width * 0.4, canvas.height * 0.9, canvas.height * 0.08, "green", 70000, 0.1);



