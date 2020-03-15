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

let lastError = 1e9;
let coefficients = [0, 0];
let regressionLine : fabric.Line;
function solve(fabricCanvas: fabric.Canvas) {
  const normInfo = normalizeData(data, output);
  const result = stepSolve(coefficients, normInfo.dataset, normInfo.output);
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
  }
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

function startSolve(fabricCanvas: fabric.Canvas) {
  lastError = 1e9;
  const updater = () => {
    const error = solve(fabricCanvas);
    fabricCanvas.renderAll();
    if (error === lastError) return;
    fabric.util.requestAnimFrame(updater);
  };
  updater();
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
    }
  }, []);

  const [cls, setClass] = useState('green');

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
    startSolve(fabricCanvas!);
  }

  return (
    <div className={styles.main}>
      <div className={styles.menu}>
        <label className={styles.green}>
          <input checked={cls === 'green'} value="green" type="radio" name="class" onChange={changeClass} />
          <span></span>
        </label>
        <label className={styles.red}>
          <input checked={cls === 'red'} value="red" type="radio" name="class" onChange={changeClass} />
          <span></span>
        </label>
        <button onClick={animSolve}>Solve</button>
        <span>Please add few points by clicking below</span>
      </div>
      <div ref={ref} className={styles["fabric-wrapper"]}>
      </div>
    </div>
  )
}

export default LinearRegression