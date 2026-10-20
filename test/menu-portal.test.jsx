// @vitest-environment jsdom
import {act, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import MenuDesplegable from '../src/components/MenuDesplegable.jsx'
import {Modal} from '../src/components/ui.jsx'
import {dialogFocusContains, dialogFocusableElements} from '../src/utils/dialogFocusScope.js'
import {menuPortalPosition} from '../src/utils/menuPortal.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
let host, root
const rect=(left=0,top=0,width=800,height=600)=>({left,top,width,height,right:left+width,bottom:top+height,x:left,y:top,toJSON(){return this}})
beforeEach(()=>{
 host=document.createElement('div');document.body.append(host);root=createRoot(host)
 vi.spyOn(HTMLElement.prototype,'getClientRects').mockReturnValue([rect()])
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(){return this.getAttribute('role')==='menu'?rect(0,0,192,160):this.getAttribute('aria-haspopup')==='menu'?rect(120,100,44,44):rect()})
})
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks()})
const render=async(node)=>act(async()=>root.render(node))
const click=async(node)=>act(async()=>node.dispatchEvent(new MouseEvent('click',{bubbles:true})))
const key=async(node,value,shiftKey=false)=>act(async()=>node.dispatchEvent(new KeyboardEvent('keydown',{key:value,shiftKey,bubbles:true,cancelable:true})))
const frame=async()=>act(async()=>{await new Promise(resolve=>requestAnimationFrame(resolve))})
const trigger=()=>host.querySelector('[aria-haspopup="menu"]')
const popup=()=>document.querySelector('[role="menu"]')

function Scenario({portal=true}){
 const [open,setOpen]=useState(true),[child,setChild]=useState(false)
 return <>{open&&<Modal open title="Padre" onClose={()=>setOpen(false)}>
  <button data-before>Anterior</button><MenuDesplegable portal={portal} trigger="Acciones" items={[{label:'Abrir hijo',onClick:()=>setChild(true)},{label:'Eliminar',peligro:true},{label:'No disponible',disabled:true}]}/><button data-after>Siguiente</button>
  {child&&<Modal open title="Hijo" onClose={()=>setChild(false)}><button data-child>Acción hija</button></Modal>}
 </Modal>}<button data-outside>Fondo</button></>
}

describe('portal opt-in del menú',()=>{
 test('default conserva montaje inline; portal crea nodos reales bajo body sin Popover API',async()=>{
  await render(<MenuDesplegable trigger="Inline" items={[{label:'Uno'}]}/>);await click(trigger());await frame();expect(host.contains(popup())).toBe(true)
  await render(<MenuDesplegable key="portal" portal trigger="Portal" items={[{label:'Uno'}]}/>);await click(trigger());await frame();expect(host.contains(popup())).toBe(false);expect(popup().parentElement).toBe(document.body);expect(popup().style.position).toBe('fixed');expect(trigger().getAttribute('aria-controls')).toBe(popup().id);expect(trigger().getAttribute('aria-label')).toBe('Menú')
 })
 test('clic dentro del portal ejecuta la acción; afuera lo cierra',async()=>{
  const action=vi.fn();await render(<MenuDesplegable portal trigger="Acciones" items={[{label:'Elegir',onClick:action}]}/>);await click(trigger());await frame();await click(popup().querySelector('button'));expect(action).toHaveBeenCalledTimes(1);expect(popup()).toBeNull();expect(document.activeElement).toBe(trigger());await click(trigger());await frame();await click(document.body);expect(popup()).toBeNull()
 })
 test.each([false,true])('Escape del menú no cierra su Modal (portal=%s)',async(portal)=>{
  await render(<Scenario portal={portal}/>);await click(trigger());await frame();const item=popup().querySelector('button');expect(document.activeElement).toBe(item);await key(item,'Escape');await frame();expect(popup()).toBeNull();expect(host.querySelector('[role="dialog"]')).not.toBeNull();expect(document.activeElement).toBe(trigger())
 })
 test.each([false,true])('Tab sale al control adyacente y mantiene la trampa (shift=%s)',async(shift)=>{
  await render(<Scenario/>);await click(trigger());await frame();await key(popup().querySelector('button'),'Tab',shift);expect(popup()).toBeNull();expect(document.activeElement).toBe(host.querySelector(shift?'[data-before]':'[data-after]'))
 })
 test('scopes sólo autorizan el portal anclado al diálogo actual y se limpian al cerrar',async()=>{
  await render(<Scenario/>);await click(trigger());await frame();const parent=host.querySelector('[role="dialog"]'),item=popup().querySelector('button');expect(dialogFocusContains(parent,item)).toBe(true);expect(dialogFocusableElements(parent)).toContain(item)
  const fake=document.createElement('button');fake.dataset.ocMenuPortal='';document.body.append(fake);expect(dialogFocusContains(parent,fake)).toBe(false);expect(dialogFocusableElements(parent)).not.toContain(fake);expect(dialogFocusContains(host.querySelector('[data-outside]'),item)).toBe(false)
  await key(item,'Escape');expect(dialogFocusContains(parent,item)).toBe(false);fake.remove()
 })
 test('el selector opt-in de un diálogo propio conserva summary, editable y tabindex positivo',async()=>{
  await render(<div data-dialog><summary>Resumen</summary><div contentEditable suppressContentEditableWarning>Editar</div><span tabIndex={2}>Positivo</span><MenuDesplegable portal trigger="Acciones" items={[{label:'Uno'}]}/></div>);await click(trigger());await frame();const panel=host.querySelector('[data-dialog]');const selector='summary, [contenteditable], [tabindex], button';const nodes=dialogFocusableElements(panel,selector);expect(nodes).toContain(panel.querySelector('summary'));expect(nodes).toContain(panel.querySelector('[contenteditable]'));expect(nodes).toContain(panel.querySelector('[tabindex="2"]'));expect(nodes).toContain(popup().querySelector('button'))
 })
 test('Tab del portal no salta summary ni contenido editable del diálogo propio',async()=>{
  await render(<section role="dialog"><MenuDesplegable portal trigger="Acciones" items={[{label:'Uno'}]}/><details><summary data-summary>Resumen</summary></details><div contentEditable suppressContentEditableWarning>Editable</div></section>);await click(trigger());await frame();await key(popup().querySelector('button'),'Tab');expect(document.activeElement).toBe(host.querySelector('[data-summary]'))
 })
 test('una acción abre otro Modal sin robarle foco y vuelve al trigger al cerrar el hijo',async()=>{
  await render(<Scenario/>);await click(trigger());await frame();await click(popup().querySelector('button'));await frame();const dialogs=[...host.querySelectorAll('[role="dialog"]')];expect(dialogs).toHaveLength(2);const child=dialogs.at(-1);expect(child.contains(document.activeElement)||child===document.activeElement).toBe(true);await key(child,'Escape');await frame();expect(host.querySelectorAll('[role="dialog"]')).toHaveLength(1);expect(document.activeElement).toBe(trigger())
 })
 test('scroll del ancla fuera del viewport cierra sin hacerla reaparecer',async()=>{
  await render(<MenuDesplegable portal trigger="Acciones" items={[{label:'Uno'}]}/>);await click(trigger());await frame();expect(popup()).not.toBeNull();vi.spyOn(trigger(),'getBoundingClientRect').mockReturnValue(rect(120,-90,44,44));await act(async()=>window.dispatchEvent(new Event('scroll')));await frame();expect(popup()).toBeNull();expect(trigger().getAttribute('aria-expanded')).toBe('false')
 })
})

describe('colisión de viewport',()=>{
 const viewport={left:0,top:0,right:375,bottom:568}
 test('última fila abre arriba y no desborda un móvil',()=>{
  const p=menuPortalPosition(rect(330,500,44,44),{width:240,height:220},viewport);expect(p.left).toBe(127);expect(p.top).toBe(276);expect(p.maxWidth).toBe(359);expect(p.maxHeight).toBe(488)
 })
 test('ancla fuera no ofrece un menú inaccesible; ancho mínimo se ajusta a viewport corto',()=>{
  expect(menuPortalPosition(rect(120,580,44,44),{width:192,height:220},viewport)).toBeNull();expect(menuPortalPosition(rect(10,20,40,40),{width:192,height:80},{left:0,top:0,right:160,bottom:300}).minWidth).toBe(144)
 })
})
