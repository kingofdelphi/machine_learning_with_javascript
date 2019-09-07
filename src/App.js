import React from "react";
import ReactDOM from "react-dom";

import CSSModules from 'react-css-modules';

import MenuSelect from './components/MenuSelect';

import styles from './styles.scss';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedChoice: 'linear_regression',
    };
  }
  render() {
    const { selectedChoice } = this.state;
    return (
      <div styleName='grid-container'>
        <header>
          <h1>Machine Learning from Scratch</h1>
        </header>
        <nav>
          <MenuSelect
            selectedChoice={selectedChoice}
            clickHandler={
              (item) => {
                this.setState({
                  selectedChoice: item
                });
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
};

export default CSSModules(App, styles);

