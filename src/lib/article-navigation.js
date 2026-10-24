import {slugify,stripHtml} from './format.js';
// Call with already sanitised article HTML. IDs use a restricted slug alphabet.
export function articleNavigation(cleanedHtml) {
  const headings=[],used=new Set();
  const html=cleanedHtml.replace(/<h2>([\s\S]*?)<\/h2>/g,(_,inner)=>{
    const title=stripHtml(inner).replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"');
    const base=`section-${slugify(title)||headings.length+1}`;let id=base,suffix=2;
    while(used.has(id))id=`${base}-${suffix++}`;
    used.add(id);headings.push({id,title});return `<h2 id="${id}">${inner}</h2>`;
  });
  return {html,headings};
}
