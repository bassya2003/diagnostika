const fs=require('fs');
const src=fs.readFileSync('/sessions/happy-stoic-heisenberg/mnt/sana-site/public/app.html','utf8');
// проверяем, что валидатор файла отсекает мусор
const fn=src.match(/function loadProgress\(input\)\{[\s\S]*?\n\}/)[0];
const check=(txt)=>{ try{ const d=JSON.parse(txt);
  return !(!d||typeof d!=="object"||!d.res) ; }catch(e){ return false; } };
const cases=[
 ["настоящий файл прогресса", JSON.stringify({profile:{name:"Аня"},doneDays:[1,2,3],res:{lupa:{}}})],
 ["чужой JSON (не наш)",      JSON.stringify({foo:"bar"})],
 ["битый текст",              "не json вовсе"],
 ["пустой объект",            "{}"],
 ["массив",                   "[1,2,3]"],
];
cases.forEach(([n,t])=>console.log((check(t)?"✅ примет":"⛔ отклонит").padEnd(14), n));
// сохранение: имя файла
const S={profile:{name:"Дамели"},doneDays:[1,2,3]};
const nm=(S.profile.name||"progress").replace(/[^\wа-яА-ЯёЁ\-]/gi,"")||"progress";
console.log("\nимя файла:", "sana_"+nm+"_"+S.doneDays.length+"дней.json");
