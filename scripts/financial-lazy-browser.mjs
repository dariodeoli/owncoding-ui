// Harness local opt-in: PUPPETEER_REQUIRE_FROM points to an installed QA toolchain.
import {createRequire} from 'node:module'
import {createServer} from 'node:http'
import {mkdtempSync,writeFileSync,readFileSync,readdirSync,copyFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve,extname} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {build} from 'esbuild'
const require=createRequire(process.env.PUPPETEER_REQUIRE_FROM || resolve('package.json'))
const puppeteer=require('puppeteer-core')
const out=mkdtempSync(join(tmpdir(),'owncoding-financial-lazy-'))
const report={checks:[],requests:[],resources:[]}
const check=(name,condition)=>{assert.ok(condition,name);report.checks.push(name)}
await build({stdin:{resolveDir:process.cwd(),contents:`import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{BancoLogoLazy,BancoComboboxLazy}from'./dist/financial-lazy.js';function App(){const[bank,setBank]=useState('');const[selector,setSelector]=useState(false);return <><p id="table">Tabla disponible</p><button id="continental" onClick={()=>setBank('Banco Continental')}>Continental</button><button id="atlas" onClick={()=>setBank('Banco Atlas')}>Atlas</button><button id="selector" onClick={()=>setSelector(true)}>Cuenta</button><section id="logo"><BancoLogoLazy banco={bank} variante="compacto" /></section>{selector&&<BancoComboboxLazy value={bank} onChange={setBank}/>}</>}createRoot(document.getElementById('root')).render(<App/>);`,loader:'jsx'},outdir:out,bundle:true,splitting:true,format:'esm',write:true,logLevel:'silent'})
writeFileSync(join(out,'package.json'),' {"type":"module"}')
const css=readdirSync('site-dist/assets').find(file=>/^index-.*\.css$/.test(file))
assert.ok(css,'run gallery:build before browser harness')
copyFileSync(join('site-dist/assets',css),join(out,'style.css'))
writeFileSync(join(out,'index.html'),'<link rel="icon" href="data:,"><link rel="stylesheet" href="/style.css"><div id="root"></div><script type="module" src="/stdin.js"></script>')
const server=createServer((req,res)=>{const path=resolve(out,'.'+new URL(req.url,'http://localhost').pathname);if(!path.startsWith(out+'/')){res.writeHead(403).end();return}try{res.setHeader('Content-Type',extname(path)==='.js'?'text/javascript':extname(path)==='.css'?'text/css':'text/html');res.end(readFileSync(path))}catch{res.writeHead(404).end()}})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],env:{...process.env,XDG_CONFIG_HOME:join(out,'config'),XDG_CACHE_HOME:join(out,'cache')}})
try{
 const page=await browser.newPage();await page.setViewport({width:1366,height:768})
 page.on('pageerror',error=>console.error('Page error:',error.message))
 page.on('console',message=>{if(message.type()==='error')console.error('Browser:',message.text())})
 page.on('request',req=>{const url=new URL(req.url());if(url.protocol==='http:'||url.protocol==='https:')report.requests.push(url.pathname)})
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html`)
 await page.waitForSelector('#table')
 const requestedAssets=()=>report.requests.filter(file=>file.endsWith('.js')).filter(file=>readFileSync(join(out,file),'utf8').includes('data:image/'))
 check('initial table paints with no bank image resource',requestedAssets().length===0)
 await page.click('#continental');await page.waitForFunction(()=>{const img=document.querySelector('#logo img');return img?.complete&&img.naturalWidth>0})
 check('Continental real PNG decoded',await page.$eval('#logo img',img=>img.naturalWidth>0&&img.src.startsWith('data:image/png;')))
 const beforeAtlas=[...requestedAssets()]
 const legacy=await import(pathToFileURL(resolve('dist/financial.js')).href)
 const expected=new Map(legacy.ASSET_KEYS_FINANCIEROS.map(key=>[createHash('sha256').update(legacy.obtenerAssetFinanciero(key)).digest('hex'),key]))
 async function resources(files){const keys=[];for(const file of files){const values=await import(pathToFileURL(join(out,file)).href);const visit=value=>{if(typeof value==='string'&&value.startsWith('data:image/'))keys.push(expected.get(createHash('sha256').update(value).digest('hex')));else if(value&&typeof value==='object')Object.values(value).forEach(visit)};Object.values(values).forEach(visit)}return [...new Set(keys)].sort()}
 const continental=await resources(beforeAtlas)
 console.error('Loaded first bank keys:',continental.join(','))
 check('one bank loads only Continental variants',continental.length===2&&continental.every(key=>key?.startsWith('bancos/continental-')))
 await page.click('#atlas');await page.waitForFunction(()=>{const img=document.querySelector('#logo img');return img?.complete&&img.naturalWidth>0&&document.querySelector('#logo [role=img]')?.getAttribute('aria-label')?.includes('Atlas')})
 const twoBanks=await resources(requestedAssets())
 check('two banks load only their own four variants',twoBanks.length===4&&twoBanks.every(key=>/bancos\/(continental|atlas)-/.test(key)))
 report.resources={continental,twoBanks,oneBankBytes:beforeAtlas.reduce((sum,file)=>sum+readFileSync(join(out,file)).byteLength,0),twoBankBytes:requestedAssets().reduce((sum,file)=>sum+readFileSync(join(out,file)).byteLength,0)}
 await page.click('#selector');await page.focus('[role=combobox]');await page.keyboard.down('Control');await page.keyboard.press('a');await page.keyboard.up('Control');await page.keyboard.press('Backspace');await page.waitForSelector('[role=option]');await new Promise(resolve=>setTimeout(resolve,250))
 const visible=await resources(requestedAssets())
 check('opening scrollable selector does not load all 89 assets',visible.length<89)
 await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter')
 check('selector keyboard closes options',await page.$('[role=listbox]')===null)
 report.resources.afterSelector=visible.length
 console.log(JSON.stringify(report,null,2))
 writeFileSync(join(out,'report.json'),JSON.stringify(report,null,2))
 console.error('Report:',join(out,'report.json'))
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
