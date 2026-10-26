import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, serializeCsv } from '../src/lib/csv.js';

test('untrusted CSV formulas, phone prefixes, whitespace and locale operators stay text', () => {
  for (const text of ['=1+2', '+447000000000', '-1+2', '@SUM(A1)', '  =HYPERLINK("https://example.invalid")', '\t=1', '\r=1', '\n=1', '＝1+2', '＋1', '－1', '＠SUM(A1)']) {
    assert.ok(csvCell(text).startsWith('"\t'), JSON.stringify(text));
  }
  assert.equal(csvCell(-12.5), '"-12.5"');
  assert.equal(csvCell(0), '"0"');
});

test('CSV keeps separators, quotes, Unicode and multiline data inside one cell', () => {
  assert.equal(csvCell('علی, "student"\r\nnext'), '"علی, ""student""\r\nnext"');
  assert.equal(csvCell('safe,=1+2'), '"safe,=1+2"');
  assert.equal(csvCell(null), '""');
  const csv = serializeCsv([{ name: '=1+2', count: 3 }], [{ key: 'name', label: 'Name' }, { key: 'count', label: 'Count' }]);
  assert.equal(csv, '\uFEFF"Name","Count"\r\n"\t=1+2","3"');
});
