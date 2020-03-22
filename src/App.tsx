import React, { useState } from 'react';

import MenuSelect from './components/MenuSelect';
import Regression from './pages/Regression';
import Perceptron from './pages/Perceptron';
import Line from './pages/Line';

import styled from 'styled-components';

const GridContainer = styled.div`
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-areas:
  'header header'
  'nav main';
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-gap: 0px;

  header {
    grid-area: header;
    background: lightblue;
    box-shadow: 0px 1px 2px black;
  }

  nav {
    grid-area: nav;
    box-shadow: 0px 1px 2px black;
  }

  main {
    grid-area: main;
  }

  header, nav {
    padding: 10px;
  }
`;

function App() {
  const [selectedChoice, setSelectedChoice] = useState('line');
  return (
    <GridContainer>
      <header>
        <h1>Machine Learning from Scratch</h1>
      </header>
      <nav>
        <MenuSelect
          selectedChoice={selectedChoice}
          clickHandler={
            (item: string) => {
              setSelectedChoice(item);
            }
          }
          choices={
            [
              {
                id: "line",
                label: "Equation of Line",
                path: "/line_equation"
              },
              {
                id: "regression",
                label: "Regression",
                path: "/regression"
              },
              {
                id: "perceptron",
                label: "Perceptron",
                path: "/perceptron"
              }
            ]
          }
        />
      </nav>
      <main>
        {selectedChoice === 'line' && <Line />}
        {selectedChoice === 'regression' && <Regression />}
        {selectedChoice === 'perceptron' && <Perceptron />}
      </main>
    </GridContainer>
  );
}

export default App;
