onmessage = function(e){

    let nE = new Float32Array(e.data.nE);
    const width = e.data.width;
    const height = e.data.height;

    // for x in range(0, width-1):
    for (let x = 0; x < width - 1; x++) {
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
            nE[y * width + (width - x - 1)] = nE[y * width + (width - (x + 1) - 1)];
        }
    }
    postMessage( {nE}, [ nE.buffer] );

};