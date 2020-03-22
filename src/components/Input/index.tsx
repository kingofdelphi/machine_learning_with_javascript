import React from "react";

import styled, { StyledComponent } from 'styled-components';

const Label:StyledComponent<any, any> = styled.label`
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
  className?: string;
  type: string;
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}

function Input(props: Props) {
  const { className, type, label, value, min, max, onChange } = props;
  return (
    <Label className={className}>
      <span>{label}</span>
      <input type={type} value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} />
    </Label>
  );
};

Input.defaultProps = {
  type: undefined,
};

export default Input;
