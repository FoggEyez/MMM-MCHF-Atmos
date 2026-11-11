const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('suspended effects remain paused across visibility changes and renderer rebuilds',()=>{
 class Element{
  constructor(){this.classes=new Set();this.style={setProperty(){}};this.dataset={};this.classList={toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c),add:c=>this.classes.add(c)};}
  set className(value){this.classes=new Set(value.split(' '));}get className(){return [...this.classes].join(' ');}append(){}replaceChildren(){}setAttribute(){}
 }
 const listeners={},media={matches:false,addEventListener(){},removeEventListener(){}},document={hidden:false,addEventListener:(name,fn)=>listeners[name]=fn,removeEventListener(){},createElement:()=>new Element(),createElementNS:()=>new Element()},window={matchMedia:()=>media,MischiefAtmosModel:{condition:()=> 'rain'}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../weather-renderer.js'),'utf8'),{window,document});
 const host=new Element(),renderer=new window.MischiefAtmosRenderer(host);renderer.update({},{});renderer.setSuspended(true);assert.ok(host.classes.has('atmos-paused'));
 document.hidden=true;listeners.visibilitychange();document.hidden=false;listeners.visibilitychange();assert.ok(host.classes.has('atmos-paused'));
 renderer.update({},{intensity:80});assert.ok(host.classes.has('atmos-paused'));renderer.setSuspended(false);assert.equal(host.classes.has('atmos-paused'),false);
 document.hidden=true;renderer.setSuspended(false);assert.ok(host.classes.has('atmos-paused'));document.hidden=false;listeners.visibilitychange();assert.equal(host.classes.has('atmos-paused'),false);
});
