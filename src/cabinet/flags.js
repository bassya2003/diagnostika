const SD_RE=/не потяну|не смогу|не для меня|боюсь/i;
function isDemoEntry(d){return false;}
function flags(d){
  const out=[];
  if(d.profile && d.profile.voluntary===false) out.push({c:"f-warn",t:"недобровольно"});
  const anti=(d.res&&d.res.anti)||{picks:[],reasons:{}};
  const sd=anti.picks.filter(id=>SD_RE.test(anti.reasons[id]||""));
  if(sd.length) out.push({c:"f-red",t:"SELFDOUBT ×"+sd.length});
  const m=d.res&&d.res.multi;
  if(m&&m.pride&&m.pride.who){
    const pw=m.pride.who.toLowerCase();
    const free=(m.lives||[]).slice(0,3).filter(l=>l.who);
    const ov=free.some(l=>{const w=l.who.toLowerCase();const a=w.split(/[\s-]+/)[0],b=pw.split(/[\s-]+/)[0];return a&&b&&(w.includes(b)||pw.includes(a));});
    if(free.length&&!ov) out.push({c:"f-red",t:"семейный сценарий"});
  }
  if(d.res&&d.res.money&&d.res.money.start>500000) out.push({c:"f-warn",t:"ожидания ₸"});
  // «Узкий сигнал»: интересами считаются только позиции ЛУПы с оценкой >=7.
  // Если их меньше трех — картину нельзя достраивать нейтральной зоной (4-6).
  const L=(d.res&&d.res.lupa)||{};
  const lupaVals=[].concat(Object.values(L.subjects||{}),Object.values(L.activities||{}))
    .map(Number).filter(n=>!isNaN(n));
  if(lupaVals.length){
    const core=lupaVals.filter(n=>n>=7).length;
    if(core<3) out.push({c:"f-red",t:"узкий сигнал: ядро ЛУПы "+core});
  }
  // День 8 засчитываем и по факту прохождения синтеза: в ранних версиях приложения
  // результаты отправлялись до отметки дня 8, из-за чего появлялся ложный флаг 7/8.
  const dd=new Set(d.doneDays||[]);
  const synthDone = d.res && d.res.synth && Object.keys(d.res.synth).some(k=>(d.res.synth[k]||"").trim());
  if(synthDone) dd.add(8);
  if(dd.size<8) out.push({c:"f-warn",t:"не завершил: "+dd.size+"/8"});
  if(isDemoEntry(d)) out.push({c:"f-warn",t:"тестовая запись"});
  if(!out.length) out.push({c:"f-ok",t:"без флагов"});
  return out;
}
module.exports=flags;