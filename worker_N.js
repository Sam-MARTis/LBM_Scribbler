onmessage = function(e){

    let nN = new Float32Array(e.data.nN);
    const width = e.data.width
    const height = e.data.height

      // for x in range(0, width-1):
      for (let x = 0; x < width - 1; x++) {
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
            nN[y * width + x] = nN[y * width + x + width];
        }
    }
    const x = width;
        // for y in range(1, height-1):
        for (let y = 1; y < height - 1; y++) {
        nN[y * width + x] = nN[y * width + x + width];
    }

    postmessage( {nN}, [ nN.buffer] )
}