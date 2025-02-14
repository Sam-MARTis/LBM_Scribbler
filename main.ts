
const canvas = document.getElementById("projectCanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth*devicePixelRatio;
canvas.height = window.innerHeight*devicePixelRatio;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const arr = new Float32Array(100*100)

//microscopic variables used here for dircetional distribution of velocity
const HEIGHT  = 100;
const WIDTH = 100;  // i dont know the scale of these particles probability so this is an example value 

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

function twoDto1D(i:number,j: number) {
    return WIDTH * j + i ; // We can Adjust for 0-based indexing
}


let n;
function oneDto2D (n){
    let i,j;
    if n=WIDTH*j+i;
    0<=i<=2 && 0<=j<=2;
    return i,j;
}
let n;

function oneDto2D(n : number) {
    let i = n % WIDTH; // Column index
    let j = Math.floor(n / WIDTH); // Row index
    console.log(i,j);
}
oneDto2D(5);