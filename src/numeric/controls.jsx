// Piloto compartido desde Scale #241; contratos RAW/nativos. OwnCoding #55.
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { InputBase } from "./input-base.jsx";
import { numberInputProblem } from "./number-utils.js";
export const NumericControl = forwardRef(function NumericControl2({ policy, precision, notation = "plain", invalid, pending, disabled, inputMode, min, max, step, required, onChange, ...props }, forwardedRef) {
  const input = useRef(null), [raw, setRaw] = useState(String(props.value ?? props.defaultValue ?? ""));
  useImperativeHandle(forwardedRef, () => input.current);
  const rules = { notation, precision, min, max, step, required, stepBase: typeof props.defaultValue === "string" || typeof props.defaultValue === "number" ? props.defaultValue : void 0 };
  const value = props.value === void 0 ? raw : String(props.value ?? "");
  const problem = numberInputProblem(value, policy, rules);
  useLayoutEffect(() => {
    const control = input.current;
    if (!control) return;
    control.setCustomValidity?.(numberInputProblem(control.value, policy, rules));
    if (props.value === void 0 && raw !== control.value) setRaw(control.value);
  });
  return <InputBase
    {...props}
    ref={input}
    type="text"
    inputMode={inputMode ?? (policy === "integer" ? "numeric" : "decimal")}
    min={min}
    max={max}
    step={step}
    required={required}
    disabled={disabled}
    pending={pending}
    invalid={invalid || Boolean(problem) || void 0}
    onChange={(event) => {
      if (disabled || pending) return;
      const next = event.target.value;
      setRaw(next);
      event.target.setCustomValidity?.(numberInputProblem(next, policy, rules));
      onChange?.(event);
    }}
  />;
});
export const NumberInput = forwardRef(function NumberInput2({ onChange, ...props }, ref) {
  return <NumericControl {...props} ref={ref} onChange={(event) => onChange(event.target.value)} />;
});
export const PercentageInput = forwardRef(function PercentageInput2({ policy, ...props }, ref) {
  return <NumberInput {...props} ref={ref} policy={policy === "integer-percent" ? "integer" : "decimal"} />;
});
