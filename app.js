import {categories,validEntry,summarize} from './finance.js';
const $=id=>document.getElementById(id), key='silver-family-finance-v1';
let storageReadFailed=false;
let state={currency:'MYR',entries:[],budgets:{}};
try{const raw=localStorage.getItem(key);if(raw){const x=JSON.parse(raw);validate(x);state=x;}}catch{ storageReadFailed=true; $('message').textContent='Saved data could not be read. Export or recover your original data before adding entries.';}
function validate(x){if(!x || !['MYR','SGD','USD','GBP','EUR','AUD'].includes(x.currency)||!Array.isArray(x.entries)||!x.entries.every(validEntry)||new Set(x.entries.map(e=>e.id)).size!==x.entries.length||!x.budgets||typeof x.budgets!=='object'||Array.isArray(x.budgets)||!Object.entries(x.budgets).every(([k,v])=>/^\d{4}-\d{2}$/.test(k)&&Number.isSafeInteger(v)&&v>=0))throw Error('Invalid backup');}
function save(next){if(storageReadFailed){$('message').textContent='Saving is blocked to protect unreadable stored data. Recover your browser data before continuing.';return false;}try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}catch{$('message').textContent='Could not save. Browser storage may be full or unavailable. Export a backup.';return false;}}
function money(cents){return new Intl.NumberFormat('en-MY',{style:'currency',currency:state.currency}).format(cents/100);}
const today=new Date().toLocaleDateString('en-CA');
$('month').value=today.slice(0,7);
$('entry-form').elements.date.value=today;
for(const c of categories){const o=document.createElement('option');o.textContent=c;$('category-input').append(o);}
function render(){
 $('currency').value=state.currency;
 const selected=$('filter').value; const options=[...new Set(state.entries.map(e=>e.member))].sort();
 $('filter').replaceChildren(new Option('Everyone',''),...options.map(m=>new Option(m,m)));if(options.includes(selected))$('filter').value=selected;
 const s=summarize(state.entries,$('month').value,$('filter').value);
 for(const name of ['income','expenses','balance'])$(name).textContent=money(s[name]);
 $('rate').textContent=s.savingsRate===null?'—':`${(s.savingsRate*100).toFixed(1)}%`;
 $('categories').replaceChildren();const sorted=Object.entries(s.byCategory).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
 if(!sorted.length){const p=document.createElement('p');p.className='empty';p.textContent='No spending recorded for this selection.';$('categories').append(p);}
 for(const [name,value] of sorted){const row=document.createElement('div');row.className='category';const label=document.createElement('div');label.className='category-label';const a=document.createElement('span'),b=document.createElement('span');a.textContent=name;b.textContent=`${money(value)} · ${(value/s.expenses*100).toFixed(0)}%`;label.append(a,b);const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.className='fill';fill.style.width=`${value/s.expenses*100}%`;track.append(fill);row.append(label,track);$('categories').append(row);}
 $('budget-value').value=state.budgets[$('month').value]!==undefined?state.budgets[$('month').value]/100:'';
 const budget=state.budgets[$('month').value],family=summarize(state.entries,$('month').value);
 $('budget-result').textContent=budget===undefined?'Set a monthly limit to compare it with your recorded family spending.':`${money(family.expenses)} spent of ${money(budget)}. ${money(Math.abs(budget-family.expenses))} ${budget>=family.expenses?'remaining':'over budget'}.`;
 $('rows').replaceChildren();$('empty').hidden=s.rows.length>0;
 for(const x of [...s.rows].sort((a,b)=>b.date.localeCompare(a.date))){const tr=document.createElement('tr');for(const text of [x.date,x.note,x.member,x.type==='income'?'Income':x.category,`${x.type==='income'?'+':'−'}${money(x.cents)}`]){const td=document.createElement('td');td.textContent=text;tr.append(td);}const td=document.createElement('td'),btn=document.createElement('button');btn.className='secondary';btn.textContent='Delete';btn.setAttribute('aria-label',`Delete ${x.note}`);btn.onclick=()=>{if(confirm('Delete this transaction?')&&save({...state,entries:state.entries.filter(e=>e.id!==x.id)}))render();};td.append(btn);tr.append(td);$('rows').append(tr);}
}
$('add').onclick=()=>$('dialog').showModal();$('close').onclick=()=>$('dialog').close();
$('month').onchange=render;$('filter').onchange=render;
$('currency').onchange=()=>{if(state.entries.length&&!confirm('Change display currency? Existing amounts will not be converted.')){$('currency').value=state.currency;return;}if(save({...state,currency:$('currency').value}))render();};
$('entry-form').onsubmit=e=>{e.preventDefault();const f=e.target.elements, amount=Number(f.amount.value),cents=Math.round(amount*100);const x={id:crypto.randomUUID(),type:f.type.value,cents,date:f.date.value,note:f.note.value.trim(),member:f.member.value.trim(),category:f.category.value};if(!validEntry(x)||!x.note||!x.member){alert('Enter a valid amount, date, description, and family member.');return;}if(save({...state,entries:[...state.entries,x]})){$('month').value=x.date.slice(0,7);$('filter').value='';e.target.reset();f.date.value=today;$('dialog').close();render();}};
$('budget-form').onsubmit=e=>{e.preventDefault();const value=Math.round(Number($('budget-value').value)*100);if(!Number.isSafeInteger(value)||value<0)return;if(save({...state,budgets:{...state.budgets,[$('month').value]:value}}))render();};
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`silver-family-backup-${today}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5_000_000)throw Error('Large file');const x=JSON.parse(await file.text());validate(x);if(confirm('Replace all current records and budgets with this backup?')&&save(x)){render();$('message').textContent='Backup restored.';}}catch{$('message').textContent='Could not restore this file. Choose a valid SILVER-AI JSON backup (up to 5 MB).';}e.target.value='';};
render();
