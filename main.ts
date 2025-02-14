const canvas = document.getElementById("projectCanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const height = 32                     
const width = 512                     
const viscosity = 0.002               
const omega = 1./(3*viscosity + 0.5)  
const u0 = 0.1                        
const four9ths = 4./9.                
const one9th   = 1./9.                
const one36th  = 1./36.               

let n0 = new Float64Array(height*width)
let nN = new Float64Array(height*width)
let nS = new Float64Array(height*width)
let nE = new Float64Array(height*width)
let nW = new Float64Array(height*width)
let nNW= new Float64Array(height*width)
let nNE= new Float64Array(height*width)
let nSE= new Float64Array(height*width)
let nSW= new Float64Array(height*width)

let bar= new Float64Array(height*width)

let rho   = new Float64Array(height*width)
let ux    = new Float64Array(height*width)
let uy    = new Float64Array(height*width)
let speed2= new Float64Array(height*width)

const stream = () => {
    
    
    // for x in range(0, width-1):
    for(let x = 0; x<width-1; x++){
        // for y in range(1, height-1):
        for(let y = 1; y<height-1; y++){
            
            nN[y*width + x] = nN[y*width + x + width]
            
            nNW[y*width + x] = nNW[y*width + x + width + 1]
            
            nW[y*width + x] = nW[y*width + x + 1]
            
            nS[(height-y-1)*width + x] = nS[(height-y-1-1)*width + x]
            
            nSW[(height-y-1)*width + x] = nSW[(height-y-1-1)*width + x + 1]
            
            nE[y*width + (width-x-1)] = nE[y*width + (width-(x+1)-1)]
            
            nNE[y*width + (width-x-1)] = nNE[y*width + width + (width-(x+1)-1)]
            
            nSE[(height-y-1)*width + (width-x-1)] = nSE[(height-y-1-1)*width +
                                                        (width-(x+1)-1)]  
            }
        }
            
    
    const x = width;
    // for y in range(1, height-1):
    for(let y = 1; y<height-1; y++){
    
        
        nN[y*width + x] = nN[y*width + x + width]
        
        nS[(height-y-1)*width + x] = nS[(height-y-1-1)*width + x]
    }
}

const bounce = () => {
    
   
    // for x in range(2, width-2):
    //     for y in range(2, height-2):
    for(let x = 2; x<width-2; x++){
        for(let y = 2; y<height-2; y++){
            
           
            // if (bar[y*width + x]):
            if (bar[y*width + x]){
                
               
                nN[(y-1)*width + x] = nS[y*width + x]
                nS[(y+1)*width + x] = nN[y*width + x]
                nE[y*width + x + 1] = nW[y*width + x]
                nW[y*width + (x-1)] = nE[y*width + x]    
                nNE[(y-1)*width + (x+1)] = nSW[y*width + x]
                nNW[(y-1)*width + (x-1)] = nSE[y*width + x]
                nSE[(y+1)*width + (x+1)] = nNW[y*width + x]
                nSW[(y+1)*width + (x-1)] = nNE[y*width + x]
                
               
                n0[y*width + x] = 0
                nN[y*width + x] = 0
                nS[y*width + x] = 0
                nE[y*width + x] = 0
                nW[y*width + x] = 0
                nNE[y*width + x] = 0
                nNW[y*width + x] = 0
                nSE[y*width + x] = 0
                nSW[y*width + x] = 0
            }
        }
    }
}

// def collide():
const collide = () => {
   
    // for x in range(1, width-1):
    //     for y in range(1, height-1):
    for(let x = 1; x<width-1; x++){
        for(let y = 1; y<height-1; y++){
            
           
            let i = y*width + x
            
           
            // if (bar[i]):
            //     continue

            if (bar[i]){
                continue
            }
                
            else{
               
                rho[i] = n0[i] + nN[i] + nE[i] + nS[i] + nW[i] + nNE[i] + nSE[i] + nSW[i] + nNW[i]
               
                // if (rho[i] > 0):
                if (rho[i] > 0){
                    ux[i]  = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) * (1-(rho[i]-1)+((rho[i]-1)**2.))
                    uy[i]  = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) * (1-(rho[i]-1)+((rho[i]-1)**2.))
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

                
               
                nE[i]  += omega * (   one9th_rho * (1 + vx3       + 4.5*vx2        - v215) - nE[i])
                nW[i]  += omega * (   one9th_rho * (1 - vx3       + 4.5*vx2        - v215) - nW[i])
                nN[i]  += omega * (   one9th_rho * (1 + vy3       + 4.5*vy2        - v215) - nN[i])
                nS[i]  += omega * (   one9th_rho * (1 - vy3       + 4.5*vy2        - v215) - nS[i])
                nNE[i] += omega * (  one36th_rho * (1 + vx3 + vy3 + 4.5*(v2+vxvy2) - v215) - nNE[i])
                nNW[i] += omega * (  one36th_rho * (1 - vx3 + vy3 + 4.5*(v2-vxvy2) - v215) - nNW[i])
                nSE[i] += omega * (  one36th_rho * (1 + vx3 - vy3 + 4.5*(v2-vxvy2) - v215) - nSE[i])
                nSW[i] += omega * (  one36th_rho * (1 - vx3 - vy3 + 4.5*(v2+vxvy2) - v215) - nSW[i])
                
               
                n0[i]   = rho[i] - (nE[i]+nW[i]+nN[i]+nS[i]+nNE[i]+nSE[i]+nNW[i]+nSW[i]);
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

const initialize = (xtop:number, ytop:number, yheight:number, u0:number = 0.1) => {
    let xcoord = 0
    let ycoord = 0
    
    let count = 0
    for(let i = 0; i<height*width; i++){
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
                    bar[ycoord*width + xcoord] = 1
                }
            }
        }

        xcoord = (xcoord+1) < (width-1) ? xcoord+1 : 0
        ycoord = xcoord != 0 ? ycoord : ycoord + 1
    }
}

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let x = 0; x<width; x++){
        for(let y = 0; y<height; y++){
            if (bar[y*width + x]){
                ctx.fillStyle = "black"
                ctx.fillRect(x, y, 1, 1)
            }
        }
    }
}

let time = performance.now()
const tick = () => {
    stream()
    bounce()
    collide()
    draw()
    requestAnimationFrame(tick)
    const newTime = performance.now()
console.log("Simulation took", newTime-time, "ms")
console.log("n0[4000]: ", n0[4000])
time = newTime

}

initialize(256, 10, 32)
console.log("Initialization took", performance.now()-time, "ms")
time = performance.now()
tick()
