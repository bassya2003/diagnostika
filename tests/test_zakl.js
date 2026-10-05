const store={};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
const els={};
function mk(id){ return {id,value:"",innerHTML:"",style:{},textContent:"",classList:{add(){},remove(){}}}; }
["autoinfo","f_name","f_expert","f_date","f_program","f_cities","f_paid","f_free",
 "vecgrid","vecwarn","newvec","mainvec","profs","eduform","edulist","doc","savemsg",
 "form","preview","tab_form","tab_prev","aidraftbox"].forEach(i=>els[i]=mk(i));
global.document={getElementById:i=>els[i]||null,createElement:()=>({style:{},click(){},remove(){}}),body:{appendChild(){}}};
global.window={scrollTo(){},print(){}};
global.alert=console.log; global.confirm=()=>true;
store["sana_zakl_client"]=JSON.stringify({name:"Дамели",surname:"Егенбердиева",age:"17",city:"Шымкент",phone:"7018370059"});
store["sana_zakl_draft_ai"]="Черновик ИИ: тестовый анализ профиля.";

const fs=require('fs');
const js=fs.readFileSync('zakl.js','utf8');
const test=`
els.f_name.value="ЕГЕНБЕРДИЕВА ДАМЕЛИ";
els.f_expert.value="Бапанова Асель С";
els.f_date.value="Август 2026 года";
els.f_program.value="Выбор профессии 3.0";
els.f_cities.value="Алматы, Астана";
els.f_paid.value="Рассматривались как запасной вариант.";
els.f_free.value="Системный анализ профиля.\\n\\nВторой абзац.";
console.log("intake подставил city:", S.cities, "| name:", S.name);
toggleVec("Творческий"); toggleVec("Инженерный"); setMain("Творческий");
toggleProf(0,0); toggleProf(1,0);
toggleEduForm("Очная");
addEdu(); S.edu[0]={place:"КазГАСА",prog:"Архитектурный дизайн",url:"https://kazgasa.kz/"};
addEdu(); S.edu[1]={place:"КазГАСА",prog:"Дизайн интерьера",url:"https://kazgasa.kz/"};
addEdu(); S.edu[2]={place:"КазНАИ им. Жургенова",prog:"Графический дизайн",url:"https://kaznai.kz/"};
pasteAi();
buildDoc();
const doc=els.doc.innerHTML;
console.log("страниц:", (doc.match(/class="pg"/g)||[]).length);
console.log("ФИО:", doc.includes("ЕГЕНБЕРДИЕВА ДАМЕЛИ"));
console.log("основной помечен:", doc.includes("tagmain"));
console.log("Архитектор:", doc.includes("Архитектор"));
console.log("группировка КазГАСА:", doc.includes("Варианты обучения в КазГАСА"));
console.log("группировка КазНАИ:", doc.includes("Варианты обучения в КазНАИ им. Жургенова"));
console.log("доп.комментарии:", doc.includes("Дополнительные комментарии"));
console.log("черновик ИИ вставлен:", doc.includes("Черновик ИИ"));
console.log("критерии:", (doc.match(/Критерий \\d/g)||[]).join(","));
console.log("свой вектор:"); els.newvec.value="Спорт и физкультура"; addVec();
console.log("  добавлен:", S.vecs.includes("Спорт и физкультура"));
console.log("предупреждение >4:", els.vecwarn.style.display);
`;
eval(js + test);

// сохраняем собранный документ как автономный HTML для визуальной проверки
const srcAll=fs.readFileSync('/sessions/happy-stoic-heisenberg/mnt/sana-site/public/zaklyuchenie.html','utf8');
const css=srcAll.match(/<style>([\s\S]*?)<\/style>/)[1];
const docHtml=els.doc.innerHTML;
fs.writeFileSync('zakl_preview.html',
 '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'+css+
 '\nbody{background:#fff}.pg{border-bottom:2px solid #ccc}</style></head><body><div class="doc">'+docHtml+'</div></body></html>');
console.log("preview saved");
