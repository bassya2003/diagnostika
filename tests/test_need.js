// извлекаем need() и проверяем на заглушке DOM
const fs=require('fs');
const src=fs.readFileSync('/sessions/happy-stoic-heisenberg/mnt/sana-site/public/app.html','utf8');
const need=src.match(/const MIN_TEXT[\s\S]*?\n\}\nfunction save/)[0].replace(/\nfunction save$/,'');

const fields={};
function mkEl(v){ return {value:v, classList:{_c:new Set(),add(x){this._c.add(x)},remove(x){this._c.delete(x)},
  contains(x){return this._c.has(x)}}, scrollIntoView(){}, focus(){},
  closest(){return card}, parentElement:null}; }
const card={ _kids:[], querySelector(s){ return s.includes("reqmsg")?null:{}; },
  insertBefore(m){ this._kids.push(m); }, appendChild(m){ this._kids.push(m); } };
global.document={
  getElementById:id=>fields[id]||null,
  querySelectorAll:()=>({forEach(){}}),
  createElement:()=>({className:"",textContent:""})
};
global.t=k=>k;
const needFn=eval("("+need.replace(/^const MIN_TEXT[^\n]*\n/,"").replace(/^const MIN_SHORT[^\n]*\n/,"").replace(/^function need/,"function ")+")");

function run(name, defs, vals){
  Object.keys(fields).forEach(k=>delete fields[k]);
  Object.entries(vals).forEach(([k,v])=>fields[k]=mkEl(v));
  const ok=needFn(defs);
  console.log((ok?"✅ пропустил":"⛔ заблокировал").padEnd(16), name);
  return ok;
}
run("пустой текст",        [{id:"a",min:10}], {a:""});
run("только пробелы",      [{id:"a",min:10}], {a:"    "});
run("короткий «да»",       [{id:"a",min:10}], {a:"да"});
run("9 символов",          [{id:"a",min:10}], {a:"короткий1"});
run("нормальный ответ",    [{id:"a",min:10}], {a:"Мне нравится создавать вещи руками"});
run("короткое поле: имя",  [{id:"a",min:2}],  {a:"Ян"});
run("короткое поле: 1 бук",[{id:"a",min:2}],  {a:"Я"});
run("число 0",             [{id:"a",min:"num"}], {a:"0"});
run("число пустое",        [{id:"a",min:"num"}], {a:""});
run("число 150000",        [{id:"a",min:"num"}], {a:"150000"});
run("2 поля, одно пустое", [{id:"a",min:10},{id:"b",min:10}], {a:"Нормальный ответ тут",b:""});
run("2 поля, оба ок",      [{id:"a",min:10},{id:"b",min:10}], {a:"Нормальный ответ тут",b:"И второй ответ тоже"});
