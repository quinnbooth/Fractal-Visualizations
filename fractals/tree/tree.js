//
// L-System Tree Visualization
// Author: Quinn Booth
//

// Pre-defined rules and alphabet for L-System Tree
// NOTE: +, -, [, and ] are reserved for specific operations listed below

// Fractal Tree
const tree_axiom = "F";
const tree_rules = {
    "F": "FF+[+F-F-F]-[-F+F+F]",
};

// Sierpinski Triangle
const sierpinski_axiom = "F-G-G";
const sierpinski_rules = {
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

    let axiom = tree_axiom;
    let rules = tree_rules;

    if (type == "triangle") {
        axiom = sierpinski_axiom;
        rules = sierpinski_rules;
    } else if (type == "dragon") {
        axiom = dragon_axiom;
        rules = dragon_rules;
    }

    const string = l_system(axiom, rules, steps);

    let saved_positions = [];
    let angle = -Math.PI / 2;
    let length = canvas.height / 65;

    let x = canvas.width / 2;
    let y = canvas.height - 25;

    ctx.strokeStyle = 'lime';

    // Judge how big the drawing should be based on its complexity and type
    if (steps == 5) {
        length = length / 2;
        ctx.lineWidth = 0.25;
    } else if (steps >= 6) {
        length = length / 4;
        ctx.lineWidth = 0.25;
    } else {
        ctx.lineWidth = 2;
    }

    // Center drawing
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

        // [ means save position
        } else if (symbol == "[") {

            saved_positions.push([x, y, angle]);

        // ] means return to last saved position
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

// Determine sizing of drawing based on steps and type
function get_size(type, steps) {

}

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

// Draw initial L-System Tree
// draw_system(axiom, rules, 5, -0.45);  // For Fractal Tree

//const degrees = 120;
//const radians = degrees * Math.PI / 180;
//draw_system(axiom, rules, 7, radians);  // For Sierpinski Triangle

const degrees = 90;
const radians = degrees * Math.PI / 180;
draw_system("tree", 5, -0.45);
