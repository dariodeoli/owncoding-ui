import type {ComponentPropsWithoutRef, ForwardRefExoticComponent, RefAttributes} from 'react'
import type {NumberPolicy, NumberNotation, PercentagePolicy} from './number-utils.js'
export * from './number-utils.js'

export type FieldStateProps = {invalid?: boolean; describedBy?: string; pending?: boolean}
export type InputBaseProps = ComponentPropsWithoutRef<'input'> & FieldStateProps
export type TextareaBaseProps = ComponentPropsWithoutRef<'textarea'> & FieldStateProps
export const InputBase: ForwardRefExoticComponent<InputBaseProps & RefAttributes<HTMLInputElement>>
export const TextareaBase: ForwardRefExoticComponent<TextareaBaseProps & RefAttributes<HTMLTextAreaElement>>
export type NumericControlProps = Omit<InputBaseProps, 'type'> & {
  policy: NumberPolicy
  precision?: number
  notation?: NumberNotation
}
export type NumberInputProps = Omit<NumericControlProps, 'value' | 'onChange'> & {
  value: string
  onChange: (value: string) => void
}
export type PercentageInputProps = Omit<NumberInputProps, 'policy'> & {policy: PercentagePolicy}
export const NumericControl: ForwardRefExoticComponent<NumericControlProps & RefAttributes<HTMLInputElement>>
export const NumberInput: ForwardRefExoticComponent<NumberInputProps & RefAttributes<HTMLInputElement>>
export const PercentageInput: ForwardRefExoticComponent<PercentageInputProps & RefAttributes<HTMLInputElement>>
