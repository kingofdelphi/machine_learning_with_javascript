import React from "react";

import styles from './styles.module.scss';

type Props = {
  clickHandler: any,
  selectedChoice: string,
  choices: Array<{
    id: string
    label: string
    path: string
  }>
}

function MenuSelect(props: Props) {
  const { clickHandler, selectedChoice, choices } = props;
  return (
    <ul className={styles['menu-container']}>
      {
        choices.map(choice => (
          <li
            key={choice.id}
            className={choice.id === selectedChoice ? styles['selected'] : undefined}
            onClick={() => clickHandler(choice.id)}
          >
            <a href={`#${choice.path}`}>{choice.label}</a>
          </li>
        ))
      }
    </ul>
  );
};

export default MenuSelect;