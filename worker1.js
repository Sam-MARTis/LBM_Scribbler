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
    var _this = this;
    var flatten2D = function (i, j) {
        return j * width + i;
    };
    var four9ths = 4 / 9;
    var one9th = 1 / 9;
    var one36th = 1 / 36;
    var _a = e.data, id = _a.id, viscosity = _a.viscosity, height = _a.height, width = _a.width, CALC_DRAW_RATIO = _a.CALC_DRAW_RATIO, u0 = _a.u0, n0 = _a.n0, nN = _a.nN, nS = _a.nS, nE = _a.nE, nW = _a.nW, nNW = _a.nNW, nNE = _a.nNE, nSE = _a.nSE, nSW = _a.nSW, bar = _a.bar, rho = _a.rho, ux = _a.ux, uy = _a.uy, speed2 = _a.speed2;
    var omega = 1 / (3 * viscosity + 0.5);
    var stream = function () {
        // for x in range(0, width-1):
        for (var x_1 = 0; x_1 < width - 1; x_1++) {
            // for y in range(1, height-1):
            for (var y = 1; y < height - 1; y++) {
                nN[y * width + x_1] = nN[y * width + x_1 + width];
                nNW[y * width + x_1] = nNW[y * width + x_1 + width + 1];
                nW[y * width + x_1] = nW[y * width + x_1 + 1];
                nS[(height - y - 1) * width + x_1] = nS[(height - y - 1 - 1) * width + x_1];
                nSW[(height - y - 1) * width + x_1] =
                    nSW[(height - y - 1 - 1) * width + x_1 + 1];
                nE[y * width + (width - x_1 - 1)] = nE[y * width + (width - (x_1 + 1) - 1)];
                nNE[y * width + (width - x_1 - 1)] =
                    nNE[y * width + width + (width - (x_1 + 1) - 1)];
                nSE[(height - y - 1) * width + (width - x_1 - 1)] =
                    nSE[(height - y - 1 - 1) * width + (width - (x_1 + 1) - 1)];
            }
        }
        var x = width;
        // for y in range(1, height-1):
        for (var y = 1; y < height - 1; y++) {
            nN[y * width + x] = nN[y * width + x + width];
            nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x];
        }
    };
    var bounce = function () {
        // for x in range(2, width-2):
        //     for y in range(2, height-2):
        for (var x = 2; x < width - 2; x++) {
            for (var y = 2; y < height - 2; y++) {
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
    var collide = function () {
        // for x in range(1, width-1):
        //     for y in range(1, height-1):
        for (var x = 1; x < width - 1; x++) {
            for (var y = 1; y < height - 1; y++) {
                var i = y * width + x;
                // if (bar[i]):
                //     continue
                if (bar[i]) {
                    continue;
                }
                else {
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
                                (1 - (rho[i] - 1) + Math.pow((rho[i] - 1), 2));
                        uy[i] =
                            (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) *
                                (1 - (rho[i] - 1) + Math.pow((rho[i] - 1), 2));
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
                    var one9th_rho = one9th * rho[i];
                    var one36th_rho = one36th * rho[i];
                    var vx3 = 3 * ux[i];
                    var vy3 = 3 * uy[i];
                    var vx2 = ux[i] * ux[i];
                    var vy2 = uy[i] * uy[i];
                    var vxvy2 = 2 * ux[i] * uy[i];
                    var v2 = vx2 + vy2;
                    speed2[i] = v2;
                    var v215 = 1.5 * v2;
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
    var initialize = function (u0) {
        if (u0 === void 0) { u0 = 0.1; }
        var xcoord = 0;
        var ycoord = 0;
        for (var i = 0; i < height * width; i++) {
            n0[i] = four9ths * (1 - 1.5 * Math.pow(u0, 2));
            nN[i] = one9th * (1 - 1.5 * Math.pow(u0, 2));
            nS[i] = one9th * (1 - 1.5 * Math.pow(u0, 2));
            nE[i] = one9th * (1 + 3 * u0 + 4.5 * Math.pow(u0, 2) - 1.5 * Math.pow(u0, 2));
            nW[i] = one9th * (1 - 3 * u0 + 4.5 * Math.pow(u0, 2) - 1.5 * Math.pow(u0, 2));
            nNE[i] = one36th * (1 + 3 * u0 + 4.5 * Math.pow(u0, 2) - 1.5 * Math.pow(u0, 2));
            nSE[i] = one36th * (1 + 3 * u0 + 4.5 * Math.pow(u0, 2) - 1.5 * Math.pow(u0, 2));
            nNW[i] = one36th * (1 - 3 * u0 + 4.5 * Math.pow(u0, 2) - 1.5 * Math.pow(u0, 2));
            nSW[i] = one36th * (1 - 3 * u0 + 4.5 * Math.pow(u0, 2) - 1.5 * Math.pow(u0, 2));
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
                    (1 - (rho[i] - 1) + Math.pow((rho[i] - 1), 2));
            uy[i] =
                (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) *
                    (1 - (rho[i] - 1) + Math.pow((rho[i] - 1), 2));
            xcoord = xcoord + 1 < width - 1 ? xcoord + 1 : 0;
            ycoord = xcoord != 0 ? ycoord : ycoord + 1;
        }
    };
    var createWall = function (x, y) {
        bar[flatten2D(x, y)] = 1;
    };
    var removeWall = function (x, y) {
        bar[flatten2D(x, y)] = 0;
    };
    initialize(u0);
    var drawBlock = function (Block_Height, Block_width, pos_X_block, pos_Y_block) {
        for (var i = pos_X_block; i < pos_X_block + Block_width; i++) {
            for (var j_1 = Math.floor(Math.abs(pos_Y_block - Block_Height / 2)) - 1; j_1 < pos_Y_block + Block_Height / 2; j_1++) {
                createWall(i, j_1);
            }
        }
    };
    //   drawBlock(5, 15, 25, 25);
    var j = 1;
    var tick = function () {
        stream();
        bounce();
        collide();
        if (j % CALC_DRAW_RATIO == 0) {
            postMessage({ id: id, rho: rho, ux: ux, uy: uy, speed2: speed2 });
        }
        j++;
        // console.log("Completed a loop: ", j)
        _this.requestAnimationFrame(tick);
    };
    tick();
};
