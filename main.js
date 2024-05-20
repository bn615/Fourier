const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let drawn = false;
let points = []; // Array to store the points

function startDrawing(e) {
  if (!drawn) {
    drawing = true;
    points.push(new Complex(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)); // Add the starting point
    draw(e);
  }
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
    // points.push(null); // Use null as a separator for different segments
    drawn = true;
}

function clearCanvas() {
  drawn = false;
  drawing = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  points = [];
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


// input is array of complex numbers
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

// IFFT
// sum of X_k/N * e^(i2pikn/N)
// the tiem variable is n
async function vectorAnimation() {

  console.log("Starting animation");

  // subject to change
  const everyNPoints = 1;

  let transform = fft(everyNPointsArray(everyNPoints));
  let N = transform.length;

  let previosPoint = null;

  for (let n = 0; n < N; n += .25) {
    clearCanvas();

    let currentlyAt = new Complex(0, 0);
    
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'red';

    for (let k = 0; k < N; k++) {
      // draw vector k
      let esec = Polar.convertToRectangular(new Polar(1/N, 2 * Math.PI * k * n / N));
      let Xk = transform[k];
      let vector = Complex.product(Xk, esec);

      let previousX = currentlyAt.x;
      let previousY = currentlyAt.y;

      currentlyAt = Complex.add(currentlyAt, vector);

      let currentX = currentlyAt.x;
      let currentY = currentlyAt.y;

      drawArrow(ctx, previousX, previousY, currentX, currentY);

      /*
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      */
    }

    ctx.strokeStyle = 'black';

    let currentX = currentlyAt.x;
    let currentY = currentlyAt.y;

    ctx.fillRect(currentX, currentY, 1, 1);

    /*
    if (previousPoint !== null) {
      
    
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'black';

      let previousX = currentlyAt.x;
      let previousY = currentlyAt.y;
      let currentX = currentlyAt.x;
      let currentY = currentlyAt.y;

      ctx.moveTo(previousX, previousY);
      ctx.beginPath();
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    }
    previousPoint = currentlyAt;
    */

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
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add a button to print points
const printButton = document.createElement('button');
printButton.innerText = 'Print Points';
printButton.addEventListener('click', everyNPointsArray);
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





























class Complex {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static add(pt1, pt2) {
    return new Complex(pt1.x + pt2.x, pt1.y + pt2.y);
  }

  static sum() {
    var total = new Complex(0, 0);
    for (let i = 0; i < arguments.length; i++) {
      total = this.add(total, arguments[i]);
    }
    return total;
  }
  static subtract(pt1, pt2) {
    return new Complex(pt1.x - pt2.x, pt1.y - pt2.y);
  }

  multiplyScalar(d) {
    return new Complex(this.x * d, this.y * d);
  }

  divideScalar(d) {
    return new Complex(this.x / d, this.y / d);
  }

  static multiply(pt1, pt2){
    return new Complex(pt1.x * pt2.x - pt1.y * pt2.y, pt1.x * pt2.y + pt1.y * pt2.x)
  }

  static product(){
    var prod = new Complex(1, 0);
    for (let i = 0; i < arguments.length; i++){
      prod = this.multiply(prod, arguments[i])
    }
    return prod;
  }

  static equals(pt1, pt2) {
    return pt1.x === pt2.x && pt1.y === pt2.y;
  }

  static distance(pt1, pt2) {
    const d = Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
    return d;
  }

  static magnitude(pt) {
    return(Math.sqrt(pt.x * pt.x + pt.y * pt.y));
  }

  static rotate(pt1, pt2, theta) {
    const shifted = new Complex(pt2.x - pt1.x, pt2.y - pt1.y);
    const xcord = shifted.x * Math.cos(theta) - shifted.y * Math.sin(theta);
    const ycord = shifted.y * Math.cos(theta) + shifted.x * Math.sin(theta);
    return new Complex(xcord + pt1.x, ycord + pt1.y);
  }

  static print(pt) {
    console.log(`(${pt.x}, ${pt.y})`);
  }

  static lerp(pt1, pt2, t) {
    // 0 <= t <= 1
    const x = (1 - t) * pt1.x + t * pt2.x;
    const y = (1 - t) * pt1.y + t * pt2.y;
    return new Complex(x, y);
  }
  
  static convertToPolar(pt) {
    const theta = Math.atan2(pt.y, pt.x);
    const r = Math.sqrt(pt.x * pt.x + pt.y * pt.y)
    return new Polar(r, theta);
  }
}

// in the form c * e ^ (theta * i)
// c is a constant
// theta is also a constant

class Polar {
    constructor(c, theta) {
      this.c = c;
      this.theta = theta;
    }
  
    //multiplying c1 * e^(t1*i) * c2 * e^(t2*i) = c1*c2 * e^((t2 + t1) *i)
    static multiply(pt1, pt2) {
      return new Polar(pt1.c * pt2.c, pt1.theta + pt2.theta);
    }
  
    // divides point 1 by point 2
    static divide(pt1, pt2) {
      return new Polar(pt1.c / pt2.c, pt1.theta - pt2.theta);
    }
  
    static equals(pt) {
      return pt1.c === pt2.c && pt1.theta === pt2.theta;
    }
  
    // rotates pt about the origin counterclockwise by theta radians
    static rotate(pt, theta) {
      return new Polar(pt.c, pt.theta + theta);
    }
  
    static print(pt) {
      console.log(`(${pt.c}, ${pt.theta})`);
    }
  
    // converts to rectangular coords
    static convertToRectangular(pt) {
      const x = pt.c * Math.cos(pt.theta);
      const y = pt.c * Math.sin(pt.theta);
      return new Complex(x, y);
    }
  
    // static lerp(pt1, pt2, t) {
    //   // 0 <= t <= 1
    //   const x = (1 - t) * pt1.x + t * pt2.x;
    //   const y = (1 - t) * pt1.y + t * pt2.y;
    //   return new Point(x, y);
    // }
}


class complexFourierSeries {
  constructor(frequency, cValues) {
      this.terms = terms;
  }


}
