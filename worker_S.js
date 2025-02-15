onmessage = function(e){

    let nS = new Float32Array(e.data.nS);
    const width = e.data.width
    const height = e.data.height

    // for x in range(0, width-1):
    for (let x = 0; x < width - 1; x++) {
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
            nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x];
        }
    }
    const x = width;
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
        nS[(height - y - 1) * width + x] = nS[(height - y - 1 - 1) * width + x];
    }
    postmessage( {nS}, [ nS.buffer] )

}