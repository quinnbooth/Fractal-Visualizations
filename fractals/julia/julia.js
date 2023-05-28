//
// Julia Set Visualization
// Author: Quinn Booth
//

// Control variables
var loc = [0, 0];
var scale = 1.7;
var divergence_threshold = 50;
var depth = 100;
var user_color = [255, 174, 0];
var animation_id = null;
var c = [0.34, 0.34];
var custom_c = [0.28, 0.01];
var direction = 1;
var running_custom = false;

// Plot the Julia Set on the canvas
function draw_julia(location, scale, divergence_threshold, depth, c) {
    
    const escape_value = divergence_threshold * divergence_threshold;
    const width = canvas.width;
    const height = canvas.height;
    const image_data = ctx.getImageData(0, 0, width, height);
    const rgb = new Uint8ClampedArray(image_data.data.buffer);

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
      
            // Get the z value for our function f(z) = z^2 + c based on our location on the canvas
            let real = map(i, 0, canvas.width, location[0] - scale, location[0] + scale);
            let imaginary = map(j, 0, canvas.height, location[1] - scale, location[1] + scale);
            let count = 0;

            // Iterate f(z) = z^2 + c for a given number of steps, c is a constant complex input
            while (count < depth) {
            
                const r = real * real - imaginary * imaginary + c[0];
                imaginary = 2 * real * imaginary + c[1];
                real = r;

                // Exit the loop early if we determine that the function has diverged
                if (r * r + imaginary * imaginary > escape_value) break;
                count++;
            
            }

            const rgb_index = (i + j * width) * 4;

            // Fill with black if the point is within the Julia Set
            if (count == depth) {

                rgb[rgb_index] = 0;
                rgb[rgb_index + 1] = 0;
                rgb[rgb_index + 2] = 0;

            // Otherwise, color it progressively more intense as it took more iterations to diverge in our loop
            } else {
                const intensity = Math.sqrt(count / depth);
                rgb[rgb_index] = intensity * user_color[0];
                rgb[rgb_index + 1] = intensity * user_color[1];
                rgb[rgb_index + 2] = intensity * user_color[2];
            }
        }
    } 

  ctx.putImageData(image_data, 0, 0);
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

    if (running_custom) {
        draw_julia(loc, scale, divergence_threshold, depth, custom_c);
    } else {
        draw_julia(loc, scale, divergence_threshold, depth, c);
    }
}

// Go back to original fractal
function reset_fractal() {
    loc = [0, 0];
    scale = 1.65;
    
    if (running_custom) {
        draw_julia(loc, scale, divergence_threshold, depth, custom_c);
    } else {
        draw_julia(loc, scale, divergence_threshold, depth, c);
    }
}

// HTML elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const back_button = document.getElementById("back_button");
const description = document.getElementById("description");
const pause_button = document.getElementById("pause");
const canvas_cover = document.getElementById("canvas_cover");
const real_slider = document.getElementById("real_slider");
const imaginary_slider = document.getElementById("imaginary_slider");
const user_complex_num = document.getElementById("complex_num");

// Get slider values to run the algorithm with the user's choice of complex number
real_slider.addEventListener('input', slide);
imaginary_slider.addEventListener('input', slide);

function slide() {
    running_custom = true;
    custom_c = [parseFloat(real_slider.value), parseFloat(imaginary_slider.value)];
    user_complex_num.textContent = real_slider.value + " + (" + imaginary_slider.value + ")i";
    draw_julia([0, 0], 1.7, divergence_threshold, depth, custom_c);
}

// Toggle pause button between pausing and running animation
pause_button.addEventListener("click", function() {
    pause();
});

function pause() {
    if (pause_button.textContent == "Pause") {
        running_custom = false;
        pause_button.textContent = "Run";
        scale = 1.65;
        cancelAnimationFrame(animation_id);
    } else {
        pause_button.textContent = "Pause";
        animate_julia(0.34, 0.4, 200, 0.34, 0.4, 200, 4);
    }
}

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
    draw_julia(loc, scale, divergence_threshold, depth, c);
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

// Open and close the custom fractal menu
function custom() {
    if (canvas_cover.style.display == "flex") {
        canvas_cover.style.display = "none";
    } else {
        canvas_cover.style.display = "flex";
        if (pause_button.textContent == "Pause") pause();
        slide();
    }
}

// Resize everything upon launch and plot initial fractal
fit();

// Enable click-to-zoom on canvas
canvas.addEventListener('click', handle_zoom);

// Start julia animation when page opens
function animate_julia(real_min, real_max, real_steps, imaginary_min, imaginary_max, imaginary_steps) {

    const real_step_size = (real_max - real_min) / real_steps;
    const imaginary_step_size = (imaginary_max - imaginary_min) / imaginary_steps;
    let real_step = c[0];
    let imaginary_step = c[1];
  
    function animate() {

        c = [real_step, imaginary_step];
        draw_julia(loc, scale, divergence_threshold, depth, c);
        real_step += real_step_size * direction;
        imaginary_step += imaginary_step_size * direction;
  
        if (real_step > real_max || imaginary_step > imaginary_max) {
            direction = direction * -1;
        } else if (real_step < real_min || imaginary_step < imaginary_min) {
            direction = direction * -1;
        }

        animation_id = requestAnimationFrame(animate);

    }
  
    animate();
}


animate_julia(0.34, 0.4, 200, 0.34, 0.4, 200, 4);


