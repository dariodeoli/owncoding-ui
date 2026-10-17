import {loaders} from 'owncoding:financial-assets'
import {crearCargadorFinanciero} from './lazy-loader.js'
export const cargarAssetFinanciero = crearCargadorFinanciero(loaders)
