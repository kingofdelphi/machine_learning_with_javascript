import React, { useState } from 'react';

import MenuSelect from './components/MenuSelect';

import styles from "./App.module.scss";

function App() {
  const [selectedChoice, setSelectedChoice] = useState('linear_regression');
  return (
    <div className={styles['grid-container']}>
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
        {selectedChoice}
      </main>
    </div>
  );
}

export default App;
