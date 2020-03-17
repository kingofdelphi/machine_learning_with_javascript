import * as MathJs from 'mathjs';

export type Row = Array<number>;

interface NormalizationMeta {
  min: number;
  max: number;
}

interface FeatureNormalizationMeta {
  [key: number]: NormalizationMeta
}

export const getNormalizationMeta = (dataset: Array<Row>, output: Array<number>) => {
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

export const denormalizeData = (dataset: Array<Row>, output: Array<number>, featureMeta: FeatureNormalizationMeta, outputMeta: NormalizationMeta) => {
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

export const normalizeData = (dataset: Array<Row>, output: Array<number>) => {
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
