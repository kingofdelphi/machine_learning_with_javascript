import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import styled from 'styled-components';

import Input from "../../components/Input";

import stepSolve, { Row, normalizeData, hypothesis, denormalizeData } from '../../engine/regression';

import styles from './styles.module.scss';

let x_coords : Array<number> = [];
let y_coords : Array<number> = [];

function updateFabricCanvas(canvas: fabric.Canvas, state: { [key:string]: any }) {
  const mouseDownHandler = (event: fabric.IEvent) => {
    const x = event.pointer!.x;
    const y = event.pointer!.y;
    x_coords.push(x);
    y_coords.push(y);
    const circle = new fabric.Circle({
      left: x,
      top: y,
      radius: 3,
      stroke: state.class,
      strokeWidth: 28,
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
};

const trainingInfo: TrainingInfo = {
  trainingData: [],
  trainingOutput: [],
  coefficients: []
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
  const { trainingData, trainingOutput, coefficients } = trainingInfo;
  const normInfo = normalizeData(trainingData, trainingOutput);
  const result = stepSolve(coefficients, normInfo.dataset, normInfo.output, learningRate, degree);
  trainingInfo.coefficients = result.coefficients;

  const regData: Array<Row> = [];
  const regOutput: Array<number> = [];
  const { segmentCount, regressionLines } = solveAnimationInfo;
  const L = -4, R = 4;
  for (let i = 0; i < segmentCount; ++i) {
    regData.push(buildRowFromXCoord(i === 0 ? L : L + (R - L) * i / (segmentCount - 1), degree));
    regOutput.push(hypothesis(coefficients, regData[i]));
  }

  solveAnimationInfo.message!.set({
    text: `Iterations Left: ${iterationsLeft}`
  });

  const regression_line = denormalizeData(regData, regOutput, normInfo.featureMeta, normInfo.outputMeta);
  const pts = regression_line.dataset;
  const ycords = regression_line.output;

  for (let i = 0; i + 1 < segmentCount; ++i) {
    const line = regressionLines[i];
    line.set({
      stroke: ['red', 'green'][i % 2],
      strokeWidth: 2,
      objectCaching: false,
      x1: pts[i][1],
      y1: ycords[i],
      x2: pts[i + 1][1],
      y2: ycords[i + 1],
    })
  }
  return result.cost;
}

function startSolve(fabricCanvas: fabric.Canvas, iterations: number, learningRate: number, degree: number) {
  trainingInfo.trainingData = x_coords.map(x_coord => {
    return buildRowFromXCoord(x_coord, degree);
  });
  trainingInfo.trainingOutput = y_coords;
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
  border: ${props => `8px solid ${props.selected ? "rgba(0, 0, 0, .3)" : "currentColor"}`};
`;

const Button = styled.button`
  padding: 10px 20px;
`;

const Main = styled.div`
  display: flex;
  height: 100%;
  label > span {
    width: 110px;
  }
`;

function LinearRegression() {
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
          <RadioButton color="red" selected={cls === "red"} onClick={() => changeClass('red')} />
          <span>Select the class and <br></br>click on middle window to drop</span>
        </div>
        <div className={styles["action-buttons"]}>
          <Button onClick={animSolve}>Solve</Button>
          <Button onClick={stopSolve}>Stop</Button>
          <Button onClick={reset}>Reset</Button>
        </div>
        <Input type="number" label="Iterations" value={"" + iterations} onChange={v => setIterations(+v)} />
        <Input type="number" label="Learning Rate" value={"" + learningRate} onChange={v => setLearningRate(+v)} />
        <Input type="number" label="Degree" value={"" + degree} onChange={v => setDegree(+v)} />
      </div>
    </Main>
  );
}

export default LinearRegression