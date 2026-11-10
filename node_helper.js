const NodeHelper=require('node_helper'),M=require('./weather-model.js');
module.exports=NodeHelper.create({
 start(){this.running=false;this.stopped=false;},
 socketNotificationReceived(name,c){if(name!=='ATMOS_START'||this.running||c?.source!=='open-meteo'||c.locationConfigured!==true||typeof c.latitude!=='number'||typeof c.longitude!=='number'||!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude)||Math.abs(c.latitude)>90||Math.abs(c.longitude)>180)return;this.running=true;this.config=c;this.refresh();},
 async refresh(){let sample=null;try{const q=new URLSearchParams({latitude:this.config.latitude,longitude:this.config.longitude,current:'temperature_2m,weather_code',temperature_unit:'celsius',timeformat:'unixtime',timezone:'GMT'}),response=await fetch('https://api.open-meteo.com/v1/forecast?'+q,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Provider unavailable');const text=await response.text();if(text.length>262144)throw Error('Oversized provider response');sample=M.fromOpenMeteo(JSON.parse(text));}catch{}if(!this.stopped){this.sendSocketNotification('ATMOS_DATA',sample);this.timer=setTimeout(()=>this.refresh(),Math.max(300,Math.min(3600,Number(this.config.pollSeconds)||600))*1000);}},
 stop(){this.stopped=true;clearTimeout(this.timer);}
});
