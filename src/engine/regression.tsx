import * as MathJs from 'mathjs';

export type Row = Array<number>;

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

interface NormalizationMeta {
  min: number;
  max: number;
}

interface FeatureNormalizationMeta {
  [key: number]: NormalizationMeta
}

const getNormalizationMeta = (dataset: Array<Row>, output: Array<number>) => {
  const featureCount = dataset[0].length;
  const featureMeta: FeatureNormalizationMeta = {};
  for (let i = 0; i < featureCount; ++i) {
    const featureValues = dataset.map(d => d[i]);
    const min = MathJs.min(featureValues);
    const max = MathJs.max(featureValues);
    featureMeta[i] = {
      min,
      max
    }
  }

  const outputMeta: NormalizationMeta = {
    min: MathJs.min(output),
    max: MathJs.max(output),
  };
  
  return {
    featureMeta,
    outputMeta
  };
};

const normalizeData = (dataset: Array<Row>, output: Array<number>) => {
  const { featureMeta, outputMeta } = getNormalizationMeta(dataset, output);
  const normalizedDataset = dataset.map(datum => {
    return datum.map((featureValue, featureIndex) => {
      const normInfo = featureMeta[featureIndex];
      return featureIndex === 0 ? featureValue : (featureValue - normInfo.min) / (normInfo.max - normInfo.min + 1);
    });
  });

  const normalizedOutput = output.map(value => {
      return (value - outputMeta.min) / (outputMeta.max - outputMeta.min + 1);
  });
  return {
    dataset: normalizedDataset,
    output: normalizedOutput,
    featureMeta,
    outputMeta
  };
}

const denormalizeData = (dataset: Array<Row>, output: Array<number>, featureMeta: FeatureNormalizationMeta, outputMeta: NormalizationMeta) => {
  const denormalizedData = dataset.map(datum => {
    return datum.map((featureValue, featureIndex) => {
      const normInfo = featureMeta[featureIndex];
      return featureIndex === 0 ? featureValue : normInfo.min + featureValue * (normInfo.max - normInfo.min + 1);
    });
  });
  const denormalizedOutput = output.map(value => {
      return outputMeta.min + value * (outputMeta.max - outputMeta.min + 1);
  });
  return {
    dataset: denormalizedData,
    output: denormalizedOutput
  }
};

export default stepSolve;

export {
  hypothesis,
  normalizeData,
  denormalizeData
}