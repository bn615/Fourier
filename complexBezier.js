function choose(n, k){
  if((n / 2) < k){
      k = n - k;
  }
  if(k == 0) {
      return 1;
  }
  if(k > n){
      return 0;
  }
  let result = 1;
  for(let i = n; i > n - k; i--){
      result = result * i;
  }
  for(let i = 1; i <= k; i++){
      result = result / i;
  }
  return result;
  
}

// generates coefficients for bezier curves expressed in berstein polynomial form
// n is the degree of the bezier curve
function generateBernstein(n){
  const coeffs = [];
  for(let i = 0; i <= n; i++){
      const coI = [];
      const cof = choose(n, i);
      for(let k = n - i; k >= 0; k--){
          if ((k % 2) == 1){
              coI.push(-1 * cof * choose(n - i, k));
          }
          else{
              coI.push(cof * choose(n - i, k));
          }
      }   
      while(coI.length < (n + 1)){
          coI.push(0);
      }
      coeffs.push(coI);
  }
  return coeffs;
}


class complexBezier {
  constructor(points, coeffs = generateBernstein(points.length - 1), injected = [], cumD = []){
      this.points = points;
      this.coeffs = coeffs;
      this.injected = injected;
      this.cumD = cumD;
  }
  

  evaluate(t){
      const degree = this.points.length - 1;
      const tCoeffs = [];
      for(let i = 0; i <= degree; i++){
          let tValue = 0;
          for(let k = 0; k <= degree; k++){
              tValue += this.coeffs[i][k] * Math.pow(t, degree - k);
          }
          tCoeffs.push(tValue);
      }

      let pt = new Point(0, 0);
      for(let i = 0; i <= degree; i++){
          pt = Point.add(pt, this.points[i].multiply(tCoeffs[i]));
      }
      return pt;
  }

  // injects numPoints of points into the curve
  inject(numPoints){
      const path = [];
      for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints;
          const addPoint = this.evaluate(t);
          path.push([t, addPoint]);
      }
      this.injected = path;
      
      return this;
  }

  // generates cumulative Distance LUT
  generateCD(){
      let d = 0;
      const cumDistance = [[0, 0]];
      
      for (let i = 0; i < this.injected.length - 1; i++) {
          const pointToPointDistance = Point.distance(this.injected[i][1], this.injected[i + 1][1]);
          d += pointToPointDistance;
          cumDistance.push([this.injected[i + 1][0], d]);
      }
      
      this.cumD = cumDistance;
      return this;
  }

  // gets t-value for a distance value given the cum dist LUT
  getT(dist){
      for(let i = 1; i < this.cumD.length; i++){
          if(this.cumD[i][1] >= dist){
              const dValue1 = new Point(this.cumD[i - 1][0], this.cumD[i - 1][1]);
              const dValue2 = new Point(this.cumD[i][0], this.cumD[i][1]);
              
              const t = (dist - dValue1.y) / (dValue2.y - dValue1.y);
              
              const findingT = Point.lerp(dValue1, dValue2, t);
              return(findingT.x);
          }
      }
  }

  // injects points based on distance between each 2 points instead of t values
  // adjust -> if true, adjust the distance between by a tiny margin such that the end point of the bezier is contained on the injected bezier
  // if false, no adjustment is made.
  spaceInject(distBetween, adjust = true){
      //default injects 50, generates cD if the injected attribute is empty
      if(this.injected.length == 0){
          this.inject(50); 
          this.generateCD();
      }

      const path = [];

      const curveLength = this.cumD[this.cumD.length - 1][1];
      const numPoints = Math.floor(curveLength / distBetween);

      //adjusting distance between 
      if(adjust == true){
          distBetween = curveLength / numPoints;
      }


      for(let i = 0; i < numPoints + 1; i++){
          const distAtPoint = i * distBetween;
          const t = this.getT(distAtPoint);
          path.push([t, this.evaluate(t)]);
      }
      this.injected = path;
      return this;
  }

  // calculates derivative (velocity)
  derivative(){
      const bez = new Bernstein(this.points, this.coeffs);
      const degree = bez.points.length - 1;
      for(let i = 0; i <= degree; i++){
          for(let k = 0; k <= degree; k++){
              bez.coeffs[i][k] *= (degree - k);
          }
          bez.coeffs[i].pop();
          bez.coeffs[i].unshift(0);
      }
      return bez;
  }

  //calculates 2nd derivative (acceleration)
  secondDerivative(){
      const bez = new Bernstein(this.points);
      return bez.derivative().derivative();
  }

  // calculates 3rd derivative (jerk)
  thirdDerivative(){
      const bez = new Bernstein(this.points);
      return bez.secondDerivative().derivative();
  }


  // calculates signed curvature at t value
  curvature(t){
      const bez = new Bernstein(this.points);
      const firstD = bez.derivative();
      const secondD = bez.secondDerivative();
      const firstDPoint = firstD.evaluate(t);
      const secondDPoint = secondD.evaluate(t);
      const numerator = firstDPoint.x * secondDPoint.y - firstDPoint.y * secondDPoint.x;
      const denominator = Math.pow(firstDPoint.magnitude(), 3);
      return numerator / denominator;
  }

  
}



class spline {
    constructor(points, sectioned = [], spline = [], degree = 3){
        this.points = points;
        this.sectioned = sectioned;
        this.spline = spline;
        this.degree = degree;
    }

    section() {
        const sectionedPoints = [];
        for (let i = 3; i < this.points.length; i += 3) {
            const bez = new Bernstein([this.points[i - 3], this.points[i - 2], this.points[i - 1], this.points[i]]);
            sectionedPoints.push(bez);
        }

        this.sectioned = sectionedPoints;
    }

    evaluate(t) {
        if(t == this.sectioned.length){
            return this.sectioned[t - 1].evaluate(1);
        }

        // u is the integral part of t
        const u = Math.floor(t);
        const tPrime = t - u;
        return this.sectioned[u].evaluate(tPrime);
    }

    inject(numPoints){
        if(this.sectioned.length == 0){
            this.section();
        }
        for(let i = 0; i < this.sectioned.length; i++){
            this.sectioned[i].inject(Math.floor(numPoints / this.sectioned.length));
        }
        return this;
    }

    MultiCumDistLUT(){
        let lastLD = 0;
        for(let i = 0; i < this.sectioned.length; i++){
            this.sectioned[i].generateCD();
            for(let j = 0; j < this.sectioned[i].cumD.length; j++){
                this.sectioned[i].cumD[j][1] += lastLD;
                // console.log(this.sectioned[i].cumD[j])
            }
            lastLD = this.sectioned[i].cumD[this.sectioned[i].cumD.length - 1][1];
           
            
        }
        return this;
    }

    getT(dist){
        for(let k = 0; k < this.sectioned.length; k++){
            for(let i = 1; i < this.sectioned[k].cumD.length; i++){
                if(this.sectioned[k].cumD[i][1] >= dist - 0.001){
                    const dValue1 = new Point(this.sectioned[k].cumD[i - 1][0], this.sectioned[k].cumD[i - 1][1]);
                    const dValue2 = new Point(this.sectioned[k].cumD[i][0], this.sectioned[k].cumD[i][1]);
                    const t = (dist - dValue1.y) / (dValue2.y - dValue1.y);
                    const findingT = Point.lerp(dValue1, dValue2, t);
                    return(findingT.x + k);
                }
            }
        }
    }

    spaceInject(distBetween){
        this.section();
        this.inject(50 * this.sectioned.length); 
        this.MultiCumDistLUT();
        

        const path = [];
        const curveLength = this.sectioned[this.sectioned.length - 1].cumD[this.sectioned[this.sectioned.length - 1].cumD.length - 1][1];
        
        const numPoints = Math.floor(curveLength / distBetween);
        
        distBetween = curveLength / numPoints;

        for(let i = 0; i < numPoints + 1; i++){
            const distAtPoint = i * distBetween;
            const t = this.getT(distAtPoint);
            const pt = this.evaluate(t);
            path.push([t, pt]);
        }
        this.spline = path;
        
    }
    
}
