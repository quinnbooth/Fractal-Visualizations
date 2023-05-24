//
// Barnsley Fern Visualization
// Author: Quinn Booth
//

// HTML elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const back_button = document.getElementById("back_button");
const description = document.getElementById("description");
const color_picker = document.getElementById('color_picker');
const matrix_cells = document.getElementsByClassName("matrix_cell");
const slider = document.getElementById("slider");

// Enable re-direct to home page
back_button.addEventListener("click", function() {
    window.location.href = "../../index.html";
});

// Ensure everything fits on screen when resized
window.addEventListener('resize', function() {
    drawing_no++;
    fit();
});

// Clear the canvas
function reset_canvas() {
    ctx.fillStyle = "#0E0B16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// User initiated clear
function user_clear() {
    drawing_no++;
    ctx.fillStyle = "#0E0B16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Make everything fit on screen
function fit() {
    if (window.innerWidth * 0.65 > window.innerHeight * 0.75) {
        canvas.height = Math.floor(window.innerHeight * 0.75 * 0.75);
        canvas.width = canvas.height;
    } else {
        canvas.width = Math.floor(window.innerWidth * 0.65 * 0.75);
        canvas.height = canvas.width;
    }
    canvas.style.left = (window.innerWidth <= 915) ? "40%" : "";
    description.style.height = (window.innerHeight <= 700) ? "120px" : "350px";
    user_scale = canvas.height * parseInt(slider.value) / 50;
    reset_canvas();
}

// Allow user to pick a color for their fractals
color_picker.addEventListener('change', function(event) {
    user_color = event.target.value;
});

// Allow user to pick a scale for their fractals
slider.addEventListener("input", function() {
    user_scale = canvas.height * parseInt(slider.value) / 50;
});


// Let user plot ferns by clicking on canvas
canvas.addEventListener('click', function(event) {
    const canvas_bounds = canvas.getBoundingClientRect();
    const canvas_x = event.clientX - canvas_bounds.left;
    const canvas_y = event.clientY - canvas_bounds.top;
    let adjusted_scale = user_scale;
    if (user_preset == "cyclosorus") {
        adjusted_scale = adjusted_scale * 1.5;
    } else if (user_preset == "tree") {
        adjusted_scale = adjusted_scale * 20;
    }
    fern(user_coefficient, user_summand, user_probability, iterations, canvas_x, canvas_y, adjusted_scale, user_color, 0.2);
});

// Match the fields in our onscreen matrix to our user values
function match_matrix() {

    for (let i = 0; i < 4; i++) {
        matrix_cells[i*7].value = user_coefficient[i][0][0];
        matrix_cells[i*7 + 1].value = user_coefficient[i][0][1];
        matrix_cells[i*7 + 2].value = user_coefficient[i][1][0];
        matrix_cells[i*7 + 3].value = user_coefficient[i][1][1];
        matrix_cells[i*7 + 4].value = user_summand[i][0][0];
        matrix_cells[i*7 + 5].value = user_summand[i][1][0];
        matrix_cells[i*7 + 6].value = user_probability[i];
    }

}

// Match user values to those in onscreen matrix
function match_vals() {

    for (let i = 0; i < 4; i++) {
        user_coefficient[i][0][0] = parseFloat(matrix_cells[i*7].value);
        user_coefficient[i][0][1] = parseFloat(matrix_cells[i*7 + 1].value);
        user_coefficient[i][1][0] = parseFloat(matrix_cells[i*7 + 2].value);
        user_coefficient[i][1][1] = parseFloat(matrix_cells[i*7 + 3].value);
        user_summand[i][0][0] = parseFloat(matrix_cells[i*7 + 4].value);
        user_summand[i][1][0] = parseFloat(matrix_cells[i*7 + 5].value);
        user_probability[i] = parseFloat(matrix_cells[i*7 + 6].value);
    }

}

// Have it so changing any value in the onscreen matrix triggers the above function
for (let i = 0; i < matrix_cells.length; i++) {
    matrix_cells[i].addEventListener('input', function() {
        match_vals();
    });
}

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
var user_coefficient = custom_copy(barnsley_coefficient);
var user_summand = custom_copy(barnsley_summand);
var user_probability = Object.assign({}, barnsley_probability);
var user_scale = 0;
var user_preset = "barnsley";
var user_color = "green";
var drawing_no = 0;

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

// Function for copying coefficient/summand structure

function custom_copy(d) {
    let dict = {};
    for (let i in d) {
        dict[i] = [];
        for (let j = 0; j < d[i].length; j++) {
            dict[i].push([]);
            for (let k = 0; k < d[i][j].length; k++) {
                dict[i][j].push(d[i][j][k]);
            }
        }
    }
    return dict;
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

        (function (num, n) {

            setTimeout(function() {

                if (num != drawing_no) return;

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

        })(drawing_no, n);

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

// Functions to facilitate user selecting presets in drop down menu

function select_barnsley() {
    user_coefficient = custom_copy(barnsley_coefficient);
    user_summand = custom_copy(barnsley_summand);
    user_probability = Object.assign({}, barnsley_probability);
    user_preset = "barnsley";
    match_matrix();
}

function select_cyclosorus() {
    user_coefficient = custom_copy(cyclosorus_coefficient);
    user_summand = custom_copy(cyclosorus_summand);
    user_probability = Object.assign({}, cyclosorus_probability);
    user_preset = "cyclosorus";
    match_matrix();
}

function select_tree() {
    user_coefficient = custom_copy(tree_coefficient);
    user_summand = custom_copy(tree_summand);
    user_probability = Object.assign({}, tree_probability);
    user_preset = "tree";
    match_matrix();
}

// Draw nice two-toned Barnsley Fern on boot

fit();
reset_canvas();
match_matrix();
user_scale = canvas.height * parseInt(slider.value) / 50;
barnsley(canvas.width * 0.4, canvas.height * 0.9, canvas.height * 0.08, "blue", 10000, 0.1);
barnsley(canvas.width * 0.4, canvas.height * 0.9, canvas.height * 0.08, "green", 70000, 0.1);



