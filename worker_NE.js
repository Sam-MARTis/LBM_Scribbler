onmessage = function(e){

    let nNE = new Float32Array(e.data.nNE);
    const width = e.data.width;
    const height = e.data.height;

    // for x in range(0, width-1):
    for (let x = 0; x < width - 1; x++) {
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
            nNE[y * width + (width - x - 1)] = nNE[y * width + width + (width - (x + 1) - 1)];
        }
    }
    postMessage( {nNE}, [ nNE.buffer] );

};