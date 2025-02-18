onmessage = function(e){

    let nNW = new Float32Array(e.data.nNW);
    const width = e.data.width;
    const height = e.data.height;

    // for x in range(0, width-1):
    for (let x = 0; x < width - 1; x++) {
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
            nNW[y * width + x] = nNW[y * width + x + width + 1];
        }
    }
    postMessage( {nNW}, [ nNW.buffer] );

};