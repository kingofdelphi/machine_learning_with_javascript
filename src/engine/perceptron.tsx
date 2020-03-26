import * as MathJs from 'mathjs';
import { Row } from './common';

const hypothesis = (coefficients: Array<number>, datum: Row) => {
  return MathJs.dot(coefficients, datum);
};

export interface Params {
  learningRate: number;
  margin: number;
}

const stepSolve = (coefficients: Array<number>, trainingSet: Array<Row>, output: Array<number>, params: Params) => {
  const errorDelta: Array<number> = [];
  let cost = 0;

  let new_coefficients = [...coefficients];

  for (let i = 0; i < trainingSet.length; ++i) {
    const hypo = hypothesis(new_coefficients, trainingSet[i]);
    const currentOutput = hypo >= params.margin ? 1 : (hypo <= -params.margin ? -1 : (-output[i]));
    const deltaOutput = currentOutput - output[i];
    if (deltaOutput === 0) continue;
    console.log('error', i)
    new_coefficients = MathJs.add(new_coefficients, MathJs.multiply(-params.learningRate * deltaOutput, trainingSet[i])) as Array<number>;
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
