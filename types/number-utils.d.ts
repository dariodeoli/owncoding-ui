/** Reglas sintácticas genéricas; los rangos/unidades los define cada consumidor. */
export type NumberPolicy = 'integer' | 'decimal'
export type PercentagePolicy = 'integer-percent' | 'decimal-percent' | 'ratio'
export type NumberNotation = 'plain' | 'native'
export type NumberRules = {
  notation?: NumberNotation
  min?: string | number
  max?: string | number
  precision?: number
  required?: boolean
  step?: string | number
  stepBase?: string | number
}
export function numberInputProblem(value: string, policy: NumberPolicy, rules?: NumberRules): string
export function numberInputValid(value: string, policy: NumberPolicy, rules?: NumberRules): boolean
export function nativeNumberSettings(options: {
  step?: string | number
  min?: string | number
  defaultValue?: unknown
}): {policy: NumberPolicy; step: string | number}
