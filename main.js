const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const path = [];
let isDrawing = false;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);

function startDrawing(e) {
  isDrawing = true;
  path.length = 0;
  clearCanvas();
  const startPoint = getMousePosition(e);
  path.push(startPoint);
}

function draw(e) {
  if (!isDrawing) return;

  const currentPoint = getMousePosition(e);
  path.push(currentPoint);

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(path[path.length - 2].x, path[path.length - 2].y);
  ctx.lineTo(currentPoint.x, currentPoint.y);
  ctx.stroke();
  ctx.closePath();
}

function stopDrawing() {
  isDrawing = false;

  const numPoints = 100;
  const smoothedPath = cubicSpline2(path, 1, numPoints);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the smoothed path
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(smoothedPath[0].x, smoothedPath[0].y);
  for (let i = 1; i < smoothedPath.length; i++) {
    ctx.lineTo(smoothedPath[i].x, smoothedPath[i].y);
  }
  ctx.stroke();
  ctx.closePath();
}

function getMousePosition(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}