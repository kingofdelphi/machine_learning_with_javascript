import * as MathJs from 'mathjs';
import { Row } from './common';

const hypothesis = (coefficients: Array<number>, datum: Row) => {
  return MathJs.dot(coefficients, datum) >= 0 ? 1 : -1;
};

const stepSolve = (coefficients: Array<number>, trainingSet: Array<Row>, output: Array<number>, learningRate: number, degree: number) => {
  const errorDelta: Array<number> = [];
  let cost = 0;

  let new_coefficients = [...coefficients];

  for (let i = 0; i < trainingSet.length; ++i) {
    const currentOutput = hypothesis(new_coefficients, trainingSet[i]);
    const deltaOutput = currentOutput - output[i]; 
    if (deltaOutput === 0) continue;
    console.log('err', i, currentOutput, output[i]);
    new_coefficients = MathJs.add(new_coefficients, MathJs.multiply(-learningRate * deltaOutput, trainingSet[i])) as Array<number>;
    cost += errorDelta[i] * errorDelta[i];
  }

  return {
    cost,
    coefficients: new_coefficients
  };
};

export default stepSolve;

export {
  hypothesis,
}
