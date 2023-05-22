//
// Fractal spirograph visualization
// Author: Quinn Booth
//

//#region HTML Setup

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const fractal_canvas = document.getElementById("fractal_canvas");
const fractal_ctx = fractal_canvas.getContext("2d", { willReadFrequently: true });

// Clear both canvases
function reset_canvases() {
    ctx.fillStyle = "#0E0B16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    fractal_ctx.fillStyle = "transparent";
    fractal_ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Ensure canvas is square and fits on screen
window.addEventListener('resize', function() {
    console.log("test");
    if (window.innerWidth > window.innerHeight) {
        canvas.height = Math.floor(window.innerHeight * 0.75);
        canvas.width = canvas.height;
        fractal_canvas.width = canvas.height;
        fractal_canvas.height = canvas.height;
    } else {
        canvas.width = Math.floor(window.innerWidth * 0.75);
        canvas.height = canvas.width;
        fractal_canvas.width = canvas.width;
        fractal_canvas.height = canvas.width;
    }
    
    reset_canvases();
});

window.dispatchEvent(new Event('resize'));

//#endregion

var num_of_circles = 4;
var current_circle = null;
var circles = [];
var radius = canvas.width / 3;
var color = "#FFFFFF";
var step = 1000;

class Circle {

    constructor(parent, radius, color, step) {
        this.parent = parent;
        this.radius = radius;
        this.color = color;
        this.step = 2 * Math.PI * (1 / step);  // How many steps to make a full revolution around circle
        this.cumulative_step = this.step;  // Step of this circle + all its parents
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        if (this.parent) {
            this.x = parent.x_connect - radius;
            this.y = parent.y_connect;
            this.cumulative_step = this.step + this.parent.cumulative_step;
        }
        this.angle = 0;
        this.x_connect = this.x + this.radius;
        this.y_connect = this.y;
    }

    get_coords() {
        if (this.parent) {
            this.x = this.parent.x_connect - this.radius * Math.cos(-1 * this.parent.angle);
            this.y = this.parent.y_connect + this.radius * Math.sin(-1 * this.parent.angle);
        }
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    trace() {
        this.x_connect = this.x + this.radius * Math.cos(this.angle);
        this.y_connect = this.y + this.radius * Math.sin(this.angle);
        this.angle += this.cumulative_step;
    }

}

function delayed_loop(iterations, delay, func) {
    for (let i = 0; i < iterations; i++) {
        (function (i) {
            setTimeout(function (){
                func();
            }, delay * i);
        })(i);
    }
}

function draw_fractal() {
    ctx.fillStyle = "#0E0B16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < circles.length; i++) {
        circles[i].get_coords();
        circles[i].draw();
        circles[i].trace();
    }
    fractal_ctx.fillStyle = "#FF0000";
    const last_circle = circles.length - 1;
    fractal_ctx.fillRect(circles[last_circle].x_connect, circles[last_circle].y_connect, 1, 1);
}

for (let i = 0; i < num_of_circles; i++) {
    let circle = new Circle(current_circle, radius, color, step);
    circles.push(circle);
    radius = radius / 2;
    current_circle = circle;
}

delayed_loop(10000, 0.1, draw_fractal);