
const canvas = document.getElementById("projectCanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth*devicePixelRatio;
canvas.height = window.innerHeight*devicePixelRatio;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const WIDTH = 256
const HEIGHT = 64
const array1 = new Float32Array(WIDTH*HEIGHT)
// const n0 =new Float32Array(WIDTH*HEIGHT)
const viscosity = 0.02
const omega = 1./(3*viscosity + 0.5)
const u0 = 0.1
// Directions
const n0 = new Float32Array(WIDTH*HEIGHT)
const nN = new Float32Array(WIDTH*HEIGHT)
const nS = new Float32Array(WIDTH*HEIGHT)
const nE = new Float32Array(WIDTH*HEIGHT)
const nW = new Float32Array(WIDTH*HEIGHT)
const nNE = new Float32Array(WIDTH*HEIGHT)
const nNW = new Float32Array(WIDTH*HEIGHT)
const nSE = new Float32Array(WIDTH*HEIGHT)
const nSW = new Float32Array(WIDTH*HEIGHT)
// Barriers
const bar = new Float32Array(WIDTH*HEIGHT)
// Macro
const rho = new Float32Array(WIDTH*HEIGHT)
const ux = new Float32Array(WIDTH*HEIGHT)
const uy = new Float32Array(WIDTH*HEIGHT)
const speed2 = new Float32Array(WIDTH*HEIGHT)
