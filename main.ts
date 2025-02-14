
const canvas = document.getElementById("projectCanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth*devicePixelRatio;
canvas.height = window.innerHeight*devicePixelRatio;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const arr = new Float32Array(100*100)


//microscopic variables used here for dircetional distribution of velocity
const HEIGHT  = 100;
const WIDTH = 100;  // i dont know the scale of these particles probability so this is an example value 
const viscosity = 0.002                // viscosity
const omega = 1./(3*viscosity + 0.5)   //relaxation parameter (a function of viscosity)
const u0 = 0.1                         // initial in-flow speed (eastward)
const four9ths = 4./9.                 // a constant
const one9th   = 1./9.                 // a constant
const one36th  = 1./36.                // a constant

const size = HEIGHT  * WIDTH;

const n0  = new Float32Array(size).fill(0); // Naught
const nN  = new Float32Array(size).fill(0); // North
const nS  = new Float32Array(size).fill(0); // South
const nE  = new Float32Array(size).fill(0); // East
const nW  = new Float32Array(size).fill(0); // West
const nNW = new Float32Array(size).fill(0); // Northwest
const nNE = new Float32Array(size).fill(0); // Northeast
const nSE = new Float32Array(size).fill(0); // Southeast
const nSW = new Float32Array(size).fill(0); // Southwest

// Barriers
const barrier = new Int8Array(size).fill(0); // Barriers

// Macroscopic density and velocity
const rho    = new Float32Array(size).fill(0); // Cell density
const ux     = new Float32Array(size).fill(0); // Cell x-velocity
const uy     = new Float32Array(size).fill(0); // Cell y-velocity
const speed2 = new Float32Array(size).fill(0); // Cell squared velocity

const Flatten=(i:number,j: number):number=>
 {
    return WIDTH * j + i ; // We can Adjust for 0-based indexing
}


// let n;
// //function oneDto2D (n){
//    // let i,j;
//    // if n=WIDTH*j+i;
//    // 0<=i<=2 && 0<=j<=2;
//    // return i,j;
// }
// let n;

// function oneDto2D(n : number) {
//     let i = n % WIDTH; // Column index
//     let j = Math.floor(n / WIDTH); // Row index
//     console.log(i,j);
// }
// oneDto2D(5);

const Expander = (l:number):[number , number] =>{
    return [l%WIDTH,(Math.floor(l/WIDTH))];
}


 //{function stream(){
//    let i ,j;
  ///  for(let i = 0; i<WIDTH-1; i++){
     //   for(let j = 0; j<HEIGHT; j++){
       // const Big= WIDTH*j+i;
   //nN  = new Float32Array(size).fill(0)=new Float32Array(size + WIDTH).fill(0)
   
    //[ STEAM FUNCTION ]    
 function stream() {
    // Stream all internal cells
    for (let x = 0; x < WIDTH - 1; x++) {
        for (let y = 1; y < HEIGHT - 1; y++) {
            // Movement north (Northwest corner)
            nN[y * WIDTH + x] = nN[y * WIDTH + x + WIDTH];
            // Movement northwest (Northwest corner)
            nNW[y * WIDTH + x] = nNW[y * WIDTH + x + WIDTH + 1];
            // Movement west (Northwest corner)
            nW[y * WIDTH + x] = nW[y * WIDTH + x + 1];
            // Movement south (Southwest corner)
            nS[(HEIGHT - y - 1) * WIDTH + x] = nS[(HEIGHT - y - 1 - 1) * WIDTH + x];
            // Movement southwest (Southwest corner)
            nSW[(HEIGHT - y - 1) * WIDTH + x] = nSW[(HEIGHT - y - 1 - 1) * WIDTH + x + 1];
            // Movement east (Northeast corner)
            nE[y * WIDTH + (WIDTH - x - 1)] = nE[y * WIDTH + (WIDTH - (x + 1) - 1)];
            // Movement northeast (Northeast corner)
            nNE[y*WIDTH + (WIDTH-x-1)]=nNE[y*WIDTH + WIDTH + (WIDTH-(x+1)-1)]
            // Movement southeast (Southeast corner)
            nSE[(HEIGHT-y-1)*WIDTH + (WIDTH-x-1)] = nSE[(HEIGHT-y-1-1)*WIDTH +(WIDTH-(x+1)-1)]  
            
    //Tidy up the edges
    x += 1
    //for y in Range (1, HEIGHT-1):
       for (let y = 1; y < HEIGHT - 1; y++){
        //Movement north on right boundary (Northwest corner)
        nN[y*WIDTH + x] = nN[y*WIDTH + x + WIDTH]
        //Movement south on right boundary (Southwest corner)
        nS[(HEIGHT-y-1)*WIDTH + x] = nS[(HEIGHT-y-1-1)*WIDTH + x]
       }

       //[ BOUNCE FUNCTION ]
       for(let x=2;x<WIDTH-2 ; x++){
        for(let y=2;y<HEIGHT-2;y++){
            if (barrier[y*WIDTH + x]){

          nN[(y-1)*WIDTH + x] = nS[y*WIDTH + x]
                nS[(y+1)*WIDTH + x] = nN[y*WIDTH + x]
                nE[y*WIDTH + x + 1] = nW[y*WIDTH + x]
                nW[y*WIDTH + (x-1)] = nE[y*WIDTH + x]    
                nNE[(y-1)*WIDTH + (x+1)] = nSW[y*WIDTH + x]
                nNW[(y-1)*WIDTH + (x-1)] = nSE[y*WIDTH + x]
                nSE[(y+1)*WIDTH + (x+1)] = nNW[y*WIDTH + x]
                nSW[(y+1)*WIDTH + (x-1)] = nNE[y*WIDTH + x]}
                // Clear the densities in the barrier cells
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

    function collide() {
        // Constants
        const one9th = 1 / 9; // Weight for N, E, S, W directions
        const one36th = 1 / 36; // Weight for NE, SE, NW, SW directions
    
        // Loop over internal cells (excluding boundaries)
        for (let x = 1; x < WIDTH - 1; x++) {
            for (let y = 1; y < HEIGHT - 1; y++) {
                // Current cell index
                const i = y * WIDTH + x;
    
                // Skip cells containing barriers
                if (barrier[i]) {
                    continue;
                }
    
                // Compute macroscopic density (rho)
                rho[i] = n0[i] + nN[i] + nE[i] + nS[i] + nW[i] + nNE[i] + nSE[i] + nSW[i] + nNW[i];
    
                // Compute macroscopic velocities (ux, uy)
                if (rho[i] > 0) {
                    ux[i] = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) * (1 - (rho[i] - 1) + Math.pow(rho[i] - 1, 2));
                    uy[i] = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) * (1 - (rho[i] - 1) + Math.pow(rho[i] - 1, 2));
                }
    
                // Pre-compute constants
                const one9th_rho = one9th * rho[i];
                const one36th_rho = one36th * rho[i];
                const vx3 = 3 * ux[i];
                const vy3 = 3 * uy[i];
                const vx2 = ux[i] * ux[i];
                const vy2 = uy[i] * uy[i];
                const vxvy2 = 2 * ux[i] * uy[i];
                const v2 = vx2 + vy2;
                speed2[i] = v2; // Store speed squared
                const v215 = 1.5 * v2;
    
                // Update densities using relaxation toward equilibrium
                nE[i] += omega * (one9th_rho * (1 + vx3 + 4.5 * vx2 - v215) - nE[i]);
                nW[i] += omega * (one9th_rho * (1 - vx3 + 4.5 * vx2 - v215) - nW[i]);
                nN[i] += omega * (one9th_rho * (1 + vy3 + 4.5 * vy2 - v215) - nN[i]);
                nS[i] += omega * (one9th_rho * (1 - vy3 + 4.5 * vy2 - v215) - nS[i]);
                nNE[i] += omega * (one36th_rho * (1 + vx3 + vy3 + 4.5 * (v2 + vxvy2) - v215) - nNE[i]);
                nNW[i] += omega * (one36th_rho * (1 - vx3 + vy3 + 4.5 * (v2 - vxvy2) - v215) - nNW[i]);
                nSE[i] += omega * (one36th_rho * (1 + vx3 - vy3 + 4.5 * (v2 - vxvy2) - v215) - nSE[i]);
                nSW[i] += omega * (one36th_rho * (1 - vx3 - vy3 + 4.5 * (v2 + vxvy2) - v215) - nSW[i]);
    
                // Conserve mass by updating the rest density (n0)
                n0[i] = rho[i] - (nE[i] + nW[i] + nN[i] + nS[i] + nNE[i] + nSE[i] + nNW[i] + nSW[i]);
            }
        }
    }