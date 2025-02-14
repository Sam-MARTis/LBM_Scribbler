
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
            nE[y * WIDTH + (WIDTH - x - 1)] = nE[y * WIDTH + (WIDTH - (x + 1) - 1];
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
            if barrier[y*width + x]{

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