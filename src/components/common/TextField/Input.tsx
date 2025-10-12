import React from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';

type InputProps<FV extends FieldValues> = {
  as: React.ComponentType<any>;
  control: Control<FV>;
  name: Path<FV>;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  [key: string]: any;
};

export default function Input<FV extends FieldValues>({
  as: Component,
  control,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  ...props
}: InputProps<FV>) {
  const {
    field: { value, onBlur, onChange, ref },
    fieldState: { error },
  } = useController({ name: props.name, control });

  return (
    <Component
      ref={ref}
      value={value}
      onChange={(text: any) => {
        onChangeProp?.(text);
        onChange(text);
      }}
      onBlur={() => {
        onBlurProp?.();
        onBlur();
      }}
      error={error?.message}
      {...props}
    />
  );
}
