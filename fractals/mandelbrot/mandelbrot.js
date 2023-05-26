//
// Mandelbrot Set Visualization
// Author: Quinn Booth
//

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

function map(input, input_min, input_max, output_min, output_max) {

    const normalized_input = (input - input_min) / (input_max - input_min);
    const mapped_input = output_min + normalized_input * (output_max - output_min);
    return mapped_input;

}

function draw_mandelbrot(location, scale, divergence_threshold, depth) {
    const escape_value = divergence_threshold * divergence_threshold;

    for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {

            let real_component = map(i, 0, canvas.width, location[0] - scale, location[0] + scale);
            let imaginary_component = map(j, 0, canvas.height, location[1] - scale, location[1] + scale);
            let count = 0;

            let real_output = 0;
            let imaginary_output = 0;

            while (count < depth) {
                
                const real = real_output * real_output - imaginary_output * imaginary_output + real_component;
                const imaginary = 2 * real_output * imaginary_output + imaginary_component;

                real_output = real;
                imaginary_output = imaginary;

                if (real * real + imaginary * imaginary > escape_value) {
                    break;
                }

                count++;
            }

            if (count == depth) {
                ctx.fillStyle = "#000000";
                ctx.fillRect(i, j, 1, 1);
            } else {
                const intensity = map(count, 0, depth, 0, 1);
                const color = map(Math.sqrt(intensity), 0, 1, 0, 255);
                ctx.fillStyle = 'rgb(' + String(color) + ', 0, ' + String(color) + ')';
                if (color < 120) {
                    ctx.fillStyle = "#0E0B16";
                }
                ctx.fillRect(i, j, 1, 1);
            }
        }
    }
}

var loc = [-0.5, 0];
var scale = 1.5;
var divergence_threshold = 50;
var depth = 50;

draw_mandelbrot(loc, scale, divergence_threshold, depth);

canvas.addEventListener('click', handle_zoom);

function handle_zoom(event) {
    event.preventDefault();

    console.log(event.deltaY);

    const zoom_direction = 10;
    scale += zoom_direction;
    draw_mandelbrot(loc, scale, divergence_threshold, depth);

}