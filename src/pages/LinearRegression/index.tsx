import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';

import stepSolve, { Row, normalizeData, hypothesis, denormalizeData } from '../../engine/regression';

import styles from './styles.module.scss';

interface Props {

}

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
  console.log(coefficients);
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

function LinearRegression(props: Props) {
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
  const [learningRate, setLearningRate] = useState(0.001);

  const changeClass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newClass = e.target.value;
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
    <div className={styles.main}>
      <div className={styles.menu}>
        <label className={styles.cls + " " + styles.green}>
          <input checked={cls === 'green'} value="green" type="radio" name="class" onChange={changeClass} />
          <span></span>
        </label>
        <label className={styles.cls + " " + styles.red}>
          <input checked={cls === 'red'} value="red" type="radio" name="class" onChange={changeClass} />
          <span></span>
        </label>
        <button onClick={animSolve}>Solve</button>
        <button onClick={stopSolve}>Stop</button>
        <label>
          Iterations
          <input type="number" value={iterations} onChange={e => setIterations(+e.target.value)} />
        </label>
        <label>
          Learning Rate
          <input type="number" min="0" value={learningRate} onChange={e => setLearningRate(+e.target.value)} />
        </label>
        <span>Please add few points by clicking below</span>
      </div>
      <div ref={ref} className={styles["fabric-wrapper"]}>
      </div>
    </div>
  )
}

export default LinearRegression