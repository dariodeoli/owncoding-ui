// @vitest-environment jsdom
import React from 'react'
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {afterEach,expect,test,vi} from 'vitest'
import {BancoLogoLazy,BancoComboboxLazy,cargarAssetFinanciero} from '../dist/financial-lazy.js'

const observers=[]
class Observer {
 constructor(callback){this.callback=callback;observers.push(this)}
 observe(node){this.node=node}
 disconnect(){this.disconnected=true}
 show(){this.callback([{isIntersecting:true}])}
}
afterEach(()=>{cleanup();vi.unstubAllGlobals();observers.length=0})

test('visible Continental loads the original crop, error is finite, and a new bank never shows the old resource',async()=>{
 vi.stubGlobal('IntersectionObserver',Observer)
 const {container,rerender}=render(<BancoLogoLazy banco="Banco Continental" variante="compacto" />)
 expect(container.querySelector('img')).toBeNull()
 await act(async()=>observers[0].show())
 await waitFor(()=>expect(container.querySelector('img')).not.toBeNull())
 const original=await cargarAssetFinanciero('bancos/continental-compacto.png')
 expect(container.querySelector('img').getAttribute('src')).toBe(original)
 expect(container.querySelector('[data-logo-optico]')).not.toBeNull()
 fireEvent.error(container.querySelector('img'))
 expect(container.querySelector('img')).toBeNull()
 expect(container.querySelector('[data-logo-estado="asset-fallido"]')).not.toBeNull()
 rerender(<BancoLogoLazy banco="Banco Atlas" variante="compacto" />)
 expect(container.querySelector('img')).toBeNull()
 await act(async()=>observers.at(-1).show())
 await waitFor(()=>expect(container.querySelector('img')).not.toBeNull())
 expect(container.querySelector('img').getAttribute('src')).toBe(await cargarAssetFinanciero('bancos/atlas-compacto.png'))
})

test('lazy selector keeps canonical keyboard/identity/manual value and leaves unseen options unloaded',async()=>{
 vi.stubGlobal('IntersectionObserver',Observer)
 const onChange=vi.fn(),onIdentitySelect=vi.fn()
 const {container}=render(<BancoComboboxLazy value="Banco Continental" onChange={onChange} onIdentitySelect={onIdentitySelect} />)
 const input=screen.getByRole('combobox')
 fireEvent.focus(input)
 expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
 expect(container.querySelectorAll('img').length).toBe(0)
 fireEvent.keyDown(input,{key:'ArrowDown'})
 fireEvent.keyDown(input,{key:'Enter'})
 expect(onChange).toHaveBeenCalledTimes(1)
 expect(onIdentitySelect).toHaveBeenCalledTimes(1)
 expect(onIdentitySelect.mock.calls[0][0].record.id).toBe('oc:institution:py:003')
 fireEvent.change(input,{target:{value:'Mi banco manual'}})
 expect(onChange).toHaveBeenLastCalledWith('Mi banco manual')
})
