import PVector from "../_shared/pvector.js";
import Spring from "./spring.js";
import Bob from "./bob.js";
import pointerTracker from "../_shared/tracker.js";

const w = 640;
const h = 640;
const halfWidth = Math.round(w / 2);

const canvas = document.querySelector('canvas');
canvas.width = w;
canvas.height = h;

const g = canvas.getContext('2d');

const spring = new Spring(halfWidth, 0, halfWidth, 180);
const bob = new Bob(halfWidth, 300, halfWidth);
const gravity = new PVector(0, 2);

pointerTracker(canvas, function (eventType, x, y) {
    switch (eventType) {

        case 'down':
            bob.handleClick(x, y);
            break;

        case 'move':
            bob.handleDrag(x, y);
            break;

        case 'up':
            bob.stopDragging();
            break;
    }
});

function drawSpring() {
    const springWidth = 26;
    const numSegments = 36.0;

    const box = bob.box;
    const dx = bob.halfWidth - (box.x + box.w / 2);

    // angle of bob and the vertical middle line
    const bobAngle = Math.atan2(dx, box.y);

    // the line from anchor to bob
    const hypot = Math.round(Math.hypot(dx, box.y));

    // the start segAngle of the spring segments
    let segAngle = Math.PI / 2 + Math.acos((hypot / numSegments) / springWidth);

    let x1 = spring.halfWidth + springWidth / 2;
    let y1 = 0;
    for (let i = 0; i < numSegments; i++) {
        const x2 = x1 + Math.cos(segAngle + bobAngle) * springWidth;
        const y2 = y1 + Math.sin(segAngle + bobAngle) * springWidth;
        drawLine(Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2));
        x1 = x2;
        y1 = y2;
        segAngle = Math.PI - segAngle;
    }
}

function drawBob() {
    const quarterWidth = Math.round(bob.box.w / 4);
    drawLine(halfWidth - quarterWidth, 0, halfWidth + quarterWidth, 0);
    drawLine(bob.box.x + quarterWidth, bob.box.y - 1, bob.box.x + bob.box.w - quarterWidth, bob.box.y - 1);
    drawBox(bob.box)
}

function draw() {
    g.clearRect(0, 0, w, h);
    bob.applyForce(gravity);
    bob.applyForce(spring.getSpringForce(bob));

    spring.constrainLength(bob, 30, 400);
    bob.update();

    drawSpring();
    drawBob();
}

function drawLine(x1, y1, x2, y2, width = 1, color = 'black') {
    g.lineWidth = width;
    g.strokeStyle = color;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.closePath();
    g.stroke();
}

function drawBox(box, width = 1, color = 'black') {
    g.lineWidth = width;
    g.strokeStyle = color;
    g.strokeRect(box.x, box.y, box.w, box.h);
}

setInterval(draw, 17);
