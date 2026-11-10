/* Pure current-observation normalization. No forecast inference or weather fabrication. */
(function(root){
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 function observation(payload,units,receivedAt=Date.now()){
  const current=payload?.currentWeather;if(!current||!['metric','imperial'].includes(units))return null;
  const at=current.date,temperature=current.temperature;if(!finite(at)||!finite(temperature)||Math.abs(temperature)>200)return null;
  return {observedAt:at,receivedAt,temperatureC:units==='imperial'?(temperature-32)*5/9:temperature,type:typeof current.weatherType==='string'?current.weatherType.toLowerCase().slice(0,80):'',source:'MagicMirror weather'};
 }
 function fromOpenMeteo(data,now=Date.now()){
  const c=data?.current;if(!c||!finite(c.time)||!finite(c.temperature_2m)||!finite(c.weather_code)||data.current_units?.temperature_2m!=='°C')return null;
  const code=c.weather_code,type=[95,96,99].includes(code)?'thunderstorm':code>=71&&code<=77||[85,86].includes(code)?'snow':code>=51&&code<=67||[80,81,82].includes(code)?'rain':code===45||code===48?'fog':'clear';
  return {observedAt:c.time*1000,receivedAt:now,temperatureC:c.temperature_2m,type,source:'Open-Meteo'};
 }
 function condition(sample,config={},now=Date.now()){
  const maxAge=Math.max(300,Math.min(7200,Number(config.maxAgeSeconds)||1800))*1000;
  if(!sample||!finite(sample.observedAt)||!finite(sample.receivedAt)||!finite(sample.temperatureC)||sample.observedAt>now+30000||sample.receivedAt>now+30000||now-sample.observedAt>maxAge||now-sample.receivedAt>maxAge)return 'unavailable';
  const type=String(sample.type||'');
  if(/thunder|storm/.test(type))return 'thunder';
  if(/snow|sleet|flurr/.test(type))return 'snow';
  if(/rain|shower|drizzle/.test(type))return 'rain';
  if(sample.temperatureC<=Math.max(-10,Math.min(5,finite(config.frostBelowC)?config.frostBelowC:0)))return 'frost';
  if(sample.temperatureC>=Math.max(25,Math.min(50,Number(config.heatAboveC)||35)))return 'heat';
  return 'clear';
 }
 const api={observation,fromOpenMeteo,condition};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MischiefAtmosModel=api;
})(typeof window!=='undefined'?window:globalThis);
