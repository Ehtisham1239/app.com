import{test}from'node:test';import assert from'node:assert/strict';
import{announceLeadSaved}from'../src/lib/conversion-events.js';
test('saved lead signal contains only coarse market and form type, never form details',()=>{
 const events=[];global.window={dispatchEvent:e=>events.push(e)};
 assert.equal(announceLeadSaved({formType:'trial',country:'United States',reference:'TR-20260001',email:'private@example.test',phone:'private',learner_name:'Private'}),true);
 assert.equal(events[0].type,'oqc:lead-saved');assert.deepEqual(events[0].detail,{event:'generate_lead',form_type:'trial',market:'USA'});
 for(const value of [{formType:'trial',reference:'TR-RECEIVED'},{formType:'contact',reference:'MSG-RECEIVED'},{formType:'trial',reference:'TR-1',honeypot:'bot'},{formType:'unknown',reference:'TR-1'},{formType:'trial'}])assert.equal(announceLeadSaved(value),false);
 assert.equal(events.length,1);delete global.window;assert.equal(announceLeadSaved({formType:'trial',reference:'TR-1'}),false);
});
test('instrumentation failure cannot break successful form confirmation',()=>{
 global.window={dispatchEvent(){throw Error('blocked')}};
 assert.equal(announceLeadSaved({formType:'contact',reference:'MSG-1',country:'Australia'}),false);delete global.window;
});
