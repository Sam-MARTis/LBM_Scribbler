onmessage = function (e) {
  /*
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
    
    */

  const flatten2D = (i: number, j: number): number => {
    return j * width + i;
  };
  const four9ths = 4 / 9;
  const one9th = 1 / 9;
  const one36th = 1 / 36;

  const {
    id,
    viscosity,
    height,
    width,
    CALC_DRAW_RATIO,
    u0,
    n0,
    nN,
    nS,
    nE,
    nW,
    nNW,
    nNE,
    nSE,
    nSW,
    bar,
    rho,
    ux,
    uy,
    speed2,
    functionArguments
  } = e.data;
  const omega = 1 / (3 * viscosity + 0.5);

  const stream = () => {
    // for x in range(0, width-1):
    for (let x = 0; x < width - 1; x++) {
      // for y in range(1, height-1):
      for (let y = 1; y < height - 1; y++) {
        nN[y * width + x] = nN[y * width + x + width];

        nNW[y * width + x] = nNW[y * width + x + width + 1];

        nW[y * width + x] = nW[y * width + x + 1];

        nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x];

        nSW[(height - y - 1) * width + x] =
          nSW[(height - y - 1 - 1) * width + x + 1];

        nE[y * width + (width - x - 1)] = nE[y * width + (width - (x + 1) - 1)];

        nNE[y * width + (width - x - 1)] =
          nNE[y * width + width + (width - (x + 1) - 1)];

        nSE[(height - y - 1) * width + (width - x - 1)] =
          nSE[(height - y - 1 - 1) * width + (width - (x + 1) - 1)];
      }
    }

    const x = width;
    // for y in range(1, height-1):
    for (let y = 1; y < height - 1; y++) {
      nN[y * width + x] = nN[y * width + x + width];

      nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x];
    }
  };
  const bounce = () => {
    // for x in range(2, width-2):
    //     for y in range(2, height-2):
    for (let x = 2; x < width - 2; x++) {
      for (let y = 2; y < height - 2; y++) {
        // if (bar[y*width + x]):
        if (bar[y * width + x]) {
          //Barrier bounces the velocity back

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

  // def collide():
  const collide = () => {
    // for x in range(1, width-1):
    //     for y in range(1, height-1):
    for (let x = 1; x < width - 1; x++) {
      for (let y = 1; y < height - 1; y++) {
        let i = y * width + x;

        // if (bar[i]):
        //     continue

        if (bar[i]) {
          continue;
        } else {
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
            (one36th_rho * (1 + vx3 + vy3 + 4.5 * (v2 + vxvy2) - v215) -
              nNE[i]);
          nNW[i] +=
            omega *
            (one36th_rho * (1 - vx3 + vy3 + 4.5 * (v2 - vxvy2) - v215) -
              nNW[i]);
          nSE[i] +=
            omega *
            (one36th_rho * (1 + vx3 - vy3 + 4.5 * (v2 - vxvy2) - v215) -
              nSE[i]);
          nSW[i] +=
            omega *
            (one36th_rho * (1 - vx3 - vy3 + 4.5 * (v2 + vxvy2) - v215) -
              nSW[i]);

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
        n0[i] +
        nN[i] +
        nS[i] +
        nE[i] +
        nW[i] +
        nNE[i] +
        nSE[i] +
        nNW[i] +
        nSW[i];

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
  const createWall = (x:number, y:number) => {
    bar[flatten2D(x, y)] = 1;
  };
  const removeWall = (x:number, y:number) => {
    bar[flatten2D(x, y)] = 0;
  };

  initialize(u0);

  const drawBlock = (Block_Height:number, Block_width:number, pos_X_block:number, pos_Y_block:number) => {
    for (let i = pos_X_block; i < pos_X_block + Block_width; i++) {
      for (
        let j = Math.floor(Math.abs(pos_Y_block - Block_Height / 2)) - 1;
        j < pos_Y_block + Block_Height / 2;
        j++
      ) {
        createWall(i, j);
      }
    }
  };

const drawCircleBarrier = (radius: number, pos_X: number, pos_Y:number): void => {
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
// creat invertedramp 

const drawinvertedramp = (ramp_H:number, pos_X_ramp:number, pos_Y_ramp:number): void =>{
  for (let i =ramp_H+ pos_X_ramp ; i >= pos_X_ramp; i--) {
      for (let j = ramp_H -i + pos_Y_ramp +pos_X_ramp; j > pos_Y_ramp; j--) {
          createWall(i, j);
      }
  }
  for(let i= pos_X_ramp; i< pos_X_ramp+ ramp_H; i++){
      for(let j=pos_Y_ramp-ramp_H + (i-pos_X_ramp); j<=pos_Y_ramp; j++){
          createWall(i,j)
      }
  }
}

// creat invertedramp but for Pacman..
const drawinvertedramp1 = (ramp_H:number, pos_X_ramp:number, pos_Y_ramp:number): void =>{
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

const drawPacman = () => {
  drawCircleBarrier(10,35,50);
  drawinvertedramp1(8,25,50);
}


  drawBlock(5, 15, 25, 25);
  const drawId = (k:number)=>{
    k=e.data.id
    
    if (k==10) {
      drawBlock(15,1,20,42) 
    };
    if (k==2) {
      drawBlock(10,20,20,45)
    };
    if (k==3) {
      drawBlock(20,7,20,40)
    };
    if (k==4) {
      drawCircleBarrier(3,25,50)
    }
    if (k==5) {
      drawCircleBarrier(7,25,50)
    }
    if (k==6) {
      drawCircleBarrier(5,25,50)
      drawCircleBarrier(5,32,50)
      drawCircleBarrier(5,39,50)
    }
    if (k==7) {
      drawramp(8,20,50)
    }
    if (k==8) {
      drawramp(5,20,50)
      drawramp(3,25,50)
      drawramp(1,28,50)
    }
    if (k==9) {
      drawinvertedramp(8,30,50)
    }
    if (k==1) {
      drawPacman()
    }

  }

  let j = 1;
  const tick = () => {
    stream();
    bounce();
    collide();
    if (j % CALC_DRAW_RATIO == 0) {
      postMessage({ id, rho, ux, uy, speed2 });
    }
    j++
    console.log("Completed a loop: ", j)
    this.requestAnimationFrame(tick);

  }
  tick();
};
