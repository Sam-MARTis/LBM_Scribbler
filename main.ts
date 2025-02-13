
const canvas = document.getElementById("projectCanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth*devicePixelRatio;
canvas.height = window.innerHeight*devicePixelRatio;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const WIDTH = 256
const HEIGHT = 64
const array1 = new Float32Array(WIDTH*HEIGHT).fill(0)
// const n0 =new Float32Array(WIDTH*HEIGHT)
const viscosity = 0.02
const omega = 1./(3*viscosity + 0.5)
const u0 = 0.1
// Directions
const n0 = new Float32Array(WIDTH*HEIGHT).fill(0)
const nN = new Float32Array(WIDTH*HEIGHT).fill(0)
const nS = new Float32Array(WIDTH*HEIGHT).fill(0)
const nE = new Float32Array(WIDTH*HEIGHT).fill(0)
const nW = new Float32Array(WIDTH*HEIGHT).fill(0)
const nNE = new Float32Array(WIDTH*HEIGHT).fill(0)
const nNW = new Float32Array(WIDTH*HEIGHT).fill(0)
const nSE = new Float32Array(WIDTH*HEIGHT).fill(0)
const nSW = new Float32Array(WIDTH*HEIGHT).fill(0)
// Barriers
const bar = new Float32Array(WIDTH*HEIGHT).fill(0)
// Macro
const rho = new Float32Array(WIDTH*HEIGHT).fill(0)
const ux = new Float32Array(WIDTH*HEIGHT).fill(0)
const uy = new Float32Array(WIDTH*HEIGHT).fill(0)
const speed2 = new Float32Array(WIDTH*HEIGHT).fill(0)

function converter(x:number,y:number){
    let n = (y*WIDTH)+x;
    console.log(n);
}
converter(2,5);

function converter2(m:number){
    let y = (m/WIDTH);
    let x = m%WIDTH;
    console.log(Math.floor(y), x);
}
converter2(1282);