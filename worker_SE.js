onmessage = function(e){

    let nSE = new Float32Array(e.data.nSE);
    const width = e.data.width
    const height = e.data.height

    // for x in range(0, width-1):
    for (let x = 0; x < width - 1; x++) {
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
            nSE[(height - y - 1) * width + (width - x - 1)] = nSE[(height - y - 1 - 1) * width + (width - (x + 1) - 1)];
        }
    }
    postmessage( {nSE}, [ nSE.buffer] )

}