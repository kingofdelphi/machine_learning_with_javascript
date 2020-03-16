import React from "react";

import styled, { StyledComponent } from 'styled-components';

const Label:StyledComponent<any, any> = styled.label`
  padding: 5px;
  display: flex;
  align-items: center;
  span {
    font-weight: 600;
  }
  input {
    font-size: 1.1rem;
    margin-left: 10px;
  }
`;

type Props = {
  type: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function Input(props: Props) {
  const { type, label, value, onChange } = props;
  return (
    <Label>
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </Label>
  );
};

Input.defaultProps = {
  type: undefined,
};

export default Input;
