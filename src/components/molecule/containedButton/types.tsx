import { MouseEventHandler } from "react";

export interface ContainedButtonProps {
  handleClick?: MouseEventHandler<HTMLButtonElement>;
  text: string;
  disabled: boolean;
  loading: boolean;
}
