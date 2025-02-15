
const canvas = document.getElementById("projectCanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const WIDTH = 256
const HEIGHT = 64
const array1 = new Float32Array(WIDTH * HEIGHT).fill(0)
// const n0 =new Float32Array(WIDTH*HEIGHT)
const viscosity = 0.02
const omega = 1. / (3 * viscosity + 0.5)
const u0 = 0.1
const four9ths = 4./9.                // # a constant
const one9th   = 1./9.                 //# a constant
const one36th  = 1./36.               // # a constant

// Directions
const n0 = new Float32Array(WIDTH * HEIGHT).fill(0)
const nN = new Float32Array(WIDTH * HEIGHT).fill(0)
const nS = new Float32Array(WIDTH * HEIGHT).fill(0)
const nE = new Float32Array(WIDTH * HEIGHT).fill(0)
const nW = new Float32Array(WIDTH * HEIGHT).fill(0)
const nNE = new Float32Array(WIDTH * HEIGHT).fill(0)
const nNW = new Float32Array(WIDTH * HEIGHT).fill(0)
const nSE = new Float32Array(WIDTH * HEIGHT).fill(0)
const nSW = new Float32Array(WIDTH * HEIGHT).fill(0)
// Barriers
const bar = new Float32Array(WIDTH * HEIGHT).fill(0)
// Macro
const rho = new Float32Array(WIDTH * HEIGHT).fill(0)
const ux = new Float32Array(WIDTH * HEIGHT).fill(0)
const uy = new Float32Array(WIDTH * HEIGHT).fill(0)
const speed2 = new Float32Array(WIDTH * HEIGHT).fill(0)

// function Flatten2D(x:number,y:number){
//     let n = (y*WIDTH)+x;
//     console.log(n);
// }
const Flatten2D = (x: number, y: number): number => {
    return (y * WIDTH) + x;

}



// function Expand1D(m:number){
//     let y = (m/WIDTH);
//     let x = m%WIDTH;
//     console.log(Math.floor(y), x);
// }

const Expand2D = (k: number): [number, number] => {
    return [(k % WIDTH), Math.floor(k / WIDTH)]
}
//const gpu = new GPU();
//
//const kernel = gpu.createKernel(Stream () {
//    return this.thread.x * 2;
//   x = this.thread.x;
//   y = this.thread.y;
//
//const Stream = (): void => {
//    for (let x = 0; x < WIDTH - 1; x++) {
//        for (let y = 1; y < HEIGHT - 1; y++) {
//            // # Movement north (Northwest corner)
//            nN[y * WIDTH + x] = nN[y * WIDTH + x + WIDTH]
//            // # Movement northwest (Northwest corner)
//            nNW[y * WIDTH + x] = nNW[y * WIDTH + x + WIDTH + 1]
//            // # Movement west (Northwest corner)
//            nW[y * WIDTH + x] = nW[y * WIDTH + x + 1]
//            // # Movement south (Southwest corner)
//            nS[(HEIGHT - y - 1) * WIDTH + x] = nS[(HEIGHT - y - 1 - 1) * WIDTH + x]
//            // # Movement southwest (Southwest corner)
//            nSW[(HEIGHT - y - 1) * WIDTH + x] = nSW[(HEIGHT - y - 1 - 1) * WIDTH + x + 1]
//            // # Movement east (Northeast corner)
//            nE[y * WIDTH + (WIDTH - x - 1)] = nE[y * WIDTH + (WIDTH - (x + 1) - 1)]
//            // # Movement northeast (Northeast corner)
//            nNE[y * WIDTH + (WIDTH - x - 1)] = nNE[y * WIDTH + WIDTH + (WIDTH - (x + 1) - 1)]
//            // # Movement southeast (Southeast corner)
//            nSE[(HEIGHT - y - 1) * WIDTH + (WIDTH - x - 1)] = nSE[(HEIGHT - y - 1 - 1) * WIDTH + (WIDTH - (x + 1) - 1)]
//        }
//        x += 1;
//        for (let y = 1; y < HEIGHT - 1; y++) {
//            // # Movement north on right boundary (Northwest corner)
//            nN[y * WIDTH + x] = nN[y * WIDTH + x + WIDTH]
//            // # Movement south on right boundary (Southwest corner)
//            nS[(HEIGHT - y - 1) * WIDTH + x] = nS[(HEIGHT - y - 1 - 1) * WIDTH + x]
//        }
//    }
//}
//});

function stream(nN:any, nNW:any, nW:any, nS: any, nSW: any, nE: any, nNE: any, nSE: any, width: any, height: any) {
    // Stream all internal cells
    for (let x = 0; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
            // Movement north (Northwest corner)
            nN[y * width + x] = nN[y * width + x + width];
            // Movement northwest (Northwest corner)
            nNW[y * width + x] = nNW[y * width + x + width + 1];
            // Movement west (Northwest corner)
            nW[y * width + x] = nW[y * width + x + 1];
            // Movement south (Southwest corner)
            nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x];
            // Movement southwest (Southwest corner)
            nSW[(height - y - 1) * width + x] = nSW[(height - y - 1 - 1) * width + x + 1];
            // Movement east (Northeast corner)
            nE[y * width + (width - x - 1)] = nE[y * width + (width - (x + 1) - 1)];
            // Movement northeast (Northeast corner)
            nNE[y * width + (width - x - 1)] = nNE[y * width + width + (width - (x + 1) - 1)];
            // Movement southeast (Southeast corner)
            nSE[(height - y - 1) * width + (width - x - 1)] = nSE[(height - y - 1 - 1) * width + (width - (x + 1) - 1)];
        }
    }function createWorker(array:any, type:any) {
        return new Promise<void>((resolve) => {
            const worker = new Worker("worker.js");
            worker.postMessage({ array, width, height, type });
    
            worker.onmessage = (e) => {
                switch (e.data.type) {
                    case "nN": nN = e.data.updatedArray; break;
                    case "nNW": nNW = e.data.updatedArray; break;
                    case "nW": nW = e.data.updatedArray; break;
                    case "nS": nS = e.data.updatedArray; break;
                    case "nSW": nSW = e.data.updatedArray; break;
                    case "nE": nE = e.data.updatedArray; break;
                    case "nNE": nNE = e.data.updatedArray; break;
                    case "nSE": nSE = e.data.updatedArray; break;
                }
                worker.terminate();
                resolve ();
            };
        });
    }
    
    // Run all workers in parallel
    async function runWorkers() {
        await Promise.all([
            createWorker(nN, "nN"),
            createWorker(nNW, "nNW"),
            createWorker(nW, "nW"),
            createWorker(nS, "nS"),
            createWorker(nSW, "nSW"),
            createWorker(nE, "nE"),
            createWorker(nNE, "nNE"),
            createWorker(nSE, "nSE")
        ]);
        console.log("All Web Workers completed their tasks!");
}

// Start the process
runWorkers();

    // Tidy up the edges
    let x = width - 1; // Correcting x value for edge case
    for (let y = 1; y < height - 1; y++) {
        // Movement north on right boundary (Northwest corner)
        nN[y * width + x] = nN[y * width + x + width];
        // Movement south on right boundary (Southwest corner)
        nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x];
    }
}

// Run the kernel had we used GPU .js 
//StreamKernel(nN, nNW, nW, nS, nSW, nE, nNE, nSE, WIDTH, HEIGHT);

const Bounce = (): void => {
    for (let x = 2; x<WIDTH-2; x++){
        for (let y = 2; y<HEIGHT-2; y++){
            if(bar[y*WIDTH + x]){
                // # Push densities back from whence they came
                nN[(y-1)*WIDTH + x] = nS[y*WIDTH + x]
                nS[(y+1)*WIDTH + x] = nN[y*WIDTH + x]
                nE[y*WIDTH + x + 1] = nW[y*WIDTH + x]
                nW[y*WIDTH + (x-1)] = nE[y*WIDTH + x]    
                nNE[(y-1)*WIDTH + (x+1)] = nSW[y*WIDTH + x]
                nNW[(y-1)*WIDTH + (x-1)] = nSE[y*WIDTH + x]
                nSE[(y+1)*WIDTH + (x+1)] = nNW[y*WIDTH + x]
                nSW[(y+1)*WIDTH + (x-1)] = nNE[y*WIDTH + x]
                
                // # Clear the densities in the barrier cells
                n0[y*WIDTH + x] = 0
                nN[y*WIDTH + x] = 0
                nS[y*WIDTH + x] = 0
                nE[y*WIDTH + x] = 0
                nW[y*WIDTH + x] = 0
                nNE[y*WIDTH + x] = 0
                nNW[y*WIDTH + x] = 0
                nSE[y*WIDTH + x] = 0
                nSW[y*WIDTH + x] = 0
            }
        }
    }
}


const Collide = (): void => {
    for (let x = 1; x<WIDTH-1; x++){
        for (let y = 1; y<HEIGHT-1; y++){
            const i = (y*WIDTH) + x;
            // # Skip over cells containing barriers
            if (bar[i]){
                continue
            }
            else{
                // # Compute the macroscopic density
                rho[i] = n0[i] + nN[i] + nE[i] + nS[i] + nW[i] + nNE[i] + nSE[i] + nSW[i] + nNW[i];
                // # Compute the macroscopic velocities
                if (rho[i] > 0){
                    ux[i]  = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) * (1-(rho[i]-1)+((rho[i]-1)**2.))
                    uy[i]  = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) * (1-(rho[i]-1)+((rho[i]-1)**2.))
                    
                // # Pre-compute some convenient constants
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
                
                // # Update densities
                nE[i]  += omega * (   one9th_rho * (1 + vx3       + 4.5*vx2        - v215) - nE[i])
                nW[i]  += omega * (   one9th_rho * (1 - vx3       + 4.5*vx2        - v215) - nW[i])
                nN[i]  += omega * (   one9th_rho * (1 + vy3       + 4.5*vy2        - v215) - nN[i])
                nS[i]  += omega * (   one9th_rho * (1 - vy3       + 4.5*vy2        - v215) - nS[i])
                nNE[i] += omega * (  one36th_rho * (1 + vx3 + vy3 + 4.5*(v2+vxvy2) - v215) - nNE[i])
                nNW[i] += omega * (  one36th_rho * (1 - vx3 + vy3 + 4.5*(v2-vxvy2) - v215) - nNW[i])
                nSE[i] += omega * (  one36th_rho * (1 + vx3 - vy3 + 4.5*(v2-vxvy2) - v215) - nSE[i])
                nSW[i] += omega * (  one36th_rho * (1 - vx3 - vy3 + 4.5*(v2+vxvy2) - v215) - nSW[i])
                
                // # Conserve mass
                n0[i]   = rho[i] - (nE[i]+nW[i]+nN[i]+nS[i]+nNE[i]+nSE[i]+nNW[i]+nSW[i]);
                }
                }
        }
    }
}

const initialization = (xtop:number, ytop:number, yheight:number, u0:number = 0.1) => {
    let xcoord = 0
    let ycoord = 0
    
    let count = 0
    for (let i=0; i<(WIDTH*HEIGHT); i++){
        n0[i] = four9ths* (1 - 1.5*(u0**2.))
        nN[i] = one9th  * (1 - 1.5*(u0**2.))
        nS[i] = one9th  * (1 - 1.5*(u0**2.))
        nE[i] = one9th  * (1 + 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
        nW[i] = one9th  * (1 - 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
        nNE[i]= one36th * (1 + 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
        nSE[i]= one36th * (1 + 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
        nNW[i]= one36th * (1 - 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
        nSW[i]= one36th * (1 - 3*u0 + 4.5*(u0**2.) - 1.5*(u0**2.))
        
        rho[i] =  n0[i] + nN[i] + nS[i] + nE[i] + nW[i] + nNE[i] + nSE[i] + nNW[i] + nSW[i]
        
        ux[i]  = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) * (1-(rho[i]-1)+((rho[i]-1)**2.))
        uy[i]  = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) * (1-(rho[i]-1)+((rho[i]-1)**2.))
        
        if (xcoord==xtop){
            if (ycoord >= ytop){
                if (ycoord < (ytop+yheight)){
                    count += 1
                    bar[ycoord*WIDTH + xcoord] = 1
                }
            }
        }

        if (xcoord<(WIDTH-1)){
            xcoord = (xcoord+1);
        }
        else 0;
        
        if (xcoord != 0){
            ycoord = ycoord;
        }
        else (ycoord + 1);
    } }