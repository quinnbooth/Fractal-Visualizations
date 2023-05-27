//
// Mandelbrot Set Visualization
// Author: Quinn Booth
//

// User variables
var loc = [-0.5, 0];
var scale = 1.5;
var divergence_threshold = 50;
var depth = 100;
var user_color = [200, 0, 255];

// Plot the mandelbrot function on the canvas
function draw_mandelbrot(location, scale, divergence_threshold, depth) {

    const escape_value = divergence_threshold * divergence_threshold;

    for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {

            // Get the initial c value for our function f(z) = z^2 + c
            let real_component = map(i, 0, canvas.width, location[0] - scale, location[0] + scale);
            let imaginary_component = map(j, 0, canvas.height, location[1] - scale, location[1] + scale);
            let count = 0;

            // Initial z values (z is complex)
            let real_output = 0;
            let imaginary_output = 0;

            // Iterate f(z) = z^2 + c for a given number of steps
            while (count < depth) {
                
                const real = real_output * real_output - imaginary_output * imaginary_output + real_component;
                const imaginary = 2 * real_output * imaginary_output + imaginary_component;

                real_output = real;
                imaginary_output = imaginary;

                // Exit the loop early if we determine that the function has diverged
                if (real * real + imaginary * imaginary > escape_value) {
                    break;
                }

                count++;
            }

            // Fill with black if the point is within the Mandelbrot set
            if (count == depth) {
                ctx.fillStyle = "#000000";
                ctx.fillRect(i, j, 1, 1);

            // Otherwise, color it progressively more intense as it took more iterations to diverge in our loop
            } else {
                const intensity = map(count, 0, depth, 0, 1);
                const red = map(Math.sqrt(intensity), 0, 1, 0, user_color[0]);
                const green = map(Math.sqrt(intensity), 0, 1, 0, user_color[1]);
                const blue = map(Math.sqrt(intensity), 0, 1, 0, user_color[2]);
                ctx.fillStyle = 'rgb(' + String(red) + ', ' + String(green) + ', ' + String(blue) + ')';
                ctx.fillRect(i, j, 1, 1);
            }
        }
    }
}

// Map an input in a given range to another range
function map(input, input_min, input_max, output_min, output_max) {

    const normalized_input = (input - input_min) / (input_max - input_min);
    const mapped_input = output_min + normalized_input * (output_max - output_min);
    return mapped_input;

}

// Zooming and keeping clicked pixel in place on screen for smoothness
function handle_zoom(event) {

    // Get where the user clicked in terms of the canvas width/height coordinate system
    const boundingRect = canvas.getBoundingClientRect();
    const borderWidth = parseInt(getComputedStyle(canvas).borderWidth);
    const click_x = event.clientX - boundingRect.left - borderWidth;
    const click_y = event.clientY - boundingRect.top - borderWidth;
    const zoom_amount = 0.8;

    // In case user clicks on border of canvas
    if (click_x > canvas.width || click_y > canvas.height) return;

    // Map the user's click to the range of real/imaginary numbers represented on the canvas
    const mapped_x = map(click_x, 0, canvas.width, loc[0] - scale, loc[0] + scale);
    const mapped_y = map(click_y, 0, canvas.height, loc[1] - scale, loc[1] + scale);

    // Move the origin
    loc[0] = mapped_x - (mapped_x - loc[0]) * zoom_amount;
    loc[1] = mapped_y - (mapped_y - loc[1]) * zoom_amount;

    // Zoom and draw
    scale *= zoom_amount;

    draw_mandelbrot(loc, scale, divergence_threshold, depth);

}

// Go back to original fractal
function reset_fractal() {
    loc = [-0.5, 0];
    scale = 1.5;
    draw_mandelbrot(loc, scale, divergence_threshold, depth);
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

// Converting hex to rgb
function get_rgb(hex) {
    return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
}

// Allow user to pick a color for the fractals
color_picker.addEventListener('change', function(event) {
    const hex = event.target.value;
    const rgb = get_rgb(hex);
    user_color = rgb;
    draw_mandelbrot(loc, scale, divergence_threshold, depth);
});

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

// Enable click-to-zoom on canvas
canvas.addEventListener('click', handle_zoom);

// Draw Mandelbrot when the page opens
draw_mandelbrot(loc, scale, divergence_threshold, depth);



