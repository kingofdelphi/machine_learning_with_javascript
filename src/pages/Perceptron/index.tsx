import React, { useState, useRef, useEffect } from 'react';
import * as MathJs from "mathjs";
import { fabric } from 'fabric';
import styled from 'styled-components';

import Input from "../../components/Input";

import stepSolve, { hypothesis } from '../../engine/perceptron';
import { Row, normalizeData, denormalizeData } from '../../engine/common';

import styles from './styles.module.scss';

let user_data : Array<Row> = [];
let user_output : Array<number> = [];

function updateFabricCanvas(canvas: fabric.Canvas, state: { [key:string]: any }) {
  const mouseDownHandler = (event: fabric.IEvent) => {
    const x = event.pointer!.x;
    const y = event.pointer!.y;
    const r = 20;
    user_data.push([x - r / 2, y - r / 2]);
    user_output.push(state.class! === 'green' ? 1 : -1);
    console.log(user_output);
    const circle = new fabric.Circle({
      left: x - r / 2,
      top: y - r / 2,
      radius: 3,
      stroke: state.class,
      strokeWidth: r - 3,
      fill: ''
    });
    canvas.add(circle);
  };
  canvas.on({
    'mouse:down': mouseDownHandler
  });
}

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
  regressionLine?: fabric.Line;
  message?: fabric.Text;
  animFrameId?: number;
};

const solveAnimationInfo: SolveAnimationInfo = {};

function solve(fabricCanvas: fabric.Canvas, iterationsLeft: number, learningRate: number, degree: number) {
  const { trainingData, trainingOutput, coefficients } = trainingInfo;
  const normInfo = normalizeData(trainingData, trainingOutput);
  const result = stepSolve(coefficients, normInfo.dataset, trainingOutput, learningRate, degree);
  trainingInfo.coefficients = result.coefficients;

  const { regressionLine } = solveAnimationInfo;

  solveAnimationInfo.message!.set({
    text: `Iterations Left: ${iterationsLeft}`
  });

  const [bias, ...w] = coefficients;
  const mag = MathJs.norm(w);
  const unitW = MathJs.divide(w, mag) as Array<number>;
  const distance = -bias / (mag as number);
  const point = MathJs.multiply(unitW, distance) as Array<number>;
  const rotated = [unitW[1], -unitW[0]];

  const lpoint = MathJs.add(point, MathJs.multiply(rotated, -20)) as Array<number>;
  const rpoint = MathJs.add(point, MathJs.multiply(rotated, 20)) as Array<number>;
  
  const boundaryInfo = denormalizeData([[1, ...point], [1, ...lpoint], [1, ...rpoint]], [0], normInfo.featureMeta, normInfo.outputMeta);
  regressionLine!.set({
    stroke: ['red', 'green'][0 % 2],
    strokeWidth: 2,
    objectCaching: false,
    x1: boundaryInfo.dataset[1][1],
    y1: boundaryInfo.dataset[1][2],
    x2: boundaryInfo.dataset[2][1],
    y2: boundaryInfo.dataset[2][2],
  })
  return result.cost;
}

function startSolve(fabricCanvas: fabric.Canvas, iterations: number, learningRate: number, degree: number) {
  trainingInfo.trainingData = user_data.map(x_coord => {
    return [1, ...x_coord]
  });
  trainingInfo.trainingOutput = user_output;
  trainingInfo.coefficients = new Array(degree + 1).fill(0);
  
  // add UI info for fabric canvas
  if (!solveAnimationInfo.regressionLine) {
    solveAnimationInfo.regressionLine = new fabric.Line();
    fabricCanvas.add(solveAnimationInfo.regressionLine);

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

const Main = styled.div`
  display: flex;
  height: 100%;
  label > span {
    width: 110px;
  }
`;

function Perceptron() {
  const ref = useRef(null);

  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  const stateRef = useRef({ class: 'green' });

  const reset = () => {
    stopSolve();
    user_data = [];
    user_output = [];
    solveAnimationInfo.regressionLine = undefined;
    solveAnimationInfo.message = undefined;
    if (fabricCanvas) {
      // why this check, 
      // because reset is a closure, this method is called by useEffect hook during unmount
      // as well as button reset
      fabricCanvas.clear();
    }
  };

  useEffect(() => {
    const node: HTMLElement = ref.current!;
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
  const [learningRate, setLearningRate] = useState(0.001);
  const [degree, setDegree] = useState(2);

  const changeClass = (cls: string) => {
    const newClass = cls;
    setClass(newClass);
    stateRef.current.class = newClass;
  }

  const animSolve = () => {
    if (user_data.length === 0) {
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
      </div>
    </Main>
  );
}

export default Perceptron
