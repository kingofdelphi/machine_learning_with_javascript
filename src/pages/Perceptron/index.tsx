import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import styled from 'styled-components';

import * as MathJs from 'mathjs';

import Input from "../../components/Input";

import stepSolve, { } from '../../engine/perceptron';
import { FeatureNormalizationMeta, Row, normalizeData, denormalizeData } from '../../engine/common';

import styles from './styles.module.scss';

let user_data : Array<Row> = [];
let user_output : Array<number> = [];

function updateFabricCanvas(canvas: fabric.Canvas, state: { [key:string]: any }) {
  const mouseDownHandler = (event: fabric.IEvent) => {
    const x = event.pointer!.x;
    const y = event.pointer!.y;
    const r = 20;
    user_data.push([x, y]);
    user_output.push(state.class! === 'green' ? 1 : -1);
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
  featureMeta: FeatureNormalizationMeta;
};

const trainingInfo: TrainingInfo = {
  trainingData: [],
  trainingOutput: [],
  coefficients: [],
  featureMeta: {}
};

interface SolveAnimationInfo {
  regressionLines: Array<fabric.Line>;
  message?: fabric.Text;
  animFrameId?: number;
};

const solveAnimationInfo: SolveAnimationInfo = {
  regressionLines: []
};

function buildFeatureVectorFromPoint(point: Array<number>) {
  return [1, ...point, point[0] * point[0], point[1] * point[1]]
}

const generatePointsFromCoefficients = (coefficients: Array<number>): { points1: Array<Row>, points2: Array<Row> } => {
  // bias + ax + by + cx^2 + dy^2 = 0
  const gety = (x: number) => {
      const C = coefficients[0] + coefficients[1] * x + coefficients[3] * x * x;
      const A = coefficients[4];
      const B = coefficients[2];
      const det = B * B - 4 * A * C;
      if (det < 0) {
        return [];
      }
      const f = Math.sqrt(det);
      return [
        [x, (-B + f) / (2 * A)],
        [x, (-B - f) / (2 * A)]
      ];
  };
  const points: Array<Array<Array<number>>> = [[]];
  const pointsRev: Array<Array<Array<number>>> = [[]];
  let k = 0;
  
  for (let x = -10 ; x <= 10; x += 0.005) {
    const pts = gety(x);
    if (pts.length > 0) {
      points[k].push(pts[0]);
      if (pts[1]) pointsRev[k].push(pts[1])
    } else if (points.length === 1) {
      // breakpoint region with no solution (for hyperbola)
      points.push([]);
      pointsRev.push([]);
      k++;
    }
  }
  const merge = (pointsA: Array<Array<number>>, pointsB: Array<Array<number>>) => {
    if (pointsB.length !== pointsA.length || pointsA.length === 0) return pointsA;
    const dist1 = MathJs.distance(pointsA[0], pointsB[0]);
    const dist2 = MathJs.distance(pointsA[pointsA.length - 1], pointsB[pointsB.length - 1]);
    if (dist1 < dist2) {
      return pointsA.reverse().concat(pointsB);
    }
    return pointsA.concat(pointsB.reverse());
  };
  return {
    points1: merge(points[0], pointsRev[0]),
    points2: points.length < 2 ? [] : merge(points[1], pointsRev[1])
  }
}

function solve(fabricCanvas: fabric.Canvas, iterationsLeft: number, learningRate: number) {
  const { trainingData, trainingOutput, coefficients, featureMeta } = trainingInfo;
  const result = stepSolve(coefficients, trainingData, trainingOutput, learningRate);
  trainingInfo.coefficients = result.coefficients;

  const { regressionLines } = solveAnimationInfo;

  solveAnimationInfo.message!.set({
    text: `Iterations Left: ${iterationsLeft}`
  });

  while (regressionLines.length) fabricCanvas.remove(regressionLines.pop()!);

  const pointInfo = generatePointsFromCoefficients(trainingInfo.coefficients);

  const data = [pointInfo.points1, pointInfo.points2];

  data.forEach(points => {
    const boundaryInfo = denormalizeData(points, featureMeta);
    points.forEach((_, i) => {
      if (i === 0) return;
      const pt1 = boundaryInfo.dataset[i];
      const pt2 = boundaryInfo.dataset[i - 1];
      const line = new fabric.Line();
      regressionLines.push(line);
      fabricCanvas.add(line);
      line.set({
        stroke: ['red', 'green'][i % 2],
        strokeWidth: 2,
        objectCaching: false,
        x1: pt1[0],
        y1: pt1[1],
        x2: pt2[0],
        y2: pt2[1],
      })
    });
  })
  
  return result.cost;
}

function startSolve(fabricCanvas: fabric.Canvas, iterations: number, learningRate: number) {
  const featureCount = buildFeatureVectorFromPoint([0, 0]).length;
  
  const normInfo = normalizeData(user_data);
  trainingInfo.trainingData = normInfo.dataset.map(buildFeatureVectorFromPoint);
  trainingInfo.trainingOutput = user_output;
  trainingInfo.featureMeta = normInfo.featureMeta;
  trainingInfo.coefficients = new Array(featureCount).fill(0);
  
  // add UI info for fabric canvas
  if (!solveAnimationInfo.message) {
    solveAnimationInfo.message = new fabric.Text("");
    fabricCanvas.add(solveAnimationInfo.message);
  }

  const updater = () => {
    iterations--
    solve(fabricCanvas, iterations, learningRate);
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

const SInput = styled(Input)``;

const Button = styled.button`
  padding: 10px 20px;
`;

const Main = styled.div`
  display: flex;
  height: 100%;
  ${SInput} span {
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
    const pos = user_output.filter(d => d === 1).length;
    const neg = user_output.length - pos;
    if (pos === 0 || neg === 0) {
      alert("training set must contain both red and green classes");
      return;
    }
    stopSolve();
    startSolve(fabricCanvas!, iterations, learningRate);
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
        <SInput type="number" label="Iterations" value={"" + iterations} onChange={v => setIterations(+v)} />
        <SInput type="number" label="Learning Rate" value={"" + learningRate} onChange={v => setLearningRate(+v)} />
      </div>
    </Main>
  );
}

export default Perceptron
