import type {ComponentProps, ReactElement} from 'react'
import type {BancoLogo, BancoCombobox} from 'owncoding-ui'
export type RecursoFinancieroInicial = {clave: string; asset: string}
export type BancoLogoLazyProps = ComponentProps<typeof BancoLogo> & {recursoInicial?: RecursoFinancieroInicial}
export function BancoLogoLazy(props: BancoLogoLazyProps): ReactElement | null
export function BancoComboboxLazy(props: ComponentProps<typeof BancoCombobox>): ReactElement
/** Rechaza fallos de importación; una clave desconocida devuelve null. */
export function cargarAssetFinanciero(clave: string): Promise<string | null>
