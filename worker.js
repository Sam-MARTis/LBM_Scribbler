self.onmessage = function (e) {
    const { array, width, height, type } = e.data;
    const newArray = new Float32Array(array); // Create a copy of the array

    for (let x = 0; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
            const index = y * width + x;
            switch (type) {
                case "nN":
                    newArray[index] = newArray[index + width]; 
                    break;
                case "nNW":
                    newArray[index] = newArray[index + width + 1]; 
                    break;
                case "nW":
                    newArray[index] = newArray[index + 1]; 
                    break;
                case "nS":
                    newArray[(height - y - 1) * width + x] = newArray[(height - y - 1 - 1) * width + x]; 
                    break;
                case "nSW":
                    newArray[(height - y - 1) * width + x] = newArray[(height - y - 1 - 1) * width + x + 1]; 
                    break;
                case "nE":
                    newArray[index] = newArray[y * width + (width - (x + 1) - 1)];
                    break;
                case "nNE":
                    newArray[index] = newArray[y * width + width + (width - (x + 1) - 1)];
                    break;
                case "nSE":
                    newArray[(height - y - 1) * width + (width - x - 1)] =
                        newArray[(height - y - 1 - 1) * width + (width - (x + 1) - 1)];
                    break;
            }
        }
    }

    self.postMessage({ type, updatedArray: newArray });
};
