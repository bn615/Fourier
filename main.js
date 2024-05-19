const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let drawn = false;
let points = []; // Array to store the points

function startDrawing(e) {
  if (!drawn) {
    drawing = true;
    points.push({ x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }); // Add the starting point
    draw(e);
  }
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
    points.push(null); // Use null as a separator for different segments
    drawn = true;
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
    
    points.push({ x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }); // Add the current point
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);



// Subject to change
const everyNPoints = 1;





// Return an array containing every n points
function everyNPointsArray() {
  let result = [];
  for (var i = 0; i < points.length; i++) {
    if (points[i] == null) break;
    else if (i % everyNPoints == 0) {
      result.push(points[i]);
    }
  }
  // Debug
  console.log(result);
  return result;
}

// Add a button to print points
const printButton = document.createElement('button');
printButton.innerText = 'Print Points';
printButton.addEventListener('click', everyNPointsArray);
document.body.appendChild(printButton);
