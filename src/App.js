import React from "react";
import ReactDOM from "react-dom";

import CSSModules from 'react-css-modules';

import styles from './styles.scss';

class App extends React.Component {
  render() {
    return (
      <div styleName='grid-container'>
        <header>
          <h1>Machine Learning from Scratch</h1>
        </header>
        <nav>
          <ul>
            <li>Linear Regression</li>
          </ul>
        </nav>
        <main>
            main body
        </main>
      </div>
    );
  }
};

export default CSSModules(App, styles);
