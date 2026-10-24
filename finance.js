export const categories = ['Groceries','Housing','Transport','Dining','Utilities','Health','Education','Shopping','Entertainment','Other'];
export function validEntry(x) {
  return x && typeof x.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && !Number.isNaN(Date.parse(x.date)) && new Date(x.date).toISOString().slice(0,10) === x.date && ['income','expense'].includes(x.type) && Number.isSafeInteger(x.cents) && x.cents > 0 && typeof x.note === 'string' && typeof x.member === 'string' && typeof x.category === 'string';
}
export function summarize(entries, month, member = '') {
  const rows = entries.filter(x => x.date.startsWith(month) && (!member || x.member === member));
  const income = rows.filter(x=>x.type==='income').reduce((s,x)=>s+x.cents,0);
  const expenses = rows.filter(x=>x.type==='expense').reduce((s,x)=>s+x.cents,0);
  const byCategory = Object.fromEntries(categories.map(c=>[c,0]));
  for (const x of rows.filter(x=>x.type==='expense')) byCategory[x.category]=(byCategory[x.category]||0)+x.cents;
  return { rows, income, expenses, balance:income-expenses, savingsRate:income ? (income-expenses)/income : null, byCategory };
}
