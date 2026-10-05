
"use strict";
let students=[], sel=-1;
const SCH_N={comp:"Проф. компетентность",mgmt:"Менеджмент",auto:"Автономия",stabw:"Стабильность работы",stabp:"Стабильность жительства",serve:"Служение",chall:"Вызов",integ:"Интеграция стилей жизни",entr:"Предпринимательство"};
const VAL_N={dev:"Развитие себя",spirit:"Духовное удовлетворение",creat:"Креативность",soc:"Соц. контакты",prest:"Престиж",money:"Материальное",achieve:"Достижения",indiv:"Индивидуальность"};
const VEC_N={R:"Реалистичный",I:"Интеллектуальный",A:"Артистический",S:"Социальный",E:"Предпринимательский",C:"Конвенциальный"};
/* Названия профессий антирейтинга (в данных хранятся коды) */
const ANTI_N={electr:"Электрик",farmer:"Фермер",builder:"Строитель",mech:"Автомеханик",
 sci:"Ученый-исследователь",prog:"Программист",data:"Дата-аналитик",diag:"Врач-диагност",
 design:"Дизайнер",actor:"Актер",journ:"Журналист",arch:"Архитектор",
 teacher:"Учитель",psy:"Психолог",ped:"Врач-педиатр",social:"Соцработник",
 prod:"Продюсер / медиа",sales:"Менеджер по продажам",market:"Маркетплейс-предприниматель",blog:"Блогер",
 acc:"Бухгалтер",cyber:"Кибербезопасность",logist:"Логист",notar:"Нотариус"};
function antiLabel(d,id){
  if(ANTI_N[id]) return ANTI_N[id];
  const own=((d.res||{}).anti||{}).own||[];
  const o=own.find(x=>x.id===id);
  return o? o.r+" ✎" : id;   // ✎ — профессия, вписанная участником вручную
}
const MCC_N={P:"Власть",A:"Причастность",D:"Достижения"};
const SD_RE=/не потяну|не настолько|сложно поступить|не получится|қолымнан келмейді|жетпейді/i;

/* Записи из демо-кнопки "Пройти всё" в app.html — либо помечены isDemo:true (новые),
   либо (старые, до фикса) распознаются по жёстко зашитому демо-профилю. */
function isDemoEntry(d){
  if(d.isDemo===true) return true;
  const p=d.profile||{};
  return p.name==="Демо Айым" && p.age===15 && p.city==="Алматы";
}

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
function bars(obj,names,max){
  return Object.entries(obj||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>
   `<div class="bar"><div class="bl"><span>${names[k]||k}</span><b>${v}${max===1?"":"/"+max}</b></div>
    <div class="bt"><i style="width:${(max===1?v:v/max)*100}%"></i></div></div>`).join("");
}
function fmtDate(iso){
  if(!iso) return "";
  const d=new Date(iso); if(isNaN(d)) return "";
  return d.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit",year:"numeric"})+", "+d.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"});
}
function visibleStudents(){
  const showDemo=document.getElementById("showDemo").checked;
  return students.map((s,i)=>({s,i})).filter(x=>showDemo || !isDemoEntry(x.s.data));
}
function renderList(){
  const vis=visibleStudents();
  document.getElementById("cnt").textContent=vis.length;
  const hidden=students.length-vis.length;
  const note=document.getElementById("hiddenNote");
  if(hidden>0){ note.style.display="block"; note.textContent="🙈 Скрыто тестовых записей: "+hidden+" (включите «показывать тестовые», чтобы увидеть, или удалите их прямо в Google Таблице)."; }
  else{ note.style.display="none"; }
  const el=document.getElementById("list");
  if(!vis.length){el.innerHTML='<div class="empty">Пока пусто.</div>';return;}
  el.innerHTML=vis.map(({s,i})=>{
    const p=s.data.profile||{};
    return `<div class="stud ${i===sel?'on':''}" onclick="selStud(${i})">
      <div class="nm">${[p.name,p.surname].filter(Boolean).join(" ")||"Без имени"}${p.age?", "+p.age:""} ${s.status==='ok'?'✅':'📝'}</div>
      <div class="meta">${p.city||""} · трек: ${({kz:"Казахстан",abroad:"за рубеж",both:"оба",undecided:"не решено"})[p.track]||"—"}</div>
      ${p.phone?`<div class="meta">📞 ${p.phone}</div>`:""}
      <div class="meta">📅 сдано: ${fmtDate(s.data.exported)||"—"}</div>
      <div>${flags(s.data).map(f=>`<span class="flag ${f.c}">${f.t}</span>`).join("")}</div>
    </div>`;}).join("");
}
function saveStudents(){ try{ localStorage.setItem("sana_students", JSON.stringify(students)); }catch(e){} }
function loadStudents(){ try{ return JSON.parse(localStorage.getItem("sana_students")||"[]"); }catch(e){ return []; } }
function selStud(i){ sel=i; renderList(); renderDetail(); }
function renderDetail(){
  const el=document.getElementById("detail");
  if(sel<0||!students[sel]){el.innerHTML='<div class="empty">Выберите ученика слева</div>';return;}
  const st=students[sel], d=st.data, r=d.res||{}, sc=d.scores||{}, p=d.profile||{};
  const anti=r.anti||{picks:[],reasons:{}};
  const sd=anti.picks.filter(id=>SD_RE.test(anti.reasons[id]||""));
  const m=r.multi||{lives:[],pride:{}};
  el.innerHTML=`
    <h3 style="margin-top:0">${[p.name,p.surname].filter(Boolean).join(" ")||"Без имени"}${p.age?", "+p.age:""} — профиль</h3>
    <div class="meta" style="margin:-4px 0 10px">📅 сдано: ${fmtDate(d.exported)||"—"}${p.phone?" · 📞 "+p.phone:""}${p.city?" · "+p.city:""}</div>
    <div class="cols">
      <div><h3>Вектора (Холланд)</h3><div class="sec">${bars(sc.riasec,VEC_N,1)}</div></div>
      <div><h3>Потребности (игра)</h3><div class="sec">${bars(sc.mcclelland,MCC_N,100)}
        ${Object.values((r.game||{}).open||{}).filter(Boolean).map(x=>`<p>«${x}»</p>`).join("")}</div></div>
      <div><h3>Якоря (Шейн)</h3><div class="sec">${bars(sc.schein,SCH_N,10)}</div></div>
      <div><h3>Ценности</h3><div class="sec">${bars(sc.values,VAL_N,50)}</div></div>
    </div>
    <h3>Антирейтинг</h3><div class="sec">${anti.picks.map(id=>`<p><b>${antiLabel(d,id)}:</b> «${anti.reasons[id]||"—"}»</p>`).join("")||"—"}</div>
    ${sd.length?`<h3 style="color:var(--warn)">⚠️ Зона компромисса (SELFDOUBT)</h3>
      <div class="sec" style="border:1.5px solid var(--warn)">${sd.map(id=>`<p><b>${antiLabel(d,id)}:</b> «${anti.reasons[id]}»</p>`).join("")}</div>`:""}
    <h3>Мультивселенная</h3><div class="sec">
      ${(m.lives||[]).map((l,i)=>l.who?`<p><b>${i+1}. ${l.who}</b> · ${l.where||"—"}${l.give?" · "+l.give:""}</p>`:"").join("")||"—"}
      ${m.pride&&m.pride.who?`<p style="color:var(--warn)"><b>👑 Гордость: ${m.pride.who}</b> · ${m.pride.where||"—"}</p>`:""}</div>
    <h3>Три кита и деньги</h3><div class="sec">
      ${r.whales&&r.whales.create?`<p><b>Создает:</b> «${r.whales.create}»</p>`:""}
      ${r.whales&&r.whales.learn?`<p><b>Учится:</b> «${r.whales.learn}»</p>`:""}
      ${r.whales&&r.whales.give?`<p><b>Дает миру:</b> «${r.whales.give}»</p>`:""}
      <p><b>Деньги:</b> ${((r.money||{}).start||0).toLocaleString()} ₸ → ${((r.money||{}).pro||0).toLocaleString()} ₸
      ${(r.money||{}).reflect?`· «${r.money.reflect}»`:""}</p></div>
    <h3>Ответы синтеза (День 8)</h3><div class="sec">${Object.values(r.synth||{}).filter(Boolean).map(x=>`<p>«${x}»</p>`).join("")||"—"}</div>
    <h3>Нарратив (День 3)</h3><div class="sec">${Object.entries(r.narrative||{}).filter(x=>x[1]).map(x=>`<p><b>${x[0]}:</b> «${x[1]}»</p>`).join("")||"—"}</div>
    <h3>✨ ИИ-анализ</h3>
    <div class="sec">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button onclick="aiDraft()" ${st.aiWait?"disabled":""} style="flex:1;border:none;border-radius:10px;padding:11px;font-weight:800;cursor:pointer;background:var(--grad);color:#fff">${st.aiWait?"⏳ ИИ анализирует…":"✨ Черновик отчета"}</button>
        <button onclick="copyProfile()" style="flex:1;border:1.5px solid #333a6e;border-radius:10px;padding:11px;font-weight:700;cursor:pointer;background:transparent;color:var(--ink)">📋 Скопировать для ИИ-чата</button>
      </div>
      <button onclick="makeZakl()" style="width:100%;margin-top:8px;border:none;border-radius:10px;padding:11px;font-weight:800;cursor:pointer;background:#8FC5B5;color:#0b0e20">📄 Подготовить заключение для клиента</button>
      ${st.draftText? `<div style="white-space:pre-wrap;margin-top:12px;background:#141936;border-radius:10px;padding:14px;font-size:13.5px;line-height:1.6">${st.draftText.replace(/</g,"&lt;")}</div>
      <button onclick="navigator.clipboard.writeText(students[sel].draftText);alert('Черновик скопирован')" style="margin-top:8px;border:1.5px solid #333a6e;border-radius:10px;padding:9px 14px;font-weight:700;cursor:pointer;background:transparent;color:var(--muted)">📋 Копировать черновик</button>`:""}
      ${st.aiErr? `<p style="color:var(--danger);margin-top:10px">⚠️ ${st.aiErr}</p>`:""}
    </div>
    <div class="status">
      <button class="${st.status==='draft'?'on':''}" onclick="setStatus('draft')">📝 Черновик</button>
      <button class="${st.status==='ok'?'on':''}" onclick="setStatus('ok')">✅ Проверено</button>
    </div>`;
}
function setStatus(v){ students[sel].status=v; renderList(); renderDetail(); }
function condensed(d){
  const c=JSON.parse(JSON.stringify(d));
  if(c.res && c.res.riasec) delete c.res.riasec;
  return c;
}
const AI_TASK="Ты помогаешь профориентологу. Проанализируй JSON-профиль подростка по 8-дневной диагностике Sana Space (Холланд, Шейн, Макклеланд, ценности, ЛУПа, антирейтинг, Мультивселенная, три кита): составь черновик отчета — вектора, профессии (с учетом трека), ключевой внутренний конфликт с цифрами и цитатами, зона компромисса (отказы из-за «не потяну»), семейный сценарий (свободные порталы vs Вселенная Гордости), флаги для консультанта. Опирайся только на данные.\n\nЖЕСТКОЕ ПРАВИЛО ЧТЕНИЯ ЛУПЫ (res.lupa, шкала 1-10):\n• 7-10 — ядро интересов; только эти позиции считаются интересами и могут быть основанием для рекомендации.\n• 4-6 — нейтральная зона; ЗАПРЕЩЕНО называть их сильными сторонами и использовать как основание для рекомендации. Допустимы только как вторичное подтверждение вывода, уже сделанного по другим данным.\n• 1-3 — антиинтересы; используются исключительно для исключения направлений, наравне с антирейтингом.\n• Если позиций с оценкой >=7 меньше трех — не достраивай картину, пометь профиль как «УЗКИЙ СИГНАЛ», опирайся на другие блоки данных и вынеси это во флаги для консультанта.\n\nJSON-профиль:\n";
async function aiDraft(){
  const st=students[sel]; if(!st||st.aiWait) return;
  const url=(document.getElementById("ai_url").value||"").trim();
  if(!url){ st.aiErr="Вставьте URL ИИ в поле сверху: https://ВАШ-САЙТ.netlify.app/api/chat"; renderDetail(); return; }
  try{ const gs=JSON.parse(localStorage.getItem("sana_gs")||"{}"); gs.ai=url; localStorage.setItem("sana_gs",JSON.stringify(gs)); }catch(e){}
  st.aiWait=true; st.aiErr=""; renderDetail();
  try{
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({mode:"report",lang:"ru",
        messages:[{role:"user",content:"JSON-профиль подростка:\n"+JSON.stringify(condensed(st.data))}]})});
    const d=await r.json();
    if(d.error) throw new Error(d.error+(d.detail?": "+d.detail:""));
    st.draftText=(d.text||"").trim()||"Пустой ответ ИИ";
  }catch(e){
    st.aiErr="Не получилось: "+e.message+". Проверьте, что на сайт загружен chat.js v2 (режим report) и папка перезалита на Netlify.";
  }
  st.aiWait=false; renderDetail();
}
function copyProfile(){
  const st=students[sel]; if(!st) return;
  navigator.clipboard.writeText(AI_TASK+JSON.stringify(condensed(st.data),null,1))
    .then(()=>alert("Профиль с инструкцией скопирован — вставьте в чат с ИИ (Claude и др.)"))
    .catch(()=>alert("Не удалось скопировать"));
}
/* Передача клиента в генератор заключений */
function makeZakl(){
  const st=students[sel]; if(!st) return;
  const p=st.data.profile||{};
  const payload={
    name:p.name||"", surname:p.surname||"", age:p.age||"",
    city:p.city||"", phone:p.phone||"", track:p.track||""
  };
  try{ localStorage.setItem("sana_zakl_client",JSON.stringify(payload)); }
  catch(e){ alert("Не удалось передать данные клиента"); return; }
  // черновик ИИ (если есть) кладём отдельно — генератор предложит вставить его в комментарии
  try{
    if(st.draftText) localStorage.setItem("sana_zakl_draft_ai",st.draftText);
    else localStorage.removeItem("sana_zakl_draft_ai");
  }catch(e){}
  window.open("zaklyuchenie.html","_blank");
}

async function loadFromSheet(){
  const url=document.getElementById("gs_url").value.trim();
  const key=document.getElementById("gs_key").value.trim();
  const st=document.getElementById("gs_status");
  if(!url){ st.textContent="Вставьте URL скрипта (тот же, что в app.html, заканчивается на /exec)"; return; }
  try{ const gs=JSON.parse(localStorage.getItem("sana_gs")||"{}"); gs.url=url; gs.key=key; localStorage.setItem("sana_gs",JSON.stringify(gs)); }catch(e){}
  st.textContent="⏳ Загружаю…";
  try{
    const r=await fetch(url+"?key="+encodeURIComponent(key));
    const arr=await r.json();
    if(!Array.isArray(arr)) throw 0;
    let added=0;
    arr.forEach(d=>{
      if(d.app!=="sana_space_prototype") return;
      const sig=JSON.stringify(d.profile)+String(d.exported||"");
      if(students.some(x=>x.sig===sig)) return;
      students.push({data:d,status:"draft",sig}); added++;
    });
    students.sort((a,b)=>new Date(b.data.exported||0)-new Date(a.data.exported||0));
    saveStudents();
    renderList();
    st.textContent="✅ Загружено: "+added+" нов. (всего "+students.length+")";
  }catch(e){
    st.textContent="⚠️ Не получилось. Проверьте: URL верный, ключ совпадает с SECRET в скрипте, скрипт переразвернут с doGet.";
  }
}
try{ const gs=JSON.parse(localStorage.getItem("sana_gs")||"null");
  if(gs){ document.getElementById("gs_url").value=gs.url||""; document.getElementById("gs_key").value=gs.key||"";
    document.getElementById("ai_url").value=gs.ai||""; } }catch(e){}
function addFiles(files){
  [...files].forEach(f=>{
    const rd=new FileReader();
    rd.onload=()=>{ try{
      const d=JSON.parse(rd.result);
      if(d.app!=="sana_space_prototype") throw 0;
      students.push({data:d,status:"draft",sig:JSON.stringify(d.profile)+String(d.exported||"")});
      students.sort((a,b)=>new Date(b.data.exported||0)-new Date(a.data.exported||0));
      saveStudents();
      renderList();
    }catch(e){ alert("Файл не похож на результаты Sana Space: "+f.name); } };
    rd.readAsText(f);
  });
}
const drop=document.getElementById("drop"), fi=document.getElementById("fi");
drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("over");});
drop.addEventListener("dragleave",()=>drop.classList.remove("over"));
drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("over");addFiles(e.dataTransfer.files);});
fi.addEventListener("change",()=>addFiles(fi.files));
/* Восстанавливаем очередь из прошлой сессии, чтобы карточки не пропадали при перезагрузке страницы */
students = loadStudents();
renderList();
if(sel<0 && students.length) selStud(0);
/* Автозагрузка новых результатов из таблицы, если URL уже сохранён */
if(document.getElementById("gs_url").value.trim()) loadFromSheet();
