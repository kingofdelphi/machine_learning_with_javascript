import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import * as MathJs from 'mathjs';
import styled from 'styled-components';

import Input from "../../components/Input";

import styles from './styles.module.scss';

const SInput = styled(Input)`
  > span {
    width: 80px;
  }
  > input {
    flex: 1;
  }
`;

const Main = styled.div`
  display: flex;
  height: 100%;
`;

const ActionButtons = styled.div`
  > span {
    display: block;
    margin-top: 5px;
    margin-left: 90px;
  }
  > * + * {
    margin-top: 20px;
  }
`;

let line: fabric.Line;
let perpendicular: fabric.Line;

const drawAxes = (fabricCanvas: fabric.Canvas) => {
  const width = fabricCanvas.getWidth();
  const height = fabricCanvas.getHeight();
  
  const xAxis = new fabric.Line();
  xAxis.set({
    stroke: 'green',
    strokeWidth: 2,
    objectCaching: false,
    x1: 0,
    y1: height / 2,
    x2: width,
    y2: height / 2
  })
  fabricCanvas.add(xAxis);

  const yAxis = new fabric.Line();
  yAxis.set({
    stroke: 'green',
    strokeWidth: 2,
    objectCaching: false,
    x1: width / 2,
    y1: 0,
    x2: width / 2,
    y2: height
  })
  fabricCanvas.add(yAxis);
};

const updateLine = (fabricCanvas: fabric.Canvas, angle: number, distance: number) => {
  const width = fabricCanvas.getWidth();
  const height = fabricCanvas.getHeight();
  const radians = Math.PI * angle / 180;
  const length = Math.hypot(width, height);
  const w = [Math.cos(-radians), Math.sin(-radians)];
  const screenCenter = [width / 2, height / 2];
  const lineMid = MathJs.add(screenCenter, MathJs.multiply(w, distance)) as Array<number>;
  const rotated = MathJs.multiply([-w[1], w[0]], length / 2);
  const leftPoint = MathJs.add(lineMid, rotated) as Array<number>
  const rightPoint = MathJs.subtract(lineMid, rotated) as Array<number>
  line.set({
    stroke: 'blue',
    strokeWidth: 3,
    objectCaching: false,
    x1: leftPoint[0],
    y1: leftPoint[1],
    x2: rightPoint[0],
    y2: rightPoint[1]
  })
  perpendicular.set({
    stroke: 'black',
    strokeWidth: 1,
    objectCaching: false,
    x1: screenCenter[0],
    y1: screenCenter[1],
    x2: lineMid[0],
    y2: lineMid[1]
  })
  fabricCanvas.renderAll();
}

function Line() {
  const ref = useRef(null);

  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [angle, setAngle] = useState(45);
  const [distance, setDistance] = useState(300);

  const [sliderRange] = useState(Math.floor(Math.hypot(window.innerHeight, window.innerWidth) / 2));

  const changeAngle = (d: number) => {
    setAngle(d);
    updateLine(fabricCanvas!, d, distance);
  }

  const changeDistance = (d: number) => {
    setDistance(d);
    updateLine(fabricCanvas!, angle, d);
  }

  useEffect(() => {
    const node : HTMLElement = ref.current!;
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    node.append(canvas);
    const bounds = node.getBoundingClientRect();
    const fcanvas = new fabric.Canvas('canvas');
    fcanvas.setWidth(bounds.width);
    fcanvas.setHeight(bounds.height);
    setFabricCanvas(fcanvas);
    drawAxes(fcanvas);
    line = new fabric.Line();
    fcanvas.add(line);
    perpendicular = new fabric.Line();
    fcanvas.add(perpendicular);
    updateLine(fcanvas, angle, distance);
    return () => {
      fcanvas.dispose();
    }
  }, []);

  return (
    <Main>
      <div ref={ref} className={styles["fabric-wrapper"]}>
      </div>
      <div className={styles.menu}>
        <div className={styles['cls-buttons']}>
          <span>A line can be described using an angle <br /> for orientation and distance from origin</span>
        </div>
        <ActionButtons>
          <SInput label="Angle" type="range" value={"" + angle} min="0" max="360" onChange={e => changeAngle(+e)} />
          <span>{angle} degrees</span>
          <SInput label="Distance" type="range" value={"" + distance} min={"" + -sliderRange} max={"" + sliderRange} onChange={e => changeDistance(+e)} />
          <span>{distance} px</span>
        </ActionButtons>
      </div>
    </Main>
  );
}

export default Line
