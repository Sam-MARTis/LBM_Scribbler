"use strict";
const canvas = document.getElementById("projectCanvas");
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
const ctx = canvas.getContext("2d");
const WIDTH = 256;
const HEIGHT = 64;
const array1 = new Float32Array(WIDTH * HEIGHT).fill(0);
// const n0 =new Float32Array(WIDTH*HEIGHT)
const viscosity = 0.02;
const omega = 1. / (3 * viscosity + 0.5);
const u0 = 0.1;
// Directions
const n0 = new Float32Array(WIDTH * HEIGHT).fill(0);
const nN = new Float32Array(WIDTH * HEIGHT).fill(0);
const nS = new Float32Array(WIDTH * HEIGHT).fill(0);
const nE = new Float32Array(WIDTH * HEIGHT).fill(0);
const nW = new Float32Array(WIDTH * HEIGHT).fill(0);
const nNE = new Float32Array(WIDTH * HEIGHT).fill(0);
const nNW = new Float32Array(WIDTH * HEIGHT).fill(0);
const nSE = new Float32Array(WIDTH * HEIGHT).fill(0);
const nSW = new Float32Array(WIDTH * HEIGHT).fill(0);
// Barriers
const bar = new Float32Array(WIDTH * HEIGHT).fill(0);
// Macro
const rho = new Float32Array(WIDTH * HEIGHT).fill(0);
const ux = new Float32Array(WIDTH * HEIGHT).fill(0);
const uy = new Float32Array(WIDTH * HEIGHT).fill(0);
const speed2 = new Float32Array(WIDTH * HEIGHT).fill(0);
// function Flatten2D(x:number,y:number){
//     let n = (y*WIDTH)+x;
//     console.log(n);
// }
const Flatten2D = (x, y) => {
    return (y * WIDTH) + x;
};
// function Expand1D(m:number){
//     let y = (m/WIDTH);
//     let x = m%WIDTH;
//     console.log(Math.floor(y), x);
// }
const Expand2D = (k) => {
    return [(k % WIDTH), Math.floor(k / WIDTH)];
};
const Stream = () => {
    for (let x = 0; x < WIDTH - 1; x++) {
        for (let y = 1; y < HEIGHT - 1; y++) {
            // # Movement north (Northwest corner)
            nN[y * WIDTH + x] = nN[y * WIDTH + x + WIDTH];
            // # Movement northwest (Northwest corner)
            nNW[y * WIDTH + x] = nNW[y * WIDTH + x + WIDTH + 1];
            // # Movement west (Northwest corner)
            nW[y * WIDTH + x] = nW[y * WIDTH + x + 1];
            // # Movement south (Southwest corner)
            nS[(HEIGHT - y - 1) * WIDTH + x] = nS[(HEIGHT - y - 1 - 1) * WIDTH + x];
            // # Movement southwest (Southwest corner)
            nSW[(HEIGHT - y - 1) * WIDTH + x] = nSW[(HEIGHT - y - 1 - 1) * WIDTH + x + 1];
            // # Movement east (Northeast corner)
            nE[y * WIDTH + (WIDTH - x - 1)] = nE[y * WIDTH + (WIDTH - (x + 1) - 1)];
            // # Movement northeast (Northeast corner)
            nNE[y * WIDTH + (WIDTH - x - 1)] = nNE[y * WIDTH + WIDTH + (WIDTH - (x + 1) - 1)];
            // # Movement southeast (Southeast corner)
            nSE[(HEIGHT - y - 1) * WIDTH + (WIDTH - x - 1)] = nSE[(HEIGHT - y - 1 - 1) * WIDTH + (WIDTH - (x + 1) - 1)];
        }
        x += 1;
        for (let y = 1; y < HEIGHT - 1; y++) {
            // # Movement north on right boundary (Northwest corner)
            nN[y * WIDTH + x] = nN[y * WIDTH + x + WIDTH];
            // # Movement south on right boundary (Southwest corner)
            nS[(HEIGHT - y - 1) * WIDTH + x] = nS[(HEIGHT - y - 1 - 1) * WIDTH + x];
        }
    }
};
const Bounce = () => {
    for (let x = 2; x < WIDTH - 2; x++) {
        for (let y = 2; y < HEIGHT - 2; y++) {
            if (bar[y * WIDTH + x]) {
                // # Push densities back from whence they came
                nN[(y - 1) * WIDTH + x] = nS[y * WIDTH + x];
                nS[(y + 1) * WIDTH + x] = nN[y * WIDTH + x];
                nE[y * WIDTH + x + 1] = nW[y * WIDTH + x];
                nW[y * WIDTH + (x - 1)] = nE[y * WIDTH + x];
                nNE[(y - 1) * WIDTH + (x + 1)] = nSW[y * WIDTH + x];
                nNW[(y - 1) * WIDTH + (x - 1)] = nSE[y * WIDTH + x];
                nSE[(y + 1) * WIDTH + (x + 1)] = nNW[y * WIDTH + x];
                nSW[(y + 1) * WIDTH + (x - 1)] = nNE[y * WIDTH + x];
                // # Clear the densities in the barrier cells
                n0[y * WIDTH + x] = 0;
                nN[y * WIDTH + x] = 0;
                nS[y * WIDTH + x] = 0;
                nE[y * WIDTH + x] = 0;
                nW[y * WIDTH + x] = 0;
                nNE[y * WIDTH + x] = 0;
                nNW[y * WIDTH + x] = 0;
                nSE[y * WIDTH + x] = 0;
                nSW[y * WIDTH + x] = 0;
            }
        }
    }
};
