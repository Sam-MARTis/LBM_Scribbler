const canvas = document.getElementById("projectCanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const height = 100
const width = 200
const multiplier = 1.5
let viscosity = 0.005 * multiplier
let omega = 1 / (3 * viscosity + 0.5)
const u0 = 0.2 / multiplier
const four9ths = 4. / 9.
const one9th = 1. / 9.
const one36th = 1. / 36.
const CALC_DRAW_RATIO = 4
const DRAW_SCALE_X = 1 * canvas.width / width
const maxSpeed = 0.4;
let n0 = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let nN = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let nS = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let nE = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let nW = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let nNW = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let nNE = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let nSE = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let nSW = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))

let bar = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))

let rho = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let ux = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let uy = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let speed2 = new Float32Array(new ArrayBuffer(height * width * Float32Array.BYTES_PER_ELEMENT))
let plotOption: String = "curl";

const plotSelect = document.getElementById("plotOptions") as HTMLSelectElement;

// Add an event listener to detect changes in the dropdown
plotSelect.addEventListener("change", () => {
    // Update the PlotOption variable to the selected value
    plotOption = plotSelect.value;
});

let paused = false;

let animVal: number | null = null;
const but1 = document.getElementById("but1") as HTMLButtonElement;

// but1.addEventListener("click", () => {
//     paused = !paused;  // Toggle the paused state
//     if (!paused) {
//         // Resume the animation
//         tick();
//     } else {
//         // Pause the animation by canceling the next frame
//         if (animVal !== null) {
//             cancelAnimationFrame(animVal);
//         }
//     }
// });

const viscositySlider = document.getElementById("viscositySlider") as HTMLInputElement;

// Add an event listener to detect changes in the slider
viscositySlider.addEventListener("input", () => {
    // Update the viscosity variable to the slider's current value
    viscosity = parseFloat(viscositySlider.value) * multiplier;
    omega = 1 / (3 * viscosity + 0.5)
    // console.log(`Viscosity updated to: ${viscosity}`);
});


const flatten2D = (i: number, j: number): number => {
    return j * width + i
}

const D_Square = (x1: number, y1: number, x2: number, y2: number): number => {
    return ((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2))
}

const stream = () => {


    // for x in range(0, width-1):
    for (let x = 0; x < width - 1; x++) {
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {

            nN[y * width + x] = nN[y * width + x + width]

            nNW[y * width + x] = nNW[y * width + x + width + 1]

            nW[y * width + x] = nW[y * width + x + 1]

            nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x]

            nSW[(height - y - 1) * width + x] = nSW[(height - y - 1 - 1) * width + x + 1]

            nE[y * width + (width - x - 1)] = nE[y * width + (width - (x + 1) - 1)]

            nNE[y * width + (width - x - 1)] = nNE[y * width + width + (width - (x + 1) - 1)]

            nSE[(height - y - 1) * width + (width - x - 1)] = nSE[(height - y - 1 - 1) * width +
                (width - (x + 1) - 1)]
        }
    }


    const x = width;
    // for y in range(1, height-1):
    for (let y = 1; y < height - 1; y++) {


        nN[y * width + x] = nN[y * width + x + width]

        nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x]
    }
}
const ensureStability = () => {
    for(let i = 0; i<height*width; i++){
        n0[i] = n0[1]>maxSpeed? maxSpeed: n0[i]
        nN[i] = nN[1]>maxSpeed? maxSpeed: nN[i]
        nS[i] = nS[1]>maxSpeed? maxSpeed: nS[i]
        nE[i] = nE[1]>maxSpeed? maxSpeed: nE[i]
        nW[i] = nW[1]>maxSpeed? maxSpeed: nW[i]
        nNE[i] = nNE[1]>maxSpeed? maxSpeed: nNE[i]
        nNW[i] = nNW[1]>maxSpeed? maxSpeed: nNW[i]
        nSE[i] = nSE[1]>maxSpeed? maxSpeed: nSE[i]
        nSW[i] = nSW[1]>maxSpeed? maxSpeed: nSW[i]

    }
}
const bounce = () => {


    // for x in range(2, width-2):
    //     for y in range(2, height-2):
    for (let x = 2; x < width - 2; x++) {
        for (let y = 2; y < height - 2; y++) {


            // if (bar[y*width + x]):
            if (bar[y * width + x]) {
                //Barrier bounces the velocity back


                nN[(y - 1) * width + x] = nS[y * width + x]
                nS[(y + 1) * width + x] = nN[y * width + x]
                nE[y * width + x + 1] = nW[y * width + x]
                nW[y * width + (x - 1)] = nE[y * width + x]
                nNE[(y - 1) * width + (x + 1)] = nSW[y * width + x]
                nNW[(y - 1) * width + (x - 1)] = nSE[y * width + x]
                nSE[(y + 1) * width + (x + 1)] = nNW[y * width + x]
                nSW[(y + 1) * width + (x - 1)] = nNE[y * width + x]


                n0[y * width + x] = 0
                nN[y * width + x] = 0
                nS[y * width + x] = 0
                nE[y * width + x] = 0
                nW[y * width + x] = 0
                nNE[y * width + x] = 0
                nNW[y * width + x] = 0
                nSE[y * width + x] = 0
                nSW[y * width + x] = 0
            }
        }
    }
}

// def collide():
const collide = () => {

    // for x in range(1, width-1):
    //     for y in range(1, height-1):
    for (let x = 1; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {


            let i = y * width + x


            // if (bar[i]):
            //     continue

            if (bar[i]) {
                continue
            }

            else {

                rho[i] = n0[i] + nN[i] + nE[i] + nS[i] + nW[i] + nNE[i] + nSE[i] + nSW[i] + nNW[i]

                // if (rho[i] > 0):
                if (rho[i] > 0) {
                    ux[i] = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) * (1 - (rho[i] - 1) + ((rho[i] - 1) ** 2.))
                    uy[i] = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) * (1 - (rho[i] - 1) + ((rho[i] - 1) ** 2.))
                }

                // one9th_rho = one9th * rho[i]
                // one36th_rho = one36th * rho[i]
                // vx3 = 3 * ux[i]
                // vy3 = 3 * uy[i]
                // vx2 = ux[i] * ux[i]
                // vy2 = uy[i] * uy[i]
                // vxvy2 = 2 * ux[i] * uy[i]
                // v2 = vx2 + vy2
                // speed2[i] = v2
                // v215 = 1.5 * v2
                const one9th_rho = one9th * rho[i]
                const one36th_rho = one36th * rho[i]
                const vx3 = 3 * ux[i]
                const vy3 = 3 * uy[i]
                const vx2 = ux[i] * ux[i]
                const vy2 = uy[i] * uy[i]
                const vxvy2 = 2 * ux[i] * uy[i]
                const v2 = vx2 + vy2
                speed2[i] = v2
                const v215 = 1.5 * v2



                nE[i] += omega * (one9th_rho * (1 + vx3 + 4.5 * vx2 - v215) - nE[i])
                nW[i] += omega * (one9th_rho * (1 - vx3 + 4.5 * vx2 - v215) - nW[i])
                nN[i] += omega * (one9th_rho * (1 + vy3 + 4.5 * vy2 - v215) - nN[i])
                nS[i] += omega * (one9th_rho * (1 - vy3 + 4.5 * vy2 - v215) - nS[i])
                nNE[i] += omega * (one36th_rho * (1 + vx3 + vy3 + 4.5 * (v2 + vxvy2) - v215) - nNE[i])
                nNW[i] += omega * (one36th_rho * (1 - vx3 + vy3 + 4.5 * (v2 - vxvy2) - v215) - nNW[i])
                nSE[i] += omega * (one36th_rho * (1 + vx3 - vy3 + 4.5 * (v2 - vxvy2) - v215) - nSE[i])
                nSW[i] += omega * (one36th_rho * (1 - vx3 - vy3 + 4.5 * (v2 + vxvy2) - v215) - nSW[i])


                n0[i] = rho[i] - (nE[i] + nW[i] + nN[i] + nS[i] + nNE[i] + nSE[i] + nNW[i] + nSW[i]);
            }
        }
    }
}


// def initialize(xtop, ytop, yheight, u0=u0):
//     xcoord = 0
//     ycoord = 0

//     count = 0
//     for i in range(height*width):
//         n0[i] = four9ths* (1 - 1.5*(u0**2.))
//         nN[i] = one9th  * (1 - 1.5*(u0**2.))
//         nS[i] = one9th  * (1 - 1.5*(u0**2.))
//         nE[i] = one9th  * (1 + 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
//         nW[i] = one9th  * (1 - 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
//         nNE[i]= one36th * (1 + 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
//         nSE[i]= one36th * (1 + 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
//         nNW[i]= one36th * (1 - 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
//         nSW[i]= one36th * (1 - 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))

//         rho[i] =  n0[i] + nN[i] + nS[i] + nE[i] + nW[i] + nNE[i] + nSE[i] + nNW[i] + nSW[i]

//         ux[i]  = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) * (1-(rho[i]-1)+((rho[i]-1)**2.))
//         uy[i]  = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) * (1-(rho[i]-1)+((rho[i]-1)**2.))

//         if (xcoord==xtop):
//             if (ycoord >= ytop):
//                 if (ycoord < (ytop+yheight)):
//                     count += 1
//                     bar[ycoord*width + xcoord] = 1

//         xcoord = (xcoord+1) if xcoord<(width-1) else 0
//         ycoord = ycoord if (xcoord != 0) else (ycoord + 1)


const initialize = (u0: number = 0.1) => {
    let xcoord = 0
    let ycoord = 0

    for (let i = 0; i < height * width; i++) {
        n0[i] = four9ths * (1 - 1.5 * (u0 ** 2.))
        nN[i] = one9th * (1 - 1.5 * (u0 ** 2.))
        nS[i] = one9th * (1 - 1.5 * (u0 ** 2.))
        nE[i] = one9th * (1 + 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.))
        nW[i] = one9th * (1 - 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.))
        nNE[i] = one36th * (1 + 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.))
        nSE[i] = one36th * (1 + 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.))
        nNW[i] = one36th * (1 - 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.))
        nSW[i] = one36th * (1 - 3 * u0 + 4.5 * (u0 ** 2.) - 1.5 * (u0 ** 2.))

        rho[i] = n0[i] + nN[i] + nS[i] + nE[i] + nW[i] + nNE[i] + nSE[i] + nNW[i] + nSW[i]

        ux[i] = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) * (1 - (rho[i] - 1) + ((rho[i] - 1) ** 2.))
        uy[i] = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) * (1 - (rho[i] - 1) + ((rho[i] - 1) ** 2.))


        xcoord = (xcoord + 1) < (width - 1) ? xcoord + 1 : 0
        ycoord = xcoord != 0 ? ycoord : ycoord + 1
    }
}
const createWall = (x: number, y: number) => {
    bar[flatten2D(x, y)] = 1
}
const removeWall = (x: number, y: number) => {
    bar[flatten2D(x, y)] = 0;
}

const handleBoundaries = () => {

}
const NoOfWorkers = 2;

const offsetX = (canvas.width - width * DRAW_SCALE_X) / 2;
// const offsetY = (canvas.height - height * DRAW_SCALE_X) / 2;
const offsetY = 0
const draw = (id: number, rho:Float32Array, ux:Float32Array, uy: Float32Array, speed2: Float32Array) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const actualOffset = offsetY + id*height*DRAW_SCALE_X
  

  for (let x = 2; x < width - 2; x++) {
      for (let y = 2; y < height - 10; y++) {
          const i = y * width + x;

            if (bar[i]) {
                ctx.fillStyle = "black";
                ctx.fillRect(offsetX + x * DRAW_SCALE_X, actualOffset + y * DRAW_SCALE_X, DRAW_SCALE_X, DRAW_SCALE_X);
            } else {
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
                        ctx.fillStyle = `rgb(${125+c}, ${125+c}, ${0})`;
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
                // const c = 3000 * (uy[x + 1 + y * width] - uy[x - 1 + y * width] - ux[x + (y + 1) * width] + ux[x + (y - 1) * width]);
                // ctx.fillStyle = `rgb(${Math.max(0, c)}, ${0}, ${Math.max(0, -c)})`;
                ctx.fillRect(offsetX + x * DRAW_SCALE_X, actualOffset + y * DRAW_SCALE_X, DRAW_SCALE_X, DRAW_SCALE_X);
            }
        }
    }
};


let time = performance.now();
let iterationCounter = 0;  

// const tick = () => {
//     if (paused) {
//         return;
//     }
//     for (let iter = 0; iter < CALC_DRAW_RATIO; iter++) {
//         stream()
//         bounce()
//         collide()
//     }
//     // ensureStability()   
//     draw()
//     animVal = requestAnimationFrame(tick)
//     const newTime = performance.now()

//     time = newTime

// }



initialize(u0)

const drawBlock =(Block_Height:number,Block_width:number, pos_X_block:number, pos_Y_block:number):void =>{
    for(let i = pos_X_block; i<pos_X_block+Block_width; i++){
        for(let j = Math.floor(Math.abs((pos_Y_block)-Block_Height/2))-1; j<(pos_Y_block)+Block_Height/2; j++){
            createWall(i,j);
        }
    }
}
// drawBlock(5,15,25,25)

//creat Circle
const drawCircleBarrier = (radius: number, pos_X: number): void => {
    const pos_Y = Math.floor(height / 2);
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            if ((D_Square(i, j, pos_X, pos_Y)) <= radius ** 2 - 0.001) {
                createWall(i, j)
            }
        }
    }
}
// drawCircleBarrier(5, 60)
// drawCircleBarrier(7,90)

// creat ramp but ..
const drawramp = (ramp_H:number, pos_X_ramp:number, pos_Y_ramp:number): void =>{
    for (let i = pos_X_ramp ; i < ramp_H + pos_X_ramp; i++) {
        for (let j = pos_Y_ramp; j < i + pos_Y_ramp -pos_X_ramp; j++) {
            createWall(i, j);
        }
    }
    for(let i= pos_X_ramp; i< pos_X_ramp+ ramp_H; i++){
        for(let j=pos_Y_ramp; j>pos_Y_ramp-i+pos_X_ramp; j--){
            createWall(i,j)
        }
    }
}

// creat invertedramp but ..
const drawinvertedramp = (ramp_H:number, pos_X_ramp:number, pos_Y_ramp:number): void =>{
    for (let i =ramp_H+ pos_X_ramp ; i >= pos_X_ramp; i--) {
        for (let j = ramp_H -i + pos_Y_ramp +pos_X_ramp; j > pos_Y_ramp; j--) {
            removeWall(i, j);
        }
    }
    for(let i= pos_X_ramp; i< pos_X_ramp+ ramp_H; i++){
        for(let j=pos_Y_ramp-ramp_H + (i-pos_X_ramp); j<=pos_Y_ramp; j++){
            removeWall(i,j)
        }
    }
}

// drawCircleBarrier(10,35)
// drawinvertedramp(8,25,50)









let isDrawing = false; 

const getMousePosition = (e:MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const posX = Math.floor((e.clientX - rect.left - offsetX)*width / (rect.width-2*offsetX));
    const posY = Math.floor((e.clientY - rect.top - offsetY) *height/ (rect.height-2*offsetY));
    return { posX, posY };
};

// canvas.addEventListener("mousedown", (e) => {
//     isDrawing = true;
//     const { posX, posY } = getMousePosition(e);

 
//     if (posX >= 2 && posX < width - 2 && posY >= 2 && posY < height - 10) {
//         createWall(posX, posY);
//     }
// });

// canvas.addEventListener("mousemove", (e) => {
//     if (!isDrawing) return;  //

//     const { posX, posY } = getMousePosition(e);

    
//     if (posX >= 2 && posX < width - 2 && posY >= 2 && posY < height - 10) {
//         createWall(posX, posY);
//         createWall(posX+1, posY);
//         createWall(posX-1, posY);
//         createWall(posX, posY+1);
//         createWall(posX, posY-1);
//         createWall(posX+1, posY+1);
//         createWall(posX-1, posY-1);
//         createWall(posX+1, posY-1);
//         createWall(posX-1, posY+1);

//     }
// });


// canvas.addEventListener("mouseup", () => {
//     isDrawing = false;
// });


// canvas.addEventListener("mouseleave", () => {
//     isDrawing = false;
// });


console.log()
// drawCircleBarrier(7,90)"Initialization took", performance.now()-time, "ms")
time = performance.now()
// tick()

const worker1 = new Worker("worker1.js");
const worker2 = new Worker("worker1.js");
const setup = () => {
    worker1.postMessage({id: 0, viscosity, height, width, CALC_DRAW_RATIO, u0, n0, nN, nS, nE, nW, nNE, nNW, nSE, nSW, bar, rho, ux, uy, speed2 });
    worker2.postMessage({id: 1, viscosity, height, width, CALC_DRAW_RATIO, u0, n0, nN, nS, nE, nW, nNE, nNW, nSE, nSW, bar, rho, ux, uy, speed2 });

}
worker1.onmessage = (e) => {
    // const { id, rho, ux, uy, bar } = e.data;
    draw(e.data.id, e.data.rho, e.data.ux, e.data.uy, e.data.speed2);
};
setup()