import * as MathJs from 'mathjs';

export type Row = Array<number>;

export interface NormalizationMeta {
  min: number;
  max: number;
}

export interface FeatureNormalizationMeta {
  [key: number]: NormalizationMeta
}

export const getNormalizationMeta = (data: Array<number>) => {
  const outputMeta: NormalizationMeta = {
    min: MathJs.min(data),
    max: MathJs.max(data),
  };
  
  return outputMeta;
};

export const denormalizeData = (dataset: Array<Row>, output: Array<number>, featureMeta: FeatureNormalizationMeta, outputMeta: NormalizationMeta) => {
  const denormalizedData = dataset.map(datum => {
    return datum.map((featureValue, featureIndex) => {
      const normInfo = featureMeta[featureIndex];
      return normInfo.min + featureValue * (normInfo.max - normInfo.min + 1);
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
  const featureMeta : FeatureNormalizationMeta = {};
  MathJs.transpose(dataset).forEach((d, i) => {
    const info = getNormalizationMeta(d);
    featureMeta[i] = info;
  });
  const outputMeta = getNormalizationMeta(output);
  const normalizedDataset = dataset.map(datum => {
    return datum.map((featureValue, featureIndex) => {
      const normInfo = featureMeta[featureIndex];
      return (featureValue - normInfo.min) / (normInfo.max - normInfo.min + 1);
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
