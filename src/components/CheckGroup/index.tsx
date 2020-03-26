import React from "react";

import styled, { StyledComponent } from 'styled-components';

const Main:StyledComponent<any, any> = styled.label`
  display: flex;
  flex-direction: column;
  span {
    font-weight: 600;
  }
  > * + * {
    margin-top: 10px;
  }
  label {
    margin-left: 20px;
    font-size: 1.1rem;
    span {
      margin-left: 10px;
    }
  }
`;

type Props = {
  className?: string;
  type: string;
  label: string;
  options: Array<any>;
  nameSelector: (option: any) => string;
  valueSelector: (option: any) => boolean;
  titleSelector: (option: any) => string;
  onChange?: (name: string, value: boolean) => void;
}

function CheckGroup(props: Props) {
  const { className, label, nameSelector, titleSelector, valueSelector, options, onChange } = props;
  return (
    <Main className={className}>
      <span>{label}</span>
      {
        options.map(d => (
          <label key={nameSelector(d)}>
            <input onChange={e => onChange!(nameSelector(d), !valueSelector(d))} type="checkbox" checked={valueSelector(d)} />
            <span>{titleSelector(d)}</span>
          </label>
        ))
      }
    </Main>
  );
};

CheckGroup.defaultProps = {
  type: undefined,
  onChange: () => undefined,
};

export default CheckGroup;
