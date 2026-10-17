import BancoComboboxBase from './BancoComboboxBase.jsx'
import BancoLogo from './BancoLogo.jsx'
export {normalizarBanco} from '../utils/bancos.js'

export default function BancoCombobox(props) {
  return <BancoComboboxBase {...props} Logo={BancoLogo} />
}
