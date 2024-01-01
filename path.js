
function deCasteljau(path, t) {
    if (path.length === 1) {
      return path;
    }
  
    const newPath = [];
  
    for (let i = 0; i < path.length - 1; i++) {
      const nextPoint = Complex.lerp(path[i], path[i + 1], t);
      
      newPath.push(nextPoint);
    }
  
    return deCasteljau(newPath, t);
  }
  
function injection(path, numPoints) {
    const newPath = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const addPoint = deCasteljau(path, t)[0];
      newPath.push(addPoint);
    }
  
    return newPath;
}
  
  
function generateCumulativeDistance(path) {
  let d = 0;
  const cumDistance = [0];
  
  for (let i = 0; i < path.length - 1; i++) {
    const pointToPointDistance = Complex.distance(path[i], path[i + 1]);
    d += pointToPointDistance;
    cumDistance.push(d);
  }
  
  return cumDistance;
}
  
function cubicSpline(path, numPoints) {
  const sectionedSpline = [];
  
  for (let i = 0; i < path.length - 1; i += 3) {
    const curve = [path[i], path[i + 1], path[i + 2], path[i + 3]];
    const injectedCurve = injection(curve, numPoints);
    sectionedSpline.push(injectedCurve);
  }
  
  const newPath = [];
  for (let i = 0; i < sectionedSpline.length * numPoints; i++) {
    const t = i / numPoints;
    const u = Math.floor(t);
    const tPrime = t - u;
    const addPoint = deCasteljau(sectionedSpline[u], tPrime)[0];
    newPath.push(addPoint);
  }
  
  const lastPoint = path[path.length - 1];
  newPath.push(lastPoint);
  
  return newPath;
}

function cubicSpline2(path, distance, approx) {
  const numPoints = Math.floor(approx);
  const sectionedSpline = [];
  
  for (let i = 0; i < path.length - 1; i += 3) {
    const curve = [path[i], path[i + 1], path[i + 2], path[i + 3]];
    const injectedCurve = injection(curve, numPoints);
    sectionedSpline.push(injectedCurve);
  }
  
  const sampleSpline = cubicSpline(path, numPoints);
  const cumDistance = generateCumulativeDistance(sampleSpline);
  const curveLength = cumDistance[cumDistance.length - 1];
  const totalPoints = Math.floor(curveLength / distance);
  distance = curveLength / totalPoints;
  const newPath = [];
  let dCounter = 0;

  for (let i = 0; i < totalPoints; i++) {
    const dValue = i * distance;
    for (let j = dCounter; j < totalPoints; j++) {
      if (cumDistance[j] <= dValue && dValue <= cumDistance[j + 1]) {
        const slope = (cumDistance[j + 1] - cumDistance[j]) * approx;
        const t = (dValue - cumDistance[j]) / slope + j / approx;
        const u = Math.floor(t);
        const tPrime = t - u;
        const addPoint = deCasteljau(sectionedSpline[u], tPrime)[0];
        newPath.push(addPoint);
        dCounter = j;
        break;
      }
    }
  }
  
  const lastPoint = path[path.length - 1];
  newPath.push(lastPoint);
  
  return newPath;
}

