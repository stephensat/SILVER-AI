import {test} from 'node:test';
import assert from 'node:assert/strict';
import {summarize,validEntry} from '../finance.js';
const row=(type,cents,member='Stephen',date='2026-10-24')=>({id:crypto.randomUUID(),date,type,cents,member,note:'Record',category:'Groceries'});
test('family totals reconcile in cents and preserve negative cash flow',()=>{const s=summarize([row('income',10000),row('expense',6500),row('expense',5000,'Family')],'2026-10');assert.equal(s.income,10000);assert.equal(s.expenses,11500);assert.equal(s.balance,-1500);assert.equal(s.savingsRate,-.15);assert.equal(s.byCategory.Groceries,11500);});
test('month and member filters intersect',()=>{const s=summarize([row('income',10000),row('expense',3000,'Family'),row('expense',2000,'Stephen','2026-09-01')],'2026-10','Stephen');assert.equal(s.rows.length,1);assert.equal(s.expenses,0);});
test('empty selection has no invented rate',()=>{assert.equal(summarize([],'2026-10').savingsRate,null);});
test('invalid financial amounts are rejected',()=>{assert.equal(validEntry(row('expense',-1)),false);assert.equal(validEntry(row('expense',1.5)),false);assert.equal(validEntry(row('expense',100)),true);});
