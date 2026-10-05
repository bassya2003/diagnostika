// Проверяем: старое сохранение (без sex, без anti.own) не ломает новый код
const fs=require('fs');
const src=fs.readFileSync('/sessions/happy-stoic-heisenberg/mnt/sana-site/public/app.html','utf8');

// старый профиль, каким он лежит в браузере у ребёнка на 5-м дне
const oldS={lang:"ru",screen:"home",
  profile:{name:"Аня",age:"16",city:"Алматы",track:"kz",voluntary:true}, // нет surname, phone, sex
  doneDays:[1,2,3,4,5],
  res:{game:{pattern:["D"],open:{}},lupa:{subjects:{math:8},activities:{code:7},probes:{}},
       narrative:{},riasec:{0:1},anti:{picks:["prog"],reasons:{prog:"скучно"}}, // нет own
       values:{},schein:{},scen:{},whales:{},money:{},synth:{}},
  sentOk:false};

// места, где новый код обращается к новым полям
const checks=[
 ["профиль: пол не задан",      ()=> (oldS.profile.sex==='f'?'on':'') ],
 ["антирейтинг: own отсутствует",()=> (oldS.res.anti.own||[]).map(o=>o.r).join(",") ],
 ["имя для ИИ",                  ()=> ({name:oldS.profile.name||"",sex:oldS.profile.sex||""}) ],
 ["сохранение прогресса",        ()=> JSON.stringify(oldS).length ],
 ["дней пройдено",               ()=> oldS.doneDays.length ],
];
checks.forEach(([n,f])=>{
  try{ const r=f(); console.log("✅", n.padEnd(30), "→", typeof r==="object"?JSON.stringify(r):r); }
  catch(e){ console.log("❌", n.padEnd(30), "→ ОШИБКА:", e.message); }
});

// проверим, что в коде везде стоит защита для anti.own
const risky=[...src.matchAll(/anti\.own/g)].length;
const guarded=[...src.matchAll(/anti\.own\s*\|\||anti\.own\s*=\s*S\.res\.anti\.own\s*\|\||\(\s*S\.res\.anti\.own\s*\|\|\s*\[\]\s*\)|\(R\.anti\.own\|\|\[\]\)|\(\(d\.res\|\|\{\}\)\.anti\|\|\{\}\)\.own\|\|\[\]/g)].length;
console.log("\nобращений к anti.own в коде:", risky);
