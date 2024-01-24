const canvas = document.getElementById('fourierCanvas');
const ctx = canvas.getContext('2d');

// Sample Fourier Series Terms
const termsData = [
  { '1': [1, 0] },
  { '2': [0.5, Math.PI / 2] },
  // Add more terms as needed
];

const termsdf = new DataFrame(termsData);
const fourierSeries = new ComplexFourierSeries(termsdf);

// Animation Parameters
const totalTime = 2 * Math.PI;
const numFrames = 60;
const frameDuration = totalTime / numFrames;
let currentFrame = 0;

function animate() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Evaluate Fourier Series at current time
  const t = currentFrame / numFrames;
  const result = fourierSeries.evaluate(t);

  // Convert result to Cartesian coordinates for drawing
  const x = result.x * (canvas.width / 2) + canvas.width / 2;
  const y = result.y * (canvas.height / 2) + canvas.height / 2;

  // Draw a point at (x, y)
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = '#000';
  ctx.fill();

  // Increment frame
  currentFrame++;

  // Repeat the animation
  if (currentFrame < numFrames) {
    requestAnimationFrame(animate);
  }
}

// Start the animation
animate();