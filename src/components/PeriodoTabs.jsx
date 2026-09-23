import SegmentedField from './SegmentedField.jsx'

// Selector de período compartido por las pantallas con pestañas Día/Semana/Mes/
// Año: una sola definición para no duplicar pestañas. `periodos` permite pasar
// otro juego de opciones (misma convención que `SegmentedField`).
const PERIODOS = [
  ['dia', 'Día'],
  ['semana', 'Semana'],
  ['mes', 'Mes'],
  ['anio', 'Año'],
]

export default function PeriodoTabs({ periodo, setPeriodo, periodos = PERIODOS, ariaLabel = 'Período', className }) {
  return <SegmentedField value={periodo} onChange={setPeriodo} options={periodos} ariaLabel={ariaLabel} className={className} />
}
