"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const canvas = document.getElementById("projectCanvas");
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
const ctx = canvas.getContext("2d");
const height = 60;
const width = 100;
const multiplier = 1.5;
const viscosity = 0.01 * multiplier;
const omega = 1 / (3 * viscosity + 0.5);
const u0 = 0.1 / multiplier;
const four9ths = 4 / 9;
const one9th = 1 / 9;
const one36th = 1 / 36;
const CALC_DRAW_RATIO = 10;
const DRAW_SCALE_X = (0.7 * canvas.width) / width;
let n0 = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let nN = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let nS = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let nE = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let nW = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let nNW = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let nNE = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let nSE = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let nSW = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let bar = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let rho = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let ux = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let uy = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
let speed2 = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT)).fill(0);
const flatten2D = (i, j) => {
    return j * width + i;
};
const work1 = new Worker("worker1.js");
const work2 = new Worker("worker1.js");
const work3 = new Worker("worker1.js");
const work4 = new Worker("worker1.js");
const work5 = new Worker("worker1.js");
const work6 = new Worker("worker1.js");
const work7 = new Worker("worker1.js");
const work8 = new Worker("worker1.js");
// Function to post a message to a worker and handle responses/errors
const postMessageToWorker = (worker, message) => {
    return new Promise((resolve, reject) => {
        worker.onmessage = (e) => resolve(e.data); // Ensure e.data is cast as StreamResponse
        worker.onerror = (err) => reject(err);
        worker.postMessage(message, [message.arrayBuffer.buffer]); // Transfer the ArrayBuffer
    });
};
// Asynchronous function to process data with workers
const processWithWorkers = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Processing with workers...");
        try {
            // Create an array of promises for each worker
            const promises = [
                postMessageToWorker(work1, { arrayBuffer: nN, arrayType: "nN", width, height }),
                postMessageToWorker(work2, { arrayBuffer: nNW, arrayType: "nNW", width, height }),
                postMessageToWorker(work3, { arrayBuffer: nW, arrayType: "nW", width, height }),
                postMessageToWorker(work4, { arrayBuffer: nS, arrayType: "nS", width, height }),
                postMessageToWorker(work5, { arrayBuffer: nSW, arrayType: "nSW", width, height }),
                postMessageToWorker(work6, { arrayBuffer: nE, arrayType: "nE", width, height }),
                postMessageToWorker(work7, { arrayBuffer: nNE, arrayType: "nNE", width, height }),
                postMessageToWorker(work8, { arrayBuffer: nSE, arrayType: "nSE", width, height }),
            ];
            // Wait for all workers to finish processing
            const results = yield Promise.all(promises);
            console.log("All workers finished processing.");
            console.log(results); // Handle the results from all workers
            // Process each worker's response
            for (let i = 0; i < results.length; i++) {
                const { array, arrayType } = results[i];
                switch (arrayType) {
                    case "nN":
                        nN = new Float32Array(array);
                        break;
                    case "nNW":
                        nNW = new Float32Array(array);
                        break;
                    case "nW":
                        nW = new Float32Array(array);
                        break;
                    case "nS":
                        nS = new Float32Array(array);
                        break;
                    case "nSW":
                        nSW = new Float32Array(array);
                        break;
                    case "nE":
                        nE = new Float32Array(array);
                        break;
                    case "nNE":
                        nNE = new Float32Array(array);
                        break;
                    case "nSE":
                        nSE = new Float32Array(array);
                        break;
                    default:
                        console.error("Unknown array type");
                        break;
                }
            }
            // Resolve the promise once processing is complete
            resolve();
        }
        catch (error) {
            console.error("Error occurred during worker processing:", error);
            reject(error); // Reject the promise if an error occurs
        }
    }));
};
// processWithWorkers();
// const stream = async (): Promise<void> => {
//   // work1.postMessage({array: nN, arrayType: "nN", width: width, height: height}, [nN.buffer]);
//   // work1.onmessage = (e) => {
//   //   nN = new Float32Array(e.data.array);
//   //   console.log("nN has been updated by worker 1");
//   //   console.log(nN);
//   // }
//   processWithWorkers();
//   console.log("All arrays have been updated by the workers");
// };
const bounce = () => {
    for (let x = 2; x < width - 2; x++) {
        for (let y = 2; y < height - 2; y++) {
            // if (bar[y*width + x]):
            if (bar[y * width + x]) {
                nN[(y - 1) * width + x] = nS[y * width + x];
                nS[(y + 1) * width + x] = nN[y * width + x];
                nE[y * width + x + 1] = nW[y * width + x];
                nW[y * width + (x - 1)] = nE[y * width + x];
                nNE[(y - 1) * width + (x + 1)] = nSW[y * width + x];
                nNW[(y - 1) * width + (x - 1)] = nSE[y * width + x];
                nSE[(y + 1) * width + (x + 1)] = nNW[y * width + x];
                nSW[(y + 1) * width + (x - 1)] = nNE[y * width + x];
                n0[y * width + x] = 0;
                nN[y * width + x] = 0;
                nS[y * width + x] = 0;
                nE[y * width + x] = 0;
                nW[y * width + x] = 0;
                nNE[y * width + x] = 0;
                nNW[y * width + x] = 0;
                nSE[y * width + x] = 0;
                nSW[y * width + x] = 0;
            }
        }
    }
};
const collide = () => {
    for (let x = 1; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
            let i = y * width + x;
            if (bar[i]) {
                continue;
            }
            else {
                rho[i] =
                    n0[i] +
                        nN[i] +
                        nE[i] +
                        nS[i] +
                        nW[i] +
                        nNE[i] +
                        nSE[i] +
                        nSW[i] +
                        nNW[i];
                // if (rho[i] > 0):
                if (rho[i] > 0) {
                    ux[i] =
                        (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) *
                            (1 - (rho[i] - 1) + (rho[i] - 1) ** 2);
                    uy[i] =
                        (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) *
                            (1 - (rho[i] - 1) + (rho[i] - 1) ** 2);
                }
                const one9th_rho = one9th * rho[i];
                const one36th_rho = one36th * rho[i];
                const vx3 = 3 * ux[i];
                const vy3 = 3 * uy[i];
                const vx2 = ux[i] * ux[i];
                const vy2 = uy[i] * uy[i];
                const vxvy2 = 2 * ux[i] * uy[i];
                const v2 = vx2 + vy2;
                speed2[i] = v2;
                const v215 = 1.5 * v2;
                nE[i] += omega * (one9th_rho * (1 + vx3 + 4.5 * vx2 - v215) - nE[i]);
                nW[i] += omega * (one9th_rho * (1 - vx3 + 4.5 * vx2 - v215) - nW[i]);
                nN[i] += omega * (one9th_rho * (1 + vy3 + 4.5 * vy2 - v215) - nN[i]);
                nS[i] += omega * (one9th_rho * (1 - vy3 + 4.5 * vy2 - v215) - nS[i]);
                nNE[i] +=
                    omega *
                        (one36th_rho * (1 + vx3 + vy3 + 4.5 * (v2 + vxvy2) - v215) - nNE[i]);
                nNW[i] +=
                    omega *
                        (one36th_rho * (1 - vx3 + vy3 + 4.5 * (v2 - vxvy2) - v215) - nNW[i]);
                nSE[i] +=
                    omega *
                        (one36th_rho * (1 + vx3 - vy3 + 4.5 * (v2 - vxvy2) - v215) - nSE[i]);
                nSW[i] +=
                    omega *
                        (one36th_rho * (1 - vx3 - vy3 + 4.5 * (v2 + vxvy2) - v215) - nSW[i]);
                n0[i] =
                    rho[i] -
                        (nE[i] + nW[i] + nN[i] + nS[i] + nNE[i] + nSE[i] + nNW[i] + nSW[i]);
            }
        }
    }
};
const initialize = (u0 = 0.1) => {
    let xcoord = 0;
    let ycoord = 0;
    for (let i = 0; i < height * width; i++) {
        n0[i] = four9ths * (1 - 1.5 * u0 ** 2);
        nN[i] = one9th * (1 - 1.5 * u0 ** 2);
        nS[i] = one9th * (1 - 1.5 * u0 ** 2);
        nE[i] = one9th * (1 + 3 * u0 + 4.5 * u0 ** 2 - 1.5 * u0 ** 2);
        nW[i] = one9th * (1 - 3 * u0 + 4.5 * u0 ** 2 - 1.5 * u0 ** 2);
        nNE[i] = one36th * (1 + 3 * u0 + 4.5 * u0 ** 2 - 1.5 * u0 ** 2);
        nSE[i] = one36th * (1 + 3 * u0 + 4.5 * u0 ** 2 - 1.5 * u0 ** 2);
        nNW[i] = one36th * (1 - 3 * u0 + 4.5 * u0 ** 2 - 1.5 * u0 ** 2);
        nSW[i] = one36th * (1 - 3 * u0 + 4.5 * u0 ** 2 - 1.5 * u0 ** 2);
        rho[i] =
            n0[i] + nN[i] + nS[i] + nE[i] + nW[i] + nNE[i] + nSE[i] + nNW[i] + nSW[i];
        ux[i] =
            (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) *
                (1 - (rho[i] - 1) + (rho[i] - 1) ** 2);
        uy[i] =
            (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) *
                (1 - (rho[i] - 1) + (rho[i] - 1) ** 2);
        xcoord = xcoord + 1 < width - 1 ? xcoord + 1 : 0;
        ycoord = xcoord != 0 ? ycoord : ycoord + 1;
    }
};
const handleBoundaries = () => { };
const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 2; x < width - 2; x++) {
        for (let y = 2; y < height - 10; y++) {
            if (bar[y * width + x]) {
                ctx.fillStyle = "black";
                ctx.fillRect(x * DRAW_SCALE_X, y * DRAW_SCALE_X, DRAW_SCALE_X, DRAW_SCALE_X);
            }
            else {
                const i = y * width + x;
                // const c = Math.floor(255 * Math.sqrt(speed2[i]))
                const c = 3000 *
                    (uy[x + 1 + y * width] -
                        uy[x - 1 + y * width] -
                        ux[x + (y + 1) * width] +
                        ux[x + (y - 1) * width]);
                ctx.fillStyle = `rgb(${+c}, ${0}, ${-c})`;
                // ctx.fillStyle = `rgb(${c}, ${c}, ${c})`
                ctx.fillRect(x * DRAW_SCALE_X, y * DRAW_SCALE_X, DRAW_SCALE_X, DRAW_SCALE_X);
            }
        }
    }
};
const createWall = (x, y) => {
    bar[flatten2D(x, y)] = 1;
};
let time = performance.now();
let iterationCounter = 0; // Counter to track iterations
const tick = () => {
    // for (let iter = 0; iter < CALC_DRAW_RATIO; iter++) {
    // oldStream();
    processWithWorkers()
        .then(() => {
        bounce();
        collide();
        // Increment the iteration counter
        iterationCounter++;
        // Only draw once when the counter reaches CALC_DRAW_RATIO
        if (iterationCounter >= CALC_DRAW_RATIO) {
            draw();
            iterationCounter = 0; // Reset the counter
        }
    })
        .then(() => {
        requestAnimationFrame(tick);
    });
    // streamThis().then(() => {
    // bounce();
    // collide();
    // });
    const newTime = performance.now();
    console.log("Simulation took", newTime - time, "ms");
    console.log("n0[4000]: ", n0[4000]);
    time = newTime;
};
initialize(u0);
// console.log("nN value after initialization: ", nN)
// stream();
// console.log("nN value after stream: ", nN)
// stream().then(() => {bounce(); collide(); });
// collide();
console.log("Starting Stream");
console.log("Value of n0[sample] before stream: ", n0[Math.floor(width * height / 2)]);
// stream();
console.log("Stream complete");
console.log("Value of n0[sample]: ", n0[Math.floor(width * height / 2)]);
console.log("testing");
for (let j = 22; j < 38; j++) {
    createWall(20, j);
}
addEventListener("click", (e) => {
    // const posX = Math.floor(e.layerX / DRAW_SCALE_X);
    // const posY = Math.floor(e.layerY / DRAW_SCALE_X);
    // createWall(posX, posY);
    bounce();
    collide();
    // stream()
    console.log(n0);
    console.log("u[sample]: ", nN[Math.floor(width * Math.floor(height / 2))]);
});
console.log("Initialization took", performance.now() - time, "ms");
time = performance.now();
tick();
