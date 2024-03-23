function pathToBezier(path, k = 15){

    const numPoints = path.length;
    const pointsPerSection = numPoints / k;

    const bezPts = [];

    for(let i = 0; i < numPoints - 1; i += pointsPerSection){
        const j = Math.floor(i);
        const p0 = path[j];
        const p3 = path[Math.floor(j + pointsPerSection)];

        const X = path[Math.floor(j + pointsPerSection / 3)];
        const Y = path[Math.floor(i + 2 * pointsPerSection / 3)];

        const M = Complex.subtract(Complex.subtract(X, p0.multiplyScalar(8/27)),p3.multiplyScalar(1/27));
        const N = Complex.subtract(Complex.subtract(Y, p0.multiplyScalar(1/27)),p3.multiplyScalar(8/27));

        const p1 = Complex.subtract(M.multiplyScalar(3), N.multiplyScalar(3/2));
        const p2 = Complex.subtract(N.multiplyScalar(3), M.multiplyScalar(3/2));

        bezPts.push(...p0, p1, p2);

    }

    bezPts.push(path[numPoints - 1]);

    return spline(bezPts);
}