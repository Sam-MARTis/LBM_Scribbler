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
const NoOfWorkers = 10;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
const ctx = canvas.getContext("2d");
const height = 100;
const width = 200;
const multiplier = 1.5;
let viscosity = 0.008 * multiplier;
let omega = 1 / (3 * viscosity + 0.5);
const u0 = 0.2 / multiplier;
const four9ths = 4. / 9.;
const one9th = 1. / 9.;
const one36th = 1. / 36.;
const CALC_DRAW_RATIO = 10;
const DRAW_SCALE_X = 1 * canvas.width / width;
const maxSpeed = 0.4;
const functionArguments = new Float32Array(5);
let n0 = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let nN = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let nS = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let nE = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let nW = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let nNW = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let nNE = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let nSE = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let nSW = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let bar = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let rho = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let ux = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let uy = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let speed2 = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
let plotOption = "curl";
const plotSelect = document.getElementById("plotOptions");
plotSelect.addEventListener("change", () => {
    plotOption = plotSelect.value;
});
let paused = false;
let animVal = 0;
const playPauseButton = document.getElementById("but1");
playPauseButton.addEventListener("click", () => {
    paused = !paused;
    if (!paused) {
        tick();
    }
    else {
        if (animVal !== null) {
            cancelAnimationFrame(animVal);
        }
    }
});
const flatten2D = (i, j) => {
    return j * width + i;
};
const D_Square = (x1, y1, x2, y2) => {
    return ((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2));
};
const stream = () => {
    for (let x = 0; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
            nN[y * width + x] = nN[y * width + x + width];
            nNW[y * width + x] = nNW[y * width + x + width + 1];
            nW[y * width + x] = nW[y * width + x + 1];
            nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x];
            nSW[(height - y - 1) * width + x] = nSW[(height - y - 1 - 1) * width + x + 1];
            nE[y * width + (width - x - 1)] = nE[y * width + (width - (x + 1) - 1)];
            nNE[y * width + (width - x - 1)] = nNE[y * width + width + (width - (x + 1) - 1)];
            nSE[(height - y - 1) * width + (width - x - 1)] = nSE[(height - y - 1 - 1) * width +
                (width - (x + 1) - 1)];
        }
    }
    const x = width;
    for (let y = 1; y < height - 1; y++) {
        nN[y * width + x] = nN[y * width + x + width];
        nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x];
    }
};
const ensureStability = () => {
    for (let i = 0; i < height * width; i++) {
        n0[i] = n0[1] > maxSpeed ? maxSpeed : n0[i];
        nN[i] = nN[1] > maxSpeed ? maxSpeed : nN[i];
        nS[i] = nS[1] > maxSpeed ? maxSpeed : nS[i];
        nE[i] = nE[1] > maxSpeed ? maxSpeed : nE[i];
        nW[i] = nW[1] > maxSpeed ? maxSpeed : nW[i];
        nNE[i] = nNE[1] > maxSpeed ? maxSpeed : nNE[i];
        nNW[i] = nNW[1] > maxSpeed ? maxSpeed : nNW[i];
        nSE[i] = nSE[1] > maxSpeed ? maxSpeed : nSE[i];
        nSW[i] = nSW[1] > maxSpeed ? maxSpeed : nSW[i];
    }
};
const bounce = () => {
    for (let x = 2; x < width - 2; x++) {
        for (let y = 2; y < height - 2; y++) {
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
                rho[i] = n0[i] + nN[i] + nE[i] + nS[i] + nW[i] + nNE[i] + nSE[i] + nSW[i] + nNW[i];
                if (rho[i] > 0) {
                    ux[i] = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) * (1 - (rho[i] - 1) + ((rho[i] - 1) ** 2.));
                    uy[i] = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) * (1 - (rho[i] - 1) + ((rho[i] - 1) ** 2.));
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
                nNE[i] += omega * (one36th_rho * (1 + vx3 + vy3 + 4.5 * (v2 + vxvy2) - v215) - nNE[i]);
                nNW[i] += omega * (one36th_rho * (1 - vx3 + vy3 + 4.5 * (v2 - vxvy2) - v215) - nNW[i]);
                nSE[i] += omega * (one36th_rho * (1 + vx3 - vy3 + 4.5 * (v2 - vxvy2) - v215) - nSE[i]);
                nSW[i] += omega * (one36th_rho * (1 - vx3 - vy3 + 4.5 * (v2 + vxvy2) - v215) - nSW[i]);
                n0[i] = rho[i] - (nE[i] + nW[i] + nN[i] + nS[i] + nNE[i] + nSE[i] + nNW[i] + nSW[i]);
            }
        }
    }
};
const initialize = (u0 = 0.1) => {
    let xcoord = 0;
    let ycoord = 0;
    for (let i = 0; i < height * width; i++) {
        n0[i] = four9ths * (1 - 1.5 * (u0 ** 2.));
        nN[i] = one9th * (1 - 1.5 * (u0 ** 2.));
        nS[i] = one9th * (1 - 1.5 * (u0 ** 2.));
        nE[i] = one9th * (1 + 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.));
        nW[i] = one9th * (1 - 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.));
        nNE[i] = one36th * (1 + 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.));
        nSE[i] = one36th * (1 + 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.));
        nNW[i] = one36th * (1 - 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.));
        nSW[i] = one36th * (1 - 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.));
        rho[i] = n0[i] + nN[i] + nS[i] + nE[i] + nW[i] + nNE[i] + nSE[i] + nNW[i] + nSW[i];
        ux[i] = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) * (1 - (rho[i] - 1) + ((rho[i] - 1) ** 2.));
        uy[i] = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) * (1 - (rho[i] - 1) + ((rho[i] - 1) ** 2.));
        xcoord = (xcoord + 1) < (width - 1) ? xcoord + 1 : 0;
        ycoord = xcoord != 0 ? ycoord : ycoord + 1;
    }
};
const createWall = (x, y) => {
    bar[flatten2D(x, y)] = 1;
};
const removeWall = (x, y) => {
    bar[flatten2D(x, y)] = 0;
};
const handleBoundaries = () => {
};
const offsetX = (canvas.width - width * DRAW_SCALE_X) / 2;
const offsetY = 0;
const draw = (id, rho, ux, uy, speed2) => {
    const actualOffset = offsetY + id * height * DRAW_SCALE_X;
    for (let x = 2; x < width - 2; x++) {
        for (let y = 2; y < height - 10; y++) {
            const i = y * width + x;
            if (bar[i]) {
                ctx.fillStyle = "black";
                ctx.fillRect(offsetX + x * DRAW_SCALE_X, actualOffset + y * DRAW_SCALE_X, DRAW_SCALE_X, DRAW_SCALE_X);
            }
            else {
                let c = 0;
                switch (plotOption) {
                    case "rho":
                        c = 1 * Math.floor(200 * (rho[i] ** 6));
                        ctx.fillStyle = `rgb(${c}, ${c}, ${c})`;
                        break;
                    case "vx":
                        c = 10 * Math.floor(255 * ux[i]);
                        ctx.fillStyle = `rgb(${0}, ${c}, ${c})`;
                        break;
                    case "vy":
                        c = 10 * Math.floor(255 * uy[i]);
                        ctx.fillStyle = `rgb(${125 + c}, ${125 + c}, ${0})`;
                        break;
                    case "speed":
                        c = 5 * Math.floor(255 * Math.sqrt(speed2[i]));
                        ctx.fillStyle = `rgb(${c}, ${c}, ${c})`;
                        break;
                    case "curl":
                        c = 15 * Math.floor(255 * (uy[x + 1 + y * width] - uy[x - 1 + y * width] - ux[x + (y + 1) * width] + ux[x + (y - 1) * width]));
                        ctx.fillStyle = `rgb(${Math.max(0, c)}, ${0}, ${Math.max(0, -c)})`;
                        break;
                }
                ctx.fillRect(offsetX + x * DRAW_SCALE_X, actualOffset + y * DRAW_SCALE_X, DRAW_SCALE_X, DRAW_SCALE_X);
            }
        }
    }
};
let time = performance.now();
let iterationCounter = 0;
const tick = () => {
    if (paused) {
        return;
    }
    for (let iter = 0; iter < CALC_DRAW_RATIO; iter++) {
        stream();
        bounce();
        collide();
    }
    draw(0, rho, ux, uy, speed2);
    animVal = requestAnimationFrame(tick);
    const newTime = performance.now();
    time = newTime;
};
initialize(u0);
const drawBlock = (Block_Height, Block_width, pos_X_block, pos_Y_block) => {
    for (let i = pos_X_block; i < pos_X_block + Block_width; i++) {
        for (let j = Math.floor(Math.abs((pos_Y_block) - Block_Height / 2)) - 1; j < (pos_Y_block) + Block_Height / 2; j++) {
            createWall(i, j);
        }
    }
};
const drawCircleBarrier = (radius, pos_X) => {
    const pos_Y = Math.floor(height / 2);
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            if ((D_Square(i, j, pos_X, pos_Y)) <= radius ** 2 - 0.001) {
                createWall(i, j);
            }
        }
    }
};
const drawramp = (ramp_H, pos_X_ramp, pos_Y_ramp) => {
    for (let i = pos_X_ramp; i < ramp_H + pos_X_ramp; i++) {
        for (let j = pos_Y_ramp; j < i + pos_Y_ramp - pos_X_ramp; j++) {
            createWall(i, j);
        }
    }
    for (let i = pos_X_ramp; i < pos_X_ramp + ramp_H; i++) {
        for (let j = pos_Y_ramp; j > pos_Y_ramp - i + pos_X_ramp; j--) {
            createWall(i, j);
        }
    }
};
const drawinvertedramp = (ramp_H, pos_X_ramp, pos_Y_ramp) => {
    for (let i = ramp_H + pos_X_ramp; i >= pos_X_ramp; i--) {
        for (let j = ramp_H - i + pos_Y_ramp + pos_X_ramp; j > pos_Y_ramp; j--) {
            removeWall(i, j);
        }
    }
    for (let i = pos_X_ramp; i < pos_X_ramp + ramp_H; i++) {
        for (let j = pos_Y_ramp - ramp_H + (i - pos_X_ramp); j <= pos_Y_ramp; j++) {
            removeWall(i, j);
        }
    }
};
drawCircleBarrier(10, 35);
let isDrawing = false;
const getMousePosition = (e) => {
    const rect = canvas.getBoundingClientRect();
    const posX = Math.floor((e.clientX - rect.left - offsetX) * width / (rect.width - 2 * offsetX));
    const posY = Math.floor((e.clientY - rect.top - offsetY) * height / (rect.height - 2 * offsetY));
    return { posX, posY };
};
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const { posX, posY } = getMousePosition(e);
    if (multiSimCHeckbox.checked) {
        return;
    }
    if (posX >= 2 && posX < width - 2 && posY >= 2 && posY < height - 10) {
        createWall(posX, posY);
    }
});
canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing)
        return; //
    if (multiSimCHeckbox.checked) {
        return;
    }
    const { posX, posY } = getMousePosition(e);
    if (posX >= 2 && posX < width - 2 && posY >= 2 && posY < height - 10) {
        createWall(posX, posY);
        createWall(posX + 1, posY);
        createWall(posX - 1, posY);
        createWall(posX, posY + 1);
        createWall(posX, posY - 1);
        createWall(posX + 1, posY + 1);
        createWall(posX - 1, posY - 1);
        createWall(posX + 1, posY - 1);
        createWall(posX - 1, posY + 1);
    }
});
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});
canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
});
console.log();
time = performance.now();
let workers = [];
for (let i = 0; i < NoOfWorkers; i++) {
    workers.push(new Worker("worker1.js"));
}
const setup = () => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < NoOfWorkers; i++) {
        workers[i].postMessage({
            messageType: "initialize",
            id: i,
            viscosity,
            height,
            width,
            CALC_DRAW_RATIO,
            u0, n0, nN, nS, nE, nW,
            nNE, nNW, nSE, nSW,
            bar, rho, ux, uy, speed2, functionArguments
        });
        yield new Promise((resolve) => setTimeout(resolve, 50));
    }
});
const constUpdateViscosity = () => {
    for (let i = 0; i < NoOfWorkers; i++) {
        workers[i].postMessage({
            messageType: "updateViscosity",
            viscosity
        });
    }
};
for (let i = 0; i < NoOfWorkers; i++) {
    workers[i].onmessage = (e) => {
        draw(e.data.id, e.data.rho, e.data.ux, e.data.uy, e.data.speed2);
    };
}
let IDsToUse = [];
const viscositySlider = document.getElementById("viscositySlider");
const multiSimCHeckbox = document.getElementById("multiSimCheckbox");
const multiSimControls = document.getElementById('multiSimControls');
const checkboxesContainer = document.getElementById('checkboxes');
const submitBtn = document.getElementById('submitBtn');
const disclaimer = document.getElementById('disclaimer');
function showDisclaimer() {
    disclaimer.innerText = 'Click "r" or click here to submit';
}
function hideDisclaimer() {
    disclaimer.innerText = '';
}
multiSimCHeckbox.addEventListener("change", function () {
    if (this.checked) {
        cancelAnimationFrame(animVal);
        showDisclaimer();
        bar = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        viscositySlider.disabled = true;
        playPauseButton.disabled = true;
        multiSimControls.style.display = 'flex';
        checkboxesContainer.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const checkboxWrapper = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${i}`;
            const label = document.createElement('label');
            label.setAttribute('for', checkbox.id);
            if (i === 1) {
                label.textContent = `Pacman`;
            }
            if (i === 2) {
                label.textContent = `Horizontal Rectangle`;
            }
            if (i === 3) {
                label.textContent = `Vertical Rectangle`;
            }
            if (i === 4) {
                label.textContent = `Small Circle`;
            }
            if (i === 5) {
                label.textContent = `Big Circle`;
            }
            if (i === 6) {
                label.textContent = `Multi Bump`;
            }
            if (i === 7) {
                label.textContent = `Ramp`;
            }
            if (i === 8) {
                label.textContent = `Multi Ramp`;
            }
            if (i === 9) {
                label.textContent = `Inverted Ramp`;
            }
            if (i === 10) {
                label.textContent = `Vertical Line`;
            }
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            checkboxesContainer.appendChild(checkboxWrapper);
        }
        for (let i = 0; i < workers.length; i++) {
            workers[i].terminate();
        }
        for (let i = 0; i < IDsToUse.length; i++) {
            workers.push(new Worker("worker1.js"));
            workers[i].postMessage({
                messageType: "initialize",
                posId: i,
                id: IDsToUse[i],
                viscosity,
                height,
                width,
                CALC_DRAW_RATIO,
                u0, n0, nN, nS, nE, nW,
                nNE, nNW, nSE, nSW,
                bar, rho, ux, uy, speed2
            });
        }
    }
    else {
        canvas.height = window.innerHeight * devicePixelRatio;
        hideDisclaimer();
        viscositySlider.disabled = false;
        playPauseButton.disabled = false;
        multiSimControls.style.display = 'none';
        drawCircleBarrier(10, 35);
        tick();
    }
});
const createWebWorkerSims = (IDsToUse) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.height = window.innerHeight * devicePixelRatio * IDsToUse.length * 1.1;
    for (let i = 0; i < workers.length; i++) {
        workers[i].terminate();
    }
    workers = [];
    for (let i = 0; i < IDsToUse.length; i++) {
        workers.push(new Worker("worker1.js"));
    }
    for (let i = 0; i < IDsToUse.length; i++) {
        workers[i].postMessage({
            messageType: "initialize",
            posId: i,
            id: IDsToUse[i],
            viscosity,
            height,
            width,
            CALC_DRAW_RATIO,
            u0, n0, nN, nS, nE, nW,
            nNE, nNW, nSE, nSW,
            bar, rho, ux, uy, speed2
        });
    }
    for (let i = 0; i < workers.length; i++) {
        workers[i].onmessage = (e) => {
            draw(e.data.posId, e.data.rho, e.data.ux, e.data.uy, e.data.speed2);
        };
    }
};
const performMultiSim = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.height = window.innerHeight * devicePixelRatio * 1.1;
    cancelAnimationFrame(animVal);
    console.log('Submit button clicked');
    IDsToUse = [];
    const checkboxes = checkboxesContainer.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        IDsToUse.push(parseInt(checkbox.id));
    });
    console.log('Selected IDs:', IDsToUse);
    canvas.height = window.innerHeight * devicePixelRatio * IDsToUse.length * 1.1;
    createWebWorkerSims(IDsToUse);
};
document.addEventListener('keydown', (e) => {
    if (e.key === 'r') {
        if (multiSimCHeckbox.checked) {
            performMultiSim();
        }
    }
});
submitBtn.addEventListener('click', () => {
    performMultiSim();
});
disclaimer.addEventListener('click', (e) => {
    if (multiSimCHeckbox.checked) {
        performMultiSim();
    }
});
viscositySlider.addEventListener("input", () => {
    viscosity = parseFloat(viscositySlider.value) * multiplier;
    omega = 1 / (3 * viscosity + 0.5);
});
tick();
