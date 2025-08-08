
// Adds a row of inputs roughly aligned to the table grid on the background template
function el(tag, attrs={}, children=[]){ const e=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){ if(k==='text') e.textContent=v; else if(k==='class') e.className=v; else e.setAttribute(k,v); }
  (Array.isArray(children)?children:[children]).forEach(c=>c && e.appendChild(c)); return e; }

function row(prefill=null){
  const r = el('div',{class:'row'});
  r.appendChild(el('div',{class:'cell',text:String(document.querySelectorAll('#rows .row').length+1)}));
  r.appendChild(el('div',{class:'cell'}, el('input',{type:'text',placeholder:'Tipo/Clase'})));
  r.appendChild(el('div',{class:'cell'}, el('input',{type:'text',placeholder:'Ubicación/Uso'})));
  for(let i=0;i<9;i++){
    r.appendChild(el('div',{class:'cell'}, el('select',{},[
      el('option',{value:'',text:''}), el('option',{value:'Bien',text:'Bien'}),
      el('option',{value:'Mal',text:'Mal'}), el('option',{value:'N/A',text:'N/A'})
    ])));
  }
  r.appendChild(el('div',{class:'cell'}, el('textarea',{rows:'2',placeholder:'Observaciones'})));
  if(prefill){
    const inputs=r.querySelectorAll('input,select,textarea');
    ['tipo','ubic'].forEach((k,i)=> inputs[i+0].value = prefill[k]||'');
    for(let i=0;i<9;i++){ inputs[2+i].value = prefill['q'+(i+1)]||''; }
    inputs[11].value = prefill['obs']||'';
  }
  return r;
}

function addRow(){ document.getElementById('rows').appendChild(row()); }
function clearRows(){ document.getElementById('rows').innerHTML=''; }

async function exportPDF(){
  const sheet=document.getElementById('sheet');
  if (typeof html2pdf === 'undefined') { window.print(); return; }
  const opt = {
    margin: 8,
    filename: `FS033_${(new Date().toISOString().slice(0,10))}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1, useCORS: true, allowTaint: true, scrollY: 0, windowWidth: sheet.offsetWidth },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'landscape' },
    pagebreak: { mode: ['css','legacy'] }
  };
  await html2pdf().from(sheet).set(opt).save();
}

window.addEventListener('load', ()=>{
  // Add 5 starter rows
  for(let i=0;i<5;i++) addRow();
  document.getElementById('fecha').value = new Date().toISOString().slice(0,10);
});
