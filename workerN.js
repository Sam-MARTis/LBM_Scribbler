self.onmessage = (e) => {
    const width = 5
    const height = 5

    const { arrayBuffer } = e.data;
    const array = new Float32Array(arrayBuffer);

            console.log('Worker handling nN');
            for (let x = 0; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    array[y * width + x] = array[y * width + x + width];
                }
            }
            const x = width;
            for (let y = 1; y < height - 1; y++) {
                array[y * width + x] = array[y * width + x + width];
            }
   


    self.postMessage({ array }, [array.buffer]);
        };
