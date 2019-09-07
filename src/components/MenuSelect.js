import React from "react";
import ReactDOM from "react-dom";

import CSSModules from 'react-css-modules';

import styles from './styles.scss';

class MenuSelect extends React.Component {
  render() {
    const { clickHandler, selectedChoice, choices } = this.props;
    return (
      <ul styleName='menu-container'>
          {
            choices.map(choice => (
              <li 
                key={choice.id}
                styleName={choice.id === selectedChoice ? 'selected' : null} 
                onClick={() => clickHandler(choice.id)}
              >
                <a href={`#${choice.path}`}>{choice.label}</a>
              </li>
            ))
          }
      </ul>
    );
  }
};

export default CSSModules(MenuSelect, styles);
