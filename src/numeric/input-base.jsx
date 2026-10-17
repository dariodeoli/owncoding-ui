// Piloto compartido desde Scale #241; contratos RAW/nativos. OwnCoding #55.
import { forwardRef } from "react";
export const InputBase = forwardRef(function InputBase2({ invalid, describedBy, pending = false, disabled, "aria-describedby": description, "aria-invalid": ariaInvalid, "aria-busy": ariaBusy, ...props }, ref) {
  return <input
    {...props}
    ref={ref}
    disabled={disabled || pending}
    aria-busy={pending || ariaBusy}
    aria-invalid={invalid ?? ariaInvalid}
    aria-describedby={[description, describedBy].filter(Boolean).join(" ") || void 0}
  />;
});
export const TextareaBase = forwardRef(function TextareaBase2({ invalid, describedBy, pending = false, disabled, "aria-describedby": description, "aria-invalid": ariaInvalid, "aria-busy": ariaBusy, ...props }, ref) {
  return <textarea
    {...props}
    ref={ref}
    disabled={disabled || pending}
    aria-busy={pending || ariaBusy}
    aria-invalid={invalid ?? ariaInvalid}
    aria-describedby={[description, describedBy].filter(Boolean).join(" ") || void 0}
  />;
});
