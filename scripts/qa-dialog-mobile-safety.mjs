// Requiere Playwright instalado en el entorno de QA; no agrega dependencias al paquete.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
;(async () => {
 const browser = await chromium.launch({ headless: true })
 const results=[]
 for (const width of [375,1280]) for (const dark of [false,true]) {
  const page=await browser.newPage({viewport:{width,height:900},colorScheme:dark?'dark':'light'})
  await page.goto(`${process.env.QA_GALLERY_URL || 'http://127.0.0.1:5198'}/?export=DialogMobileSafety`)
  await page.getByRole('button',{name:'Probar diálogo móvil',exact:true}).click()
  await page.evaluate(dark=>document.documentElement.classList.toggle('dark',dark),dark)
  const dialog=page.getByRole('dialog',{name:'Formulario móvil',exact:true})
  await dialog.waitFor()
  const state=await dialog.evaluate(el=>{
   const inputs=[...el.querySelectorAll('input,select,textarea')].map(x=>({tag:x.tagName,size:getComputedStyle(x).fontSize}))
   const carousel=el.querySelector('[data-oc-scroll-x]')
   carousel.scrollLeft=100
   return {inputs,bodyOverflow:getComputedStyle(el.querySelector('.oc-dialog-safe-body')).overflowX,carousel:{scrollLeft:carousel.scrollLeft,overflow:getComputedStyle(carousel).overflowX,scrollWidth:carousel.scrollWidth,clientWidth:carousel.clientWidth},pageWidth:document.documentElement.scrollWidth,windowWidth:innerWidth,viewport:document.querySelector('meta[name=viewport]').content}
  })
  if(width===375&&state.inputs.some(x=>x.size!=='16px'))throw new Error('Mobile fonts '+JSON.stringify(state))
  if(state.carousel.scrollLeft<=0||state.carousel.overflow!=='auto')throw new Error('Carousel clipped '+JSON.stringify(state))
  if(state.pageWidth>width||state.bodyOverflow!=='hidden')throw new Error('Overflow '+JSON.stringify(state))
  const screenshot=path.join(os.tmpdir(),'ocui-mobile-safe-'+width+'-'+(dark?'dark':'light')+'.png')
  await page.screenshot({path:screenshot})
  await page.getByRole('button',{name:'Abrir diálogo anidado',exact:true}).click()
  const nested=page.getByRole('dialog',{name:'Diálogo anidado',exact:true})
  await nested.getByLabel('Detalle').focus()
  if(await nested.getAttribute('aria-modal')!=='true')throw new Error('Nested not topmost')
  await page.keyboard.press('Escape')
  if(await page.getByRole('dialog',{name:'Diálogo anidado',exact:true}).count())throw new Error('Nested remains')
  await page.keyboard.press('Escape')
  if(await page.getByRole('dialog').count())throw new Error('Outer remains')
  results.push({width,dark,screenshot,...state})
  await page.close()
 }
 await browser.close()
 fs.writeFileSync(path.join(os.tmpdir(),'ocui-mobile-safe-qa.json'),JSON.stringify(results,null,2))
 console.log(JSON.stringify(results,null,2))
})().catch(e=>{console.error(e);process.exit(1)})
