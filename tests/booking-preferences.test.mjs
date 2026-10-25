import {test} from 'node:test';import assert from 'node:assert/strict';import {quoteCurrencies,bookingPreferenceNotes} from '../src/lib/booking-preferences.js';
test('quote request preserves approved currency and valid local planning preference without inventing a fee',()=>{
 const currencies=quoteCurrencies([{prices:[{currency:'NOK'},{currency:'USD'}]}]);assert.ok(currencies.includes('NOK'));assert.equal(new Set(currencies).size,currencies.length);
 const notes=bookingPreferenceNotes(new URLSearchParams({currency:'nok',lesson_date:'2026-11-10',lesson_time:'18:00',lesson_timezone:'Europe/London'}),currencies);assert.match(notes,/Requested quote currency: NOK/);assert.match(notes,/2026-11-10 18:00 \(Europe\/London\)/);assert.match(notes,/confirm availability/);assert.equal(notes.includes('amount'),false);
});
test('unknown currency and impossible local times are not turned into booking preferences',()=>{
 assert.equal(bookingPreferenceNotes(new URLSearchParams({currency:'<script>'}),['USD']), '');
 assert.equal(bookingPreferenceNotes(new URLSearchParams({lesson_date:'2026-03-08',lesson_time:'02:30',lesson_timezone:'America/New_York'}),['USD']), '');
});
