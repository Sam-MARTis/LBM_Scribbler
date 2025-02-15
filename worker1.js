self.onmessage = (e) => {
    const { width, height, arrayBuffer, arrayType } = e.data;
    const array = new Float32Array(arrayBuffer);

    switch (arrayType) {
        case 'nN':
            for (let x = 0; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    array[y * width + x] = array[y * width + x + width];
                }
            }
            const x = width;
            for (let y = 1; y < height - 1; y++) {
                array[y * width + x] = array[y * width + x + width];
            }
            break;

        case 'nNW':
            for (let x = 0; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    array[y * width + x] = array[y * width + x + width + 1];
                }
            }
            break;

        case 'nW':
            for (let x = 0; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    array[y * width + x] = array[y * width + x + 1];
                }
            }
            break;
        case 'nSW':
            for (let x = 0; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    array[(height-y-1)*width + x] = array[(height-y-1-1)*width + x + 1]
                }
            }

            break;

        case 'nS':
            for (let x = 0; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    array[(height - y - 1) * width + x] = array[(height - y - 1 - 1) * width + x];
                }
            }
            const yEnd = width;
            for (let y = 1; y < height - 1; y++) {
                array[(height - y - 1) * width + yEnd] = array[(height - y - 1 - 1) * width + yEnd];
            }
            break;
        case 'nSE':
            for (let x = 0; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    array[(height-y-1)*width + (width-x-1)] = array[(height-y-1-1)*width + (width-(x+1)-1)]  
                }
            }
            break;

        case 'nE':
            for (let x = 0; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    array[y*width + (width-x-1)] = array[y*width + (width-(x+1)-1)]
                }
            }
            break;
        
        case 'nNE':
            for (let x = 0; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    array[y*width + (width-x-1)] = array[y*width + width + (width-(x+1)-1)]
                }
            }
            break;


            // nN[y*width + x] = nN[y*width + x + width]
            
            // nNW[y*width + x] = nNW[y*width + x + width + 1]
            
            // nW[y*width + x] = nW[y*width + x + 1]
            
            // nS[(height-y-1)*width + x] = nS[(height-y-1-1)*width + x]
            
            // nSW[(height-y-1)*width + x] = nSW[(height-y-1-1)*width + x + 1]
            
            // nE[y*width + (width-x-1)] = nE[y*width + (width-(x+1)-1)]
            
            // nNE[y*width + (width-x-1)] = nNE[y*width + width + (width-(x+1)-1)]
            
            // nSE[(height-y-1)*width + (width-x-1)] = nSE[(height-y-1-1)*width +
            //                                             (width-(x+1)-1)]  
            // }
        

    }

    self.postMessage({ array, arrayType });
};
