import * as MathJs from 'mathjs';
import { Row } from './common';

const hypothesis = (coefficients: Array<number>, datum: Row) => {
  return MathJs.dot(coefficients, datum);
};

const stepSolve = (coefficients: Array<number>, trainingSet: Array<Row>, output: Array<number>, learningRate: number) => {
  const errorDelta: Array<number> = [];
  let cost = 0;

  for (let i = 0; i < trainingSet.length; ++i) {
    errorDelta.push(hypothesis(coefficients, trainingSet[i]) - output[i]);
    cost += errorDelta[i] * errorDelta[i];
  }
  // err = (h(xi) - yi)^2 + ....
  // de/d(ci) = 2*(h(xj)-yj)*xji
  const deltaCoefficients = coefficients.map((_, i) => {
    const xis = trainingSet.map(d => d[i]);
    return MathJs.dot(errorDelta, xis);
  });

  return {
    cost,
    coefficients: MathJs.add(coefficients, MathJs.multiply(deltaCoefficients, -learningRate)) as Array<number>
  };
};

export default stepSolve;

export {
  hypothesis,
}