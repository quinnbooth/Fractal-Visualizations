//
// Fractal spirograph visualization
// Author: Quinn Booth
//

// Stores an object for each circle
var circles = [];

// Speeds of plotting and rotation
var steps = [40000, 10000, 20000, 1000, 500, 100, 10];
var speed = 1;

// User variables for custom fractals
var custom_steps = [40000, 10000, 20000, 1000, 500, 100, 10];
var custom_circles = 7;

// RGB of fractal
var colors = [255, 0, 0];
var color_tracker = [1, -1, -1];
var rainbow = false;

// For aborting old draw commands when new fractal/speed is requested
var draw_num = 0;

// Controls the rotation and placement of each circle
class Circle {

    constructor(parent, radius, color, step) {
        this.parent = parent;
        this.radius = radius;
        this.color = color;
        this.step = 2 * Math.PI * (1 / step);  // How many steps to make a full revolution around circle
        this.cumulative_step = this.step;  // Step of this circle + all its parents
        this.direction = 1;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        if (this.parent) {
            this.x = parent.x_connect + radius;
            this.y = parent.y_connect;
            this.cumulative_step = this.step + this.parent.cumulative_step;
            this.direction = this.parent.direction * -1;  // Have child rotate in opposite direction as parent
        }
        this.angle = 0;
        this.x_connect = this.x + this.radius;
        this.y_connect = this.y;
    }

    // Determines where center of circle should be based on parent info
    get_coords() {
        if (this.parent) {
            this.x = this.parent.x_connect + this.radius * Math.cos(-1 * this.parent.angle);
            this.y = this.parent.y_connect - this.radius * Math.sin(-1 * this.parent.angle);
        }
    }

    // Draws circle
    draw() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    // Determines next coordinates where child circle should connect
    trace() {
        this.x_connect = this.x + this.radius * Math.cos(this.angle);
        this.y_connect = this.y + this.radius * Math.sin(this.angle);
        this.angle += this.cumulative_step * this.direction;
    }

}

// HTML elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const fractal_canvas = document.getElementById("fractal_canvas");
const fractal_ctx = fractal_canvas.getContext("2d", { willReadFrequently: true });
const description = document.getElementById("description");
const canvas_cover = document.getElementById("canvas_cover");
const slider = document.getElementById("slider");
const circle_count = document.getElementById("circle_count");
const back_button = document.getElementById("back_button");

// Ensure everything fits on screen when resized
window.addEventListener('resize', function() {
    draw_num++;
    fit();
    reset_canvases();
});

// Enable re-direct to home page
back_button.addEventListener("click", function() {
    window.location.href = "../../index.html";
});

// Get number of desired circles from slider and show relevant options
slider.addEventListener("input", function() {
    custom_circles = parseInt(slider.value);
    circle_count.textContent = "Use up to Circle: " + slider.value;
});

// Clear both canvases
function reset_canvases() {
    clear_circles();
    fractal_ctx.fillStyle = "transparent";
    fractal_ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Clear just the circles
function clear_circles() {
    ctx.fillStyle = "#0E0B16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Make everything fit on screen
function fit() {
    if (window.innerWidth * 0.65 > window.innerHeight * 0.8) {
        canvas.height = Math.floor(window.innerHeight * 0.8 * 0.75);
        canvas.width = canvas.height;
        fractal_canvas.width = canvas.height;
        fractal_canvas.height = canvas.height;
        canvas_cover.style.width = canvas.height;
        canvas_cover.style.height = canvas.height;
    } else {
        canvas.width = Math.floor(window.innerWidth * 0.65 * 0.75);
        canvas.height = canvas.width;
        fractal_canvas.width = canvas.width;
        fractal_canvas.height = canvas.width;
        canvas_cover.style.width = canvas.width;
        canvas_cover.style.height = canvas.width;
    }
    if (window.innerWidth <= 915) {
        canvas.style.left = "40%";
        fractal_canvas.style.left = "40%";
        canvas_cover.style.left = "40%";
    } else {
        canvas.style.left = "";
        fractal_canvas.style.left = "";
        canvas_cover.style.left = "";
    }
    if (window.innerHeight <= 520) {
        description.style.height = "120px";
    } else {
        description.style.height = "275px";
    }
    reset_canvases();
}

// Custom fractal settings button toggles menu
function custom() {
    draw_num++;
    if (canvas_cover.style.display == "flex") {
        canvas_cover.style.display = "none";
    } else {
        canvas_cover.style.display = "flex";
    }
}

// Run fractal generation with custom settings
function run_custom() {
    for (let i = 1; i < 8; i++) {
        const circle_setting = document.getElementById(`circle${i}`);
        if (!circle_setting.value) {
            custom_steps[i - 1] = 1000;
            return;
        }
        let circle_value = parseInt(circle_setting.value);
        if (circle_value < 10) {
            circle_value = 10;
        } else if (circle_value > 40000) {
            circle_value = 40000;
        }
        circle_setting.value = String(circle_value);
        custom_steps[i - 1] = circle_value;
    }
    custom();
    fit();
    setTimeout(function() {
        create_circles(custom_circles, custom_steps);
        draw_fractal(40000, speed);
    }, 10);
}

// If 'multi' color option selected, shift colors with each step
function change_color() {
    if (!rainbow) return;
    for (let i = 0; i < colors.length; i++) {
        colors[i] = colors[i] + color_tracker[i];
        if (colors[i] > 255) {
            colors[i] = 255;
            color_tracker[i] = -1;
        } else if (colors[i] < 0) {
            colors[i] = 0;
            color_tracker[i] = 1;
        }
    }
}

// Initializes the circle objects
function create_circles(num_of_circles, steps) {

    let current_circle = null;
    let radius = canvas.width / 6;
    let color = "#FFFFFF";
    circles = [];

    for (let i = 0; i < num_of_circles; i++) {
        let circle = new Circle(current_circle, radius, color, steps[i]);
        circles.push(circle);
        radius = radius / 2;
        current_circle = circle;
    }

    move_circles();

}
  
// Moves each circle by one step in their rotation and plots the fractal
function move_circles(num, i, iterations, callback) {

    if (num != draw_num) return;

    ctx.fillStyle = "#0E0B16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < circles.length; i++) {
      circles[i].get_coords();
      circles[i].draw();
      circles[i].trace();
    }
    change_color();
    fractal_ctx.fillStyle = `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;
    const last_circle = circles.length - 1;
    fractal_ctx.fillRect(circles[last_circle].x_connect, circles[last_circle].y_connect, 1, 1);
    setTimeout(callback, 10);
}

// Runs a number of steps of the fractal algorithm
function draw_fractal(iterations, delay) {
    draw_num++;
    let test_num = draw_num;
    for (let i = 0; i < iterations; i++) {
      (function (i) {
        setTimeout(function () {
          move_circles(test_num, i, iterations, function () {
            if (i === iterations - 1) {
                setTimeout(clear_circles, 10);
            }
          });
        }, delay * i);
      })(i);
    }
}

// function draw_fractal(iterations, delay) {
//     draw_num++;
//     let test_num = draw_num;
//     let i = 0;
  
//     function animate() {
//       if (test_num !== draw_num) return;
  
//       move_circles(test_num, i, iterations, function () {
//         if (i === iterations - 1) {
//           setTimeout(clear_circles, 10);
//         } else {
//           i++;
//           setTimeout(function () {
//             requestAnimationFrame(animate);
//           }, delay);
//         }
//       });
//     }
  
//     animate();
// }

// Color options
function set_red() {
    colors = [255, 0, 0];
    rainbow = false;
}

function set_white() {
    colors = [255, 255, 255];
    rainbow = false;
}

function set_multi() {
    colors = [255, 50, 0];
    rainbow = true;
}

// Fractal presets
function cross_fractal() {
    fit();
    steps = [40000, 10000, 10000, 1000, 500, 100, 10];
    create_circles(steps.length, steps);
    draw_fractal(40000, speed);
}

function donut() {
    fit();
    steps = [500, 20000, 500, 500, 500];
    create_circles(steps.length, steps);
    draw_fractal(20000, speed);
}

function star() {
    fit();
    steps = [500, 1000, 20000];
    create_circles(steps.length, steps);
    draw_fractal(20000, speed);
}

function nucleus() {
    fit();
    steps = [100000, 1600, 800, 400, 200, 100, 10];
    create_circles(steps.length, steps);
    draw_fractal(100000, speed);
}

function star_fractal() {
    fit();
    steps = [40000, 10000, 20000, 1000, 500, 100, 10];
    create_circles(steps.length, steps);
    draw_fractal(40000, speed);
}

// Speed Options
function set_speed(s) {
    draw_num++;
    speed = s;
}

// Resize elements and draw initial fractal on launch
fit();
setTimeout(function() {
    create_circles(steps.length, steps);
    draw_fractal(40000, speed);
}, 10);

