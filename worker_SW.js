onmessage = function(e){

    let nSW = new Float32Array(e.data.nSW);
    const width = e.data.width
    const height = e.data.height

    // for x in range(0, width-1):
    for (let x = 0; x < width - 1; x++) {
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
            nSW[(height - y - 1) * width + x] = nSW[(height - y - 1 - 1) * width + x + 1];
        }
    }
    postmessage( {nSW}, [ nSW.buffer] )

}