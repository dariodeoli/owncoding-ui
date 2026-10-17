import {useEffect,useRef,useState} from 'react'
import {logoDeBanco} from '../utils/bancos.js'
import BancoComboboxBase from '../components/BancoComboboxBase.jsx'
import LogoFinanciero from '../components/LogoFinanciero.jsx'
import {cargarAssetFinanciero} from './lazy-resources.js'
export {cargarAssetFinanciero} from './lazy-resources.js'

// El fallback SSR y el primer render coinciden. Sólo recursos visibles se piden;
// un fallo termina en texto/monograma y nunca bloquea el contenido de la app.
export function BancoLogoLazy({banco,variante='horizontal',recursoInicial,...props}) {
  const registro = logoDeBanco(String(banco || '').trim(),variante)
  const clave = registro?.visual?.empaquetado
  const inicial = recursoInicial && recursoInicial.clave === clave ? recursoInicial.asset : null
  const [carga,setCarga] = useState(null)
  const slot = useRef(null)
  const mismaCarga = Boolean(carga && carga.clave === clave)
  const asset = inicial || (mismaCarga ? carga.asset : null)
  useEffect(()=>{
    if (!clave || inicial) return
    let vigente = true, started = false
    const cargar = ()=>{
      if (started || !vigente) return
      started = true
      setCarga({clave,estado:'cargando',asset:null})
      cargarAssetFinanciero(clave).then(asset=>{
        if(vigente)setCarga({clave,estado:asset?'listo':'no-disponible',asset})
      }).catch(error=>{
        console.warn('No se pudo cargar el logo financiero',clave,error)
        if(vigente)setCarga({clave,estado:'error',asset:null})
      })
    }
    let observer
    if(typeof IntersectionObserver === 'function' && slot.current){
      observer = new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();cargar()}})
      observer.observe(slot.current)
    } else cargar()
    return ()=>{vigente=false;observer?.disconnect()}
  },[clave,inicial])
  if(!registro || (props.soloCatalogo && registro.generico))return null
  const visual = registro.visual || {}
  const resuelto = {...registro,visual:asset?{...visual,asset}:{...visual,archivo:undefined,asset:undefined,tipo:variante==='compacto'?'monograma':'texto'}}
  return <span ref={slot} className="inline-flex min-w-0 max-w-full" data-logo-carga={asset?'listo':mismaCarga?carga.estado:'pendiente'}><LogoFinanciero nombre={banco} registro={resuelto} {...props} /></span>
}

export function BancoComboboxLazy(props) {
  return <BancoComboboxBase {...props} Logo={BancoLogoLazy} />
}
