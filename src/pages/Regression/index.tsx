import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import styled from 'styled-components';

import Input from "../../components/Input";

import stepSolve, { hypothesis } from '../../engine/regression';
import { NormalizationMeta, FeatureNormalizationMeta, Row, normalizeData, denormalizeData } from '../../engine/common';

import styles from './styles.module.scss';

let x_coords : Array<number> = [];
let y_coords : Array<number> = [];

function updateFabricCanvas(canvas: fabric.Canvas, state: { [key:string]: any }) {
  const mouseDownHandler = (event: fabric.IEvent) => {
    const x = event.pointer!.x;
    const y = event.pointer!.y;
    x_coords.push(x);
    y_coords.push(y);
    const r = 20;
    const circle = new fabric.Circle({
      left: x - r / 2,
      top: y - r / 2,
      radius: 4,
      stroke: state.class,
      strokeWidth: r,
      fill: ''
    });
    canvas.add(circle);
  };
  canvas.on({
    'mouse:down': mouseDownHandler
  });
}


const buildRowFromXCoord = (x_coord: number, degree: number) => {
    return new Array(degree + 1).fill(0).map((_, i) => Math.pow(x_coord, i));
};

interface TrainingInfo {
  trainingData: Array<Row>;
  trainingOutput: Array<number>;
  coefficients: Array<number>;
  featureMeta: FeatureNormalizationMeta;
  outputMeta?: NormalizationMeta;
};

const trainingInfo: TrainingInfo = {
  trainingData: [],
  trainingOutput: [],
  coefficients: [],
  featureMeta: {}
};

interface SolveAnimationInfo {
  regressionLines: Array<fabric.Line>;
  segmentCount: number;
  message?: fabric.Text;
  animFrameId?: number;
};

const solveAnimationInfo: SolveAnimationInfo = {
  regressionLines: [],
  segmentCount: 500
};

function solve(fabricCanvas: fabric.Canvas, iterationsLeft: number, learningRate: number, degree: number) {
  const { trainingData, trainingOutput, coefficients, featureMeta, outputMeta } = trainingInfo;
  const result = stepSolve(coefficients, trainingData, trainingOutput, learningRate);
  trainingInfo.coefficients = result.coefficients;

  const regData: Array<Row> = [];
  const regOutput: Array<number> = [];
  const { segmentCount, regressionLines } = solveAnimationInfo;
  const L = -10, R = 10;
  for (let i = 0; i < segmentCount; ++i) {
    const x = i === 0 ? L : L + (R - L) * i / (segmentCount - 1);
    regData.push([x]);
    const row = buildRowFromXCoord(x, degree);
    regOutput.push(hypothesis(coefficients, row));
  }

  solveAnimationInfo.message!.set({
    text: `Iterations Left: ${iterationsLeft}`
  });

  const modelToWorldInput = denormalizeData(regData, featureMeta);
  const modelToWorldOutput = denormalizeData(regOutput.map(d => [d]), { 0: outputMeta! })

  const pts = modelToWorldInput.dataset;
  const ycords = modelToWorldOutput.dataset.reduce((acc, d) => {
    acc.push(d[0]);
    return acc;
  }, []);

  for (let i = 0; i + 1 < segmentCount; ++i) {
    const line = regressionLines[i];
    line.set({
      stroke: ['red', 'green'][i % 2],
      strokeWidth: 2,
      objectCaching: false,
      x1: pts[i][0],
      y1: ycords[i],
      x2: pts[i + 1][0],
      y2: ycords[i + 1],
    })
  }
  return result.cost;
}

function startSolve(fabricCanvas: fabric.Canvas, iterations: number, learningRate: number, degree: number) {
  const trainingInputNormInfo = normalizeData(x_coords.map(d => [d]));
  const trainingOutputNormInfo = normalizeData(y_coords.map(d => [d]))
  trainingInfo.trainingData = trainingInputNormInfo.dataset.map(d => buildRowFromXCoord(d[0], degree));
  trainingInfo.trainingOutput = trainingOutputNormInfo.dataset.reduce(
    (acc, d) => {
      acc.push(d[0])
      return acc;
    }, []);
  trainingInfo.featureMeta = trainingInputNormInfo.featureMeta;
  trainingInfo.outputMeta = trainingOutputNormInfo.featureMeta[0];
  trainingInfo.coefficients = new Array(degree + 1).fill(0);
  
  // add UI info for fabric canvas
  if (solveAnimationInfo.regressionLines.length === 0) {
    for (let i = 0; i + 1 < solveAnimationInfo.segmentCount; ++i) {
      solveAnimationInfo.regressionLines.push(new fabric.Line());
      fabricCanvas.add(solveAnimationInfo.regressionLines[i]);
    }
    solveAnimationInfo.message = new fabric.Text("");
    fabricCanvas.add(solveAnimationInfo.message);
  }
  const updater = () => {
    iterations--
    solve(fabricCanvas, iterations, learningRate, degree);
    fabricCanvas.renderAll();
    if (iterations === 0) return;
    solveAnimationInfo.animFrameId = window.requestAnimationFrame(updater);
  };
  updater();
}

function stopSolve() {
  cancelAnimationFrame(solveAnimationInfo.animFrameId!);
}

const RadioButton = styled.button<{ selected: boolean, color: string }>`
  min-width: 30px;
  min-height: 30px;
  max-width: 30px;
  max-height: 30px;
  cursor: pointer;
  &:focus {
    outline: none;
  }
  color: ${props => props.color};
  background: ${props => props.color};
  border-radius: 50%;
  border: ${props => `8px solid ${props.selected ? "rgba(0, 0, 0, .5)" : "currentColor"}`};
`;

const Button = styled.button`
  padding: 10px 20px;
`;

const SInput = styled(Input)``;

const Main = styled.div`
  display: flex;
  height: 100%;
  ${SInput} > span {
    width: 110px;
  }
`;

function Regression() {
  const ref = useRef(null);

  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  const stateRef = useRef({ class: 'green' });

  const reset = () => {
    stopSolve();
    x_coords = [];
    y_coords = [];
    solveAnimationInfo.regressionLines = [];
    solveAnimationInfo.message = undefined;
    if (fabricCanvas) {
      // why this check, 
      // because reset is a closure, this method is called by useEffect hook during unmount
      // as well as button reset
      fabricCanvas.clear();
    }
  };

  useEffect(() => {
    const node : HTMLElement = ref.current!;
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    node.append(canvas);
    const bounds = node.getBoundingClientRect();
    const fcanvas = new fabric.Canvas('canvas');
    fcanvas.setWidth(bounds.width);
    fcanvas.setHeight(bounds.height);
    updateFabricCanvas(fcanvas, stateRef.current);
    setFabricCanvas(fcanvas);
    return () => {
      reset();
      fcanvas.dispose();
    }
  }, []);

  const [cls, setClass] = useState('green');
  const [iterations, setIterations] = useState(10000);
  const [learningRate, setLearningRate] = useState(0.1);
  const [degree, setDegree] = useState(1);

  const changeClass = (cls : string) => {
    const newClass = cls;
    setClass(newClass);
    stateRef.current.class = newClass;
  }

  const animSolve = () => {
    if (x_coords.length === 0) {
      alert("please add some points");
      return;
    }
    stopSolve();
    startSolve(fabricCanvas!, iterations, learningRate, degree);
  }

  return (
    <Main>
      <div ref={ref} className={styles["fabric-wrapper"]}>
      </div>
      <div className={styles.menu}>
        <div className={styles['cls-buttons']}>
          <RadioButton color="green" selected={cls === "green"} onClick={() => changeClass('green')} />
          <span>Click on middle window to create a point</span>
        </div>
        <div className={styles["action-buttons"]}>
          <Button onClick={animSolve}>Solve</Button>
          <Button onClick={stopSolve}>Stop</Button>
          <Button onClick={reset}>Reset</Button>
        </div>
        <SInput type="number" label="Iterations" value={"" + iterations} onChange={v => setIterations(+v)} />
        <SInput type="number" label="Learning Rate" value={"" + learningRate} onChange={v => setLearningRate(+v)} />
        <SInput type="number" label="Degree" value={"" + degree} onChange={v => setDegree(+v)} />
      </div>
    </Main>
  );
}

export default Regression