import * as MathJs from 'mathjs';

export type Row = Array<number>;

export interface NormalizationMeta {
  min: number;
  max: number;
}

export interface FeatureNormalizationMeta {
  [key: number]: NormalizationMeta
}

// data is a column of features
export const getNormalizationMeta = (data: Array<number>) => {
  const outputMeta: NormalizationMeta = {
    min: MathJs.min(data),
    max: MathJs.max(data),
  };
  
  return outputMeta;
};

// dataset is array of world point
export const denormalizeData = (dataset: Array<Row>, featureMeta: FeatureNormalizationMeta) => {
  const denormalizedData = dataset.map(datum => {
    return datum.map((featureValue, featureIndex) => {
      const normInfo = featureMeta[featureIndex];
      return normInfo.min + featureValue * (normInfo.max - normInfo.min + 1);
    });
  });
  return {
    dataset: denormalizedData,
  }
};

// dataset is array of world point
export const normalizeData = (dataset: Array<Row>) => {
  const featureMeta : FeatureNormalizationMeta = {};
  MathJs.transpose(dataset).forEach((d, i) => {
    const info = getNormalizationMeta(d);
    featureMeta[i] = info;
  });
  const normalizedDataset = dataset.map(datum => {
    return datum.map((featureValue, featureIndex) => {
      const normInfo = featureMeta[featureIndex];
      return (featureValue - normInfo.min) / (normInfo.max - normInfo.min + 1);
    });
  });

  return {
    dataset: normalizedDataset,
    featureMeta,
  };
}
