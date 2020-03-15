import React, { useState } from 'react';

import MenuSelect from './components/MenuSelect';
import LinearRegression from './pages/LinearRegression';

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
  const [selectedChoice, setSelectedChoice] = useState('linear_regression');
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
                id: "linear_regression",
                label: "Linear Regression",
                path: "/linear_regression"
              }
            ]
          }
        />
      </nav>
      <main>
        {selectedChoice === 'line' && <div>line equation</div>}
        {selectedChoice === 'linear_regression' && <LinearRegression />}
      </main>
    </GridContainer>
  );
}

export default App;
