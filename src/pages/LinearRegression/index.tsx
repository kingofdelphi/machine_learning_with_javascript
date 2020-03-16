import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import styled from 'styled-components';

import Input from "../../components/Input";

import stepSolve, { Row, normalizeData, hypothesis, denormalizeData } from '../../engine/regression';

import styles from './styles.module.scss';

const data : Array<Row> = [];
const output : Array<number> = [];

function updateFabricCanvas(canvas: fabric.Canvas, state: { [key:string]: any }) {
  const mouseDownHandler = (event: fabric.IEvent) => {
    const x = event.pointer!.x;
    const y = event.pointer!.y;
    data.push([1, x]);
    output.push(y);
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

let coefficients = [0, 0];
let regressionLine : fabric.Line;
let message : fabric.Text;
function solve(fabricCanvas: fabric.Canvas, iterationsLeft: number, learningRate: number) {
  const normInfo = normalizeData(data, output);
  const result = stepSolve(coefficients, normInfo.dataset, normInfo.output, learningRate);
  coefficients = result.coefficients;
  const data1 = [1, -10];
  const y1 = hypothesis(coefficients, data1);

  const data2 = [1, 10];
  const y2 = hypothesis(coefficients, data2);

  const regression_line = denormalizeData([data1, data2], [y1, y2], normInfo.featureMeta, normInfo.outputMeta);
  const pts = regression_line.dataset;
  const ycords = regression_line.output;

  if (!regressionLine) {
    regressionLine = new fabric.Line();
    fabricCanvas.add(regressionLine);
    message = new fabric.Text("");
    fabricCanvas.add(message);
  }
  message.set({
    text: `Iterations Left: ${iterationsLeft}`
  });
  regressionLine.set({
    stroke: 'red',
    strokeWidth: 1,
    objectCaching: false,
    x1: pts[0][1],
    y1: ycords[0],
    x2: pts[1][1],
    y2: ycords[1]
  })
  return result.cost;
}

let animFrameId: number;

function startSolve(fabricCanvas: fabric.Canvas, iterations: number, learningRate: number) {
  coefficients = [0, 0];
  const updater = () => {
    iterations--
    solve(fabricCanvas, iterations, learningRate);
    fabricCanvas.renderAll();
    if (iterations === 0) return;
    animFrameId = window.requestAnimationFrame(updater);
  };
  updater();
}

function stopSolve() {
  cancelAnimationFrame(animFrameId);
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
      fcanvas.dispose();
      stopSolve();
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
    if (data.length === 0) {
      alert("please add some points");
      return;
    }
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
        </div>
        <Input type="number" label="Iterations" value={"" + iterations} onChange={v => setIterations(+v)} />
        <Input type="number" label="Learning Rate" value={"" + learningRate} onChange={v => setLearningRate(+v)} />
        <Input type="number" label="Degree" value={"" + degree} onChange={v => setDegree(+v)} />
      </div>
    </Main>
  );
}

export default LinearRegression