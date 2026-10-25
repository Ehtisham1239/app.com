import {LOCATIONS} from './locations.js';
import {schedulePreview} from './location-schedule.js';

export function quoteCurrencies(plans = []) {
  return [...new Set([...LOCATIONS.map(country => country.currency), ...plans.flatMap(plan => (plan.prices || []).map(price => price.currency))])].filter(code => /^[A-Z]{3}$/.test(code));
}

export function bookingPreferenceNotes(params, currencies = []) {
  const currency = (params.get('currency') || '').trim().toUpperCase();
  const date = params.get('lesson_date') || '', time = params.get('lesson_time') || '', zone = params.get('lesson_timezone') || '';
  const preview = date && time && zone ? schedulePreview(date, time, zone) : null;
  return [currencies.includes(currency) ? `Requested quote currency: ${currency}` : '', preview ? `Preferred local lesson time: ${date} ${time} (${zone}). Coordinator to confirm availability${preview.ambiguous ? ' and UTC offset' : ''}.` : ''].filter(Boolean).join('\n');
}
