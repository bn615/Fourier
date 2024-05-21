const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let drawn = false;
let points = []; // Array to store the points
let pointsCopy = [];
let originalImage = null; // Store the original drawing as an image

function startDrawing(e) {
    if (!drawn) {
        if (points.length == 0) {
            clearCanvas();
        }
        drawing = true;
        ctx.beginPath();
        points.push(new Complex(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)); // Add the starting point
        draw(e);
    }
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
    drawn = true;
    // Save the current drawing as an image
    originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function clearCanvas() {
    drawn = false;
    drawing = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
    originalImage = null; // Clear the saved image
}

function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);

    points.push(new Complex(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)); // Add the current point
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

// Return an array containing every n points
function everyNPointsArray(everyNPoints) {
    let result = [];
    for (let i = 0; i < points.length; i++) {
        if (points[i] == null) break;
        else if (i % everyNPoints == 0) {
            result.push(points[i]);
        }
    }
    return result;
}
function sign(val){
    return val / Math.abs(val);
}

function spacedArray(dist) {
    let result = [];
    result.push(points[0])

    let lastPoint = points[0];
    for(let i = 1; i < points.length; i++) {
        
        while (Complex.distance(lastPoint, points[i]) >= dist) {
            let t = dist / Complex.distance(lastPoint, points[i]);
            lastPoint = Complex.lerp(lastPoint, points[i], t);
            result.push(lastPoint)
        }
        if(i != points.length - 1) {
            const p1 = Complex.subtract(points[i + 1], lastPoint);
            const p = Complex.subtract(points[i], lastPoint);

            const dx = p1.x - p.x;
            const dy = p1.y - p.y;
            const dr = Math.sqrt(dx * dx + dy * dy);
            const D = p.x * p1.y - p1.x * p.y;

            const x1 = (D * dy + sign(dy) * dx * Math.sqrt(Math.pow(dist * dr, 2) - D * D)) / (dr * dr);
            const x2 = (D * dy - sign(dy) * dx * Math.sqrt(Math.pow(dist * dr, 2) - D * D)) / (dr * dr);
            
            const y1 = (-1 * D * dx + Math.abs(dy)* Math.sqrt(Math.pow(dist * dr, 2) - D * D)) / (dr * dr);
            const y2 = (-1 * D * dx - Math.abs(dy)* Math.sqrt(Math.pow(dist * dr, 2) - D * D)) / (dr * dr);

            const n1 = new Complex(x1, y1);
            const n2 = new Complex(x2, y2);
            
            const d1 = Complex.distance(n1, p1);
            const d2 = Complex.distance(n2, p1);

            
            if (d1 > d2){

                lastPoint = Complex.add(n2, lastPoint);
            }
            else{
                lastPoint = Complex.add(n1, lastPoint);
            }
            result.push(lastPoint);
        }            
    }
    result.push(points[points.length - 1]);
    return result;
}


// FFT implementation
function fft(inputArray) {
    let result = [];
    let N = inputArray.length;
    for (let k = 0; k < N; k++) {
        let sum = new Complex(0, 0);
        for (let n = 0; n < N; n++) {
            let esec = Polar.convertToRectangular(new Polar(1, -2 * Math.PI * k * n / N));
            let xn = inputArray[n];
            sum = Complex.sum(sum, Complex.product(xn, esec));
        }
        result.push(sum);
    }
    return result;
}

function fftshift(arr) {
    const n = arr.length;
    const halfN = Math.floor(n / 2);

    if (n % 2 === 0) {
        return arr.slice(halfN).concat(arr.slice(0, halfN));
    } else {
        return arr.slice(halfN + 1).concat(arr.slice(0, halfN + 1));
    }
}

function drawFirstNPoints(n) {

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';
    ctx.beginPath();

    for (let i = 0; i < n; i++) {
        let px = pointsCopy[i].x;
        let py = pointsCopy[i].y;
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px, py);
    }
}


// Vector animation function
async function vectorAnimation() {
    console.log("Starting animation");

    const everyNPoints = 1;
    // let transform = fft(everyNPointsArray(everyNPoints));
    points = spacedArray(3);
    let transform = fft(points); 
    // 1 is the distance between points, doesnt work rn for sum reason
    let N = transform.length;

    pointsCopy = [];
    for (let i = 0; i < points.length; i++) {
        pointsCopy.push(points[i]);
    }

    let currentlyAt = new Complex(0, 0);

    for (let n = 0; n < N; n += 1) {
        ctx.putImageData(originalImage, 0, 0); // Redraw the original image
        currentlyAt = new Complex(0, 0);


        drawFirstNPoints(n + 1);

        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'red';
        ctx.beginPath(); // Reset path at the beginning of each frame

        for (let k = 0; k < N; k++) {
            let esec = Polar.convertToRectangular(new Polar(1 / N, 2 * Math.PI * k * n / N));
            let Xk = transform[k];
            let vector = Complex.product(Xk, esec);

            let previousX = currentlyAt.x;
            let previousY = currentlyAt.y;

            currentlyAt = Complex.add(currentlyAt, vector);

            let currentX = currentlyAt.x;
            let currentY = currentlyAt.y;

            drawArrow(ctx, previousX, previousY, currentX, currentY);
        }

      await sleep(25 * everyNPoints);
  }

    console.log("Animation finished");
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headLength = 10; // Length of the arrowhead
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw the arrow line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw the arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.stroke();
    ctx.beginPath(); // Reset path after drawing each arrow
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add a button to print points
const printButton = document.createElement('button');
printButton.innerText = 'Print Points';
printButton.addEventListener('click', () => console.log(everyNPointsArray(1)));
document.body.appendChild(printButton);

// Add a button to clear drawing
const clearButton = document.createElement('button');
clearButton.innerText = 'Clear Drawing';
clearButton.addEventListener('click', clearCanvas);
document.body.appendChild(clearButton);

// Add a button to do vector animation
const vectorAnimationButton = document.createElement('button');
vectorAnimationButton.innerText = 'Vector Animation';
vectorAnimationButton.addEventListener('click', vectorAnimation);
document.body.appendChild(vectorAnimationButton);
