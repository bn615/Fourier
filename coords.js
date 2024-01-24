class Complex {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(pt) {
    return new Complex(this.x + pt.x, this.y + pt.y);
  }

  subtract(pt) {
    return new Complex(this.x - pt.x, this.y - pt.y);
  }

  multiplyScalar(d) {
    return new Complex(this.x * d, this.y * d);
  }

  divideScalar(d) {
    return new Complex(this.x / d, this.y / d);
  }
  multiply(pt){
    return new Complex(this.x * pt.x - this.y * pt.y, this.x * pt.y + this.y * pt.x)
  }

  equals(pt) {
    return this.x === pt.x && this.y === pt.y;
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
    multiply(pt) {
      return new Polar(this.c * pt.c, this.theta + pt.theta);
    }
  
    divide(pt) {
    return new Polar(this.c / pt.c, this.theta - pt.theta);
    }
  
    equals(pt) {
      return this.c === pt.c && this.theta === pt.theta;
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


class ComplexFourierSeries {
  constructor(termsdf) {
      this.termsdf = termsdf;
  }

  extract(i){
    const extractedRow = termsdf.filter(row => row.get(String(i)) !== undefined).toArray()[0];
    const frequency = parseInt(Object.keys(extractedRow)[0]);
    const constant = extractedRow[frequency][0];
    return Polar(constant, frequency * 2 * PI);
  }


  evaluate(t) {
      let result = new Complex(0, 0);

      for (let k = -(termsdf.count() - 1) / 2; k < (termsdf.count() + 1) / 2; k++) {
        const polarTerm = termsdf.extract(i);
        const term = Polar.convertToRectangular(Polar(polarTerm.c, polarTerm.theta * t));
        result = result.add(term);
      }
      
      return result;
  }
}
