
function el(tag, attrs={}, children=[]){ const e=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){ if(k==='text') e.textContent=v; else if(k==='class') e.className=v; else e.setAttribute(k,v); }
  (Array.isArray(children)?children:[children]).forEach(c=>c && e.appendChild(c)); return e; }

function selectSiNoNa(){ const s=el('select'); ['', 'Sí','No','N.A.'].forEach(v=> s.appendChild(el('option',{value:v,text:v}))); return s; }

function buildRow(i, prefill=null){
  const r=el('div',{class:'row'});
  r.appendChild(el('div',{class:'cell',text:String(i)}));
  const tipo=el('input',{type:'text'}); r.appendChild(el('div',{class:'cell'},tipo));
  const ubic=el('input',{type:'text'}); r.appendChild(el('div',{class:'cell'},ubic));
  const qs=[];
  for(let k=0;k<9;k++){ const s=selectSiNoNa(); qs.push(s); r.appendChild(el('div',{class:'cell'},s)); }
  const obs=el('textarea',{rows:'2'}); r.appendChild(el('div',{class:'cell'},obs));
  if(prefill){
    tipo.value=prefill.tipo||''; ubic.value=prefill.ubic||'';
    qs.forEach((s,idx)=> s.value = prefill['q'+(idx+1)]||'');
    obs.value=prefill.obs||'';
  }
  return r;
}

function resetRows(data=null){
  const area=document.getElementById('tableArea');
  area.innerHTML='';
  for(let i=1;i<=20;i++){
    const pre = data && data.rows && data.rows[i-1] ? data.rows[i-1] : null;
    area.appendChild(buildRow(i, pre));
  }
}

function collectData(){
  const rows=[];
  const area=document.getElementById('tableArea');
  const rs=area.querySelectorAll('.row');
  rs.forEach((r)=>{
    const cells=r.querySelectorAll('.cell');
    const tipo=cells[1].querySelector('input').value;
    const ubic=cells[2].querySelector('input').value;
    const qs=[];
    for(let k=0;k<9;k++){ qs.push(cells[3+k].querySelector('select').value); }
    const obs=cells[12].querySelector('textarea').value;
    const row={tipo,ubic}; qs.forEach((v,idx)=> row['q'+(idx+1)]=v); row.obs=obs; rows.push(row);
  });
  return {
    estacion: document.getElementById('estacion').value,
    inspector: document.getElementById('inspector').value,
    fecha: document.getElementById('fecha').value,
    firma: document.getElementById('firma').value,
    rows
  };
}

function saveLocal(){ localStorage.setItem('fs033:data', JSON.stringify(collectData())); alert('Guardado local.'); }
function loadLocal(){ const raw=localStorage.getItem('fs033:data'); if(!raw) return alert('No hay datos guardados.'); const data=JSON.parse(raw);
  document.getElementById('estacion').value=data.estacion||'';
  document.getElementById('inspector').value=data.inspector||'';
  document.getElementById('fecha').value=data.fecha||'';
  document.getElementById('firma').value=data.firma||'';
  resetRows(data);
}

async function exportPDF(){
  const sheet=document.getElementById('sheet');
  if (typeof html2pdf === 'undefined') { window.print(); return; }
  const opt = {
    margin: 6,
    filename: `FS033_${(new Date().toISOString().slice(0,10))}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1, useCORS: true, allowTaint: true, scrollY: 0, windowWidth: sheet.offsetWidth },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'landscape' },
    pagebreak: { mode: ['css','legacy'] }
  };
  await html2pdf().from(sheet).set(opt).save();
}

window.addEventListener('load', ()=>{
  document.getElementById('fecha').value = new Date().toISOString().slice(0,10);
  resetRows();
});
