onmessage = function(e){

    let nW = new Float32Array(e.data.nW);
    const width = e.data.width;
    const height = e.data.height;

    // for x in range(0, width-1):
    for (let x = 0; x < width - 1; x++) {
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
            nW[y * width + x] = nW[y * width + x + 1];
        }
    }
    postMessage( {nW}, [ nW.buffer] );

};