const fs=require('fs');
let code=fs.readFileSync('roster.js','utf8');
// заглушки Google-объектов
global.Utilities={formatDate:(d)=>('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+d.getFullYear()};
global.Session={getScriptTimeZone:()=>"Asia/Almaty"};
const written={};
const sheet={clear(){},getRange(){return{setValues(v){written.last=v;return this},setFontWeight(){return this},
 setBackground(){return this},setFontColor(){return this},setHorizontalAlignment(){return this},
 setVerticalAlignment(){return this},setNumberFormat(){return this}}},
 setFrozenRows(){},setRowHeight(){},setColumnWidth(){},getDataRange:()=>({getValues:()=>ROWS})};
global.SpreadsheetApp={getActiveSpreadsheet:()=>({getSheetByName:n=>n==="Результаты"?sheet:null,insertSheet:()=>sheet}),
 getUi:()=>({alert:m=>console.log("ALERT:",m.split("\n")[0]),createMenu:()=>({addItem(){return this},addToUi(){}})})};

const j=o=>JSON.stringify(o);
const ROWS=[
 ["дата","профиль","json"],
 // старый клиент без фамилии, синтез заполнен, doneDays 1-7 (баг Дня 8)
 ["","",j({exported:"2026-08-17T16:14:00Z",profile:{name:"Шахар",age:"16",city:"Шымкент",track:"abroad",voluntary:false},
   doneDays:[1,2,3,4,5,6,7],res:{synth:{q0:"ответ есть"}}})],
 // новый клиент с фамилией и телефоном
 ["","",j({exported:"2026-08-18T15:55:00Z",profile:{name:"Дамели",surname:"Егенбердиева",age:"17",city:"Шымкент",phone:"7018370059",track:"both",voluntary:false},
   doneDays:[1,2,3,4,5,6,7,8],res:{synth:{q0:"да"}}})],
 // демо-запись — должна отсеяться
 ["","",j({isDemo:true,exported:"2026-08-10T10:00:00Z",profile:{name:"Демо Айым",age:"15",city:"Алматы"},doneDays:[1,2],res:{}})],
 // тот же человек прошёл повторно — должна остаться свежая попытка
 ["","",j({exported:"2026-08-19T09:00:00Z",profile:{name:"Дамели",surname:"Егенбердиева",age:"17",city:"Шымкент",phone:"7018370059",track:"kz",voluntary:true},
   doneDays:[1,2,3,4,5,6,7,8],res:{synth:{q0:"повтор"}}})],
 // недошедший участник
 ["","",j({exported:"2026-07-11T18:06:00Z",profile:{name:"дарья",age:"16",city:"уральск",track:"undecided",voluntary:false},
   doneDays:[1,2,3],res:{}})],
];
eval(code);
buildRoster();
console.log();
written.last && console.table? null:null;
const rows=written.last;
