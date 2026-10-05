const fs=require('fs');
const src=fs.readFileSync('/sessions/happy-stoic-heisenberg/mnt/sana-site/public/app.html','utf8');
const ANTI=eval(src.match(/const ANTI = \[[\s\S]*?\n\];/)[0].replace('const ANTI =',''));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

const base=ANTI.map(x=>x.id).join(",");
let diff=0;
for(let i=0;i<200;i++) if(shuffle(ANTI).map(x=>x.id).join(",")!==base) diff++;
console.log("перемешивание меняет порядок:", diff+"/200");

const firstTypes={};
for(let i=0;i<600;i++){ const t=shuffle(ANTI)[0].v; firstTypes[t]=(firstTypes[t]||0)+1; }
console.log("тип на 1-й позиции (600 прогонов):", JSON.stringify(firstTypes));
console.log("  было всегда: R (Электрик) в 100% случаев");

const s=shuffle(ANTI);
console.log("профессий после shuffle:", s.length, "| уникальных:", new Set(s.map(x=>x.id)).size);
console.log("покрытие типов:", JSON.stringify(s.reduce((a,x)=>(a[x.v]=(a[x.v]||0)+1,a),{})));
