import {createMatrix} from "../_shared/matrix.js";
import {shuffleArray} from "../_shared/array.js";
import {sleep} from "../_shared/util.js";
import Dir, {N, S, E, W} from "./dir.js";

const canvas = document.querySelector('canvas');
canvas.width = 700;
canvas.height = 700;

const g = canvas.getContext('2d');

const nCols = 24;
const nRows = 24;
const cellSize = 25;
const margin = 50;
const dirList = Dir.dirList();

let maze;
let solution;
let solved = false;

g.font = '25px sans-serif';

canvas.addEventListener('click', async function () {
    if (solved) {
        solved = false;
        init();
        generateMaze(0, 0);
        draw('click to solve');
    } else {
        draw();
        if (await solve(0)) {
            solved = true;
            draw('click to generate new maze');
        }
    }
});

function init() {
    maze = createMatrix(nRows, nCols);
    solution = [];
}

function generateMaze(r, c) {
    // we're not using the global dirlist here,
    // because we want the shuffle to be localized
    const dirList = Dir.dirList();
    shuffleArray(dirList);

    for (const dir of dirList) {
        const nc = c + dir.dx;
        const nr = r + dir.dy;
        if (withinBounds(nr, nc) && maze[nr][nc] === 0) {
            maze[r][c] |= dir.direction;
            maze[nr][nc] |= dir.opposite;
            generateMaze(nr, nc);
        }
    }
}

async function solve(pos) {
    if (pos === nCols * nRows - 1)
        return true;

    const c = Math.floor(pos % nCols);
    const r = Math.floor(pos / nCols);

    for (const dir of dirList) {
        const nc = c + dir.dx;
        const nr = r + dir.dy;
        if (withinBounds(nr, nc) && (maze[r][c] & dir.direction) !== 0
            && (maze[nr][nc] & 16) === 0) {

            const newPos = nr * nCols + nc;
            solution.push(newPos);
            maze[nr][nc] |= 16;

            await animate();

            if (await solve(newPos))
                return true;

            await animate();

            solution.pop();
            maze[nr][nc] &= ~16;
        }
    }

    return false;
}

async function animate() {
    draw();
    await sleep(30);
}

function drawMaze() {
    g.strokeStyle = 'black';

    for (let r = 0; r < nRows; r++) {
        for (let c = 0; c < nCols; c++) {

            const x = margin + c * cellSize;
            const y = margin + r * cellSize;

            if ((maze[r][c] & N) === 0)
                drawLine(x - 2, y, x + cellSize + 2, y);

            if ((maze[r][c] & S) === 0)
                drawLine(x - 2, y + cellSize, x + cellSize + 2, y + cellSize);

            if ((maze[r][c] & E) === 0)
                drawLine(x + cellSize, y, x + cellSize, y + cellSize);

            if ((maze[r][c] & W) === 0)
                drawLine(x, y, x, y + cellSize);
        }
    }
}

function drawPath() {
    if (solution.length) {
        const offset = margin + Math.floor(cellSize / 2);

        g.strokeStyle = 'orange';
        g.beginPath();
        g.moveTo(offset, offset);

        for (const pos of solution) {
            const x = Math.floor(pos % nCols) * cellSize + offset;
            const y = Math.floor(pos / nCols) * cellSize + offset;
            g.lineTo(x, y);
        }
        g.stroke();
    }
}

function drawText(txt) {
    g.textAlign = 'center';
    g.fillText(txt, canvas.width / 2, canvas.height - 10);
}

function drawLine(x1, y1, x2, y2, width = 4, color = 'black') {
    g.lineWidth = width;
    g.strokeStyle = color;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
}

function draw(message = 'none') {
    g.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawPath();
    if (message !== 'none') {
        drawText(message);
    }
}

function withinBounds(r, c) {
    return c >= 0 && c < nCols && r >= 0 && r < nRows;
}

init();
generateMaze(0, 0);
draw('click to solve');
