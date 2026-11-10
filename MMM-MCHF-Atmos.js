/* global Module, MischiefAtmosModel, MischiefAtmosRenderer */
Module.register('MMM-MCHF-Atmos',{
 requiresVersion:'2.38.0',
 defaults:{source:'magicmirror',locationConfigured:false,latitude:0,longitude:0,weatherInstance:'',maxAgeSeconds:1800,pollSeconds:600,intensity:45,motion:'auto',showSnow:true,showFrost:true,showRain:true,showHeat:true,showThunder:true,lightning:false,frostBelowC:0,heatAboveC:35,edgeWidth:12,clearZones:[]},
 getScripts(){return [this.file('weather-model.js'),this.file('weather-renderer.js')];},getStyles(){return [this.file('mischief-surfaces.css'),this.file('MMM-MCHF-Atmos.css')];},
 start(){this.sample=null;this.paused=false;this.refresh=()=>{if(!this.paused&&this.renderer)this.renderer.update(this.sample,this.config);};if(this.config.source==='open-meteo')this.sendSocketNotification('ATMOS_START',this.config);},
 getDom(){if(!this.root){this.root=document.createElement('div');this.root.className='mischief-atmos';this.root.setAttribute('aria-hidden','true');}return this.root;},
 notificationReceived(name,payload,sender){if(name==='DOM_OBJECTS_CREATED'){if(!this.renderer)this.renderer=new MischiefAtmosRenderer(this.getDom());this.refresh();clearInterval(this.timer);this.timer=setInterval(this.refresh,30000);}if(name==='WEATHER_UPDATED'&&this.config.source==='magicmirror'&&sender?.name==='weather'&&sender.config?.type==='current'&&(!this.config.weatherInstance||sender.identifier===this.config.weatherInstance)){const data=MischiefAtmosModel.observation(payload,sender.config.units);if(data){this.sample=data;this.refresh();}}},
 socketNotificationReceived(name,payload){if(name==='ATMOS_DATA'&&this.config.source==='open-meteo'){this.sample=payload;this.refresh();}},
 suspend(){this.paused=true;clearInterval(this.timer);this.renderer?.pause(true);},resume(){this.paused=false;this.renderer?.pause(false);this.refresh();clearInterval(this.timer);this.timer=setInterval(this.refresh,30000);}
});
