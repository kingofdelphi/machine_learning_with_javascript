import React from "react";

import styled from 'styled-components';

type Props = {
  clickHandler: any,
  selectedChoice: string,
  choices: Array<{
    id: string
    label: string
    path: string
  }>
}

const Ul = styled.ul`
  list-style-type: none;
  font-size: 1.3rem;
`;

interface LiProps {
  readonly selected: boolean;
};

const Li = styled.li<LiProps>`
    padding: 5px 40px;
    background: ${props => props.selected ? 'silver' : 'auto'};
    a {
      text-decoration: none;
      color: inherit;
    }
`;

function MenuSelect(props: Props) {
  const { clickHandler, selectedChoice, choices } = props;
  return (
    <Ul>
      {
        choices.map(choice => (
          <Li
            key={choice.id}
            selected={choice.id === selectedChoice}
            onClick={() => clickHandler(choice.id)}
          >
            <a href={`#${choice.path}`}>{choice.label}</a>
          </Li>
        ))
      }
    </Ul>
  );
};

export default MenuSelect;