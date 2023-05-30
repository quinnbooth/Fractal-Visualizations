//
// L-System Tree Visualization
// Author: Quinn Booth
//

var preset = "tree";
var complexity = 5;
var angle_step = -0.45;
var color = "lime";

// Pre-defined rules and alphabet for L-System Tree
// NOTE: +, -, [, and ] are reserved for specific operations listed below

// Fractal Tree
const tree_axiom = "F";
const tree_rules = {
    "F": "FF+[+F-F-F]-[-F+F+F]",
};

// Sierpinski Triangle
const triangle_axiom = "F-G-G";
const triangle_rules = {
    "F": "F-G+F+G-F",
    "G": "GG"
};

// Dragon Curve
const dragon_axiom = "F";
const dragon_rules = {
    "F": "F+G",
    "G": "F-G"
};

// Plot an L-System with given specifications
function draw_system(type, steps, angle_step) {

    let saved_positions = [];
    let angle = -Math.PI / 2;

    // Get preset's axiom and rules
    const [axiom, rules] = get_preset(type);

    // Judge how big the drawing should be based on its complexity and type
    const [orig_x, orig_y, length, width] = get_specs(type, steps);
    let x = orig_x;
    let y = orig_y;
    ctx.lineWidth = width;
    ctx.strokeStyle = color;

    console.log(orig_x, orig_y, length, width);

    // Perform the L-System iterative algorithm
    const string = l_system(axiom, rules, steps);

    // Clear canvas and center drawing
    reset_canvas();
    ctx.moveTo(x, y);

    // Go symbol by symbol to determine what to draw and where
    for (let i = 0; i < string.length; i++) {

        const symbol = string[i];
        
        // + means rotate clockwise
        if (symbol == "+") {

            angle += angle_step;

        // - means rotate counterclockwise
        } else if (symbol == "-") {

            angle -= angle_step;

        // [ means save position (push onto stack)
        } else if (symbol == "[") {

            saved_positions.push([x, y, angle]);

        // ] means return to last saved position (pop off of stack)
        } else if (symbol == "]") {

            const return_to = saved_positions.pop();
            x = return_to[0];
            y = return_to[1];
            angle = return_to[2];

        // Otherwise, draw a line in the direction of the current angle
        } else {
            const new_x = x + length * Math.cos(angle);
            const new_y = y + length * Math.sin(angle);
            ctx.beginPath();
            ctx.moveTo(x, y)
            ctx.lineTo(new_x, new_y);
            ctx.stroke();
            x = new_x;
            y = new_y;
        }

    }

}

// Iteratively goes through string, replacing characters based on rules
function l_system(axiom, rules, steps) {

    let string = axiom;

    for (let i = 0; i < steps; i++) {
        string = step(string, rules);
    }

    return string;

}

// Go through string and replace characters based on rules (once)
function step(string, rules) {

    let next_string = "";

    for (let i = 0; i < string.length; i++) {
        const key = string[i];
        if (key in rules) {
            next_string += rules[key];
        } else {
            next_string += string[i];
        }
    }

    return next_string;
}

// Get proper axiom and rules based on preset
function get_preset(type) {
    if (type == "tree") {
        return [tree_axiom, tree_rules];
    } else if (type == "triangle") {
        return [triangle_axiom, triangle_rules];
    } else {
        return [dragon_axiom, dragon_rules];
    }
}

// Determine sizing of drawing based on steps and type
function get_specs(type, steps) {

    let length = 0;
    let width = 1;
    let x = canvas.width / 2;
    let y = 0

    if (type == "tree") {
        length = canvas.height / 65;
        y = canvas.height - 25;
    } else if (type == "triangle") {
        length = canvas.height / 30;
        y = canvas.height - 25;
    } else {
        width = width * 3;
        length = canvas.height / (3 * steps);
        y = 120;
    }

    if (steps < 5) {
        width = width * 2;
    } else if (steps == 5) {
        length = length / 2;
        width = width * 0.5;
    } else {
        length = length / 4;
        width = width * 0.25;
    }

    return [x, y, length, width];

}

// HTML elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const back_button = document.getElementById("back_button");
const description = document.getElementById("description");
const color_picker = document.getElementById("color_picker");
const complexity_slider = document.getElementById("complexity_slider");
const complexity_value = document.getElementById("complexity_value");
const angle_slider = document.getElementById("angle_slider");
const angle_value = document.getElementById("angle_value");

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

// Allow user to pick a color for the fractals
color_picker.addEventListener('change', function(event) {
    color = event.target.value;
    draw_system(preset, complexity, angle_step);
});

// Generate L-System based on slider inputs, maintain labels
complexity_slider.addEventListener('input', function() {
    complexity_value.textContent = complexity_slider.value;
    complexity = parseInt(complexity_slider.value);
    draw_system(preset, complexity, angle_step);
});

angle_slider.addEventListener('input', function() {
    angle_value.textContent = angle_slider.value + "°";
    angle_step = parseInt(angle_slider.value) * Math.PI / 180;
    draw_system(preset, complexity, angle_step);
});

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

// Selecting user preset
function select_tree() {
    preset = "tree";
    complexity = 5;
    angle_step = -25 * Math.PI / 180;
    complexity_slider.max = 5;
    complexity_slider.value = 5;
    complexity_value.textContent = complexity_slider.value;
    angle_slider.value = -25;
    angle_value.textContent = String(-25) + "°";
    draw_system(preset, complexity, angle_step);
}

function select_triangle() {
    preset = "triangle";
    complexity = 5;
    angle_step = 120 * Math.PI / 180;
    complexity_slider.max = 5;
    complexity_slider.value = 5;
    complexity_value.textContent = complexity_slider.value;
    angle_slider.value = 120;
    angle_value.textContent = String(120) + "°";
    draw_system(preset, complexity, angle_step);
}

function select_dragon() {
    preset = "dragon";
    complexity = 12;
    angle_step = 90 * Math.PI / 180;
    complexity_slider.max = 13;
    complexity_slider.value = 12;
    complexity_value.textContent = complexity_slider.value;
    angle_slider.value = 90;
    angle_value.textContent = String(90) + "°";
    draw_system(preset, complexity, angle_step);
}

// Draw opening L-System
draw_system(preset, complexity, angle_step);
