
const QUESTIONS = [
  "1) ¿Las herramientas manuales (alicates, martillos, punzones,palas, picotas, machetes,etc) tienen sus agarradores/ sujetadores en buen estado de funcionamiento?",
  "2) ¿Las puntas de las herramientas (mazo, filos, etc) no presentan superficies que podrían desprenderse o romperse?",
  "3) ¿Las herramientas manuales para trabajos con electricidad presentan sus aislamientos/ coberturas libre de fallas o cortaduras (están integras)?",
  "4) ¿Las herramientas eléctricas tiene sus cables y conexiones sin roturas o fallas evidentes?",
  "5) ¿Todo equipo y/o herramienta que necesita un cobertor, funda esta siendo utilizada adecuadamente? (machetes, sierras, cuchillos,etc)",
  "6) ¿Toda herramienta/ equipo rotativo dispone de su respectiva guarda de protección? (amoladoras, sierra circular, mezcladora,etc)",
  "7) ¿Las herramientas manuales (llaves de ojo, boca y superficie) tienen sus puntos de contacto libres de roturas, desgaste o falla?",
  "8) ¿Las herramientas/ equipos están libres de suciedad, grasa o material que pueda dañarlas?",
  "9) ¿Las herramientas están almacenadas/ ubicadas en lugares accesibles y libre de cualquier afectación o daño?"
];

function el(tag, opts = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(opts).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach(c => c && e.appendChild(c));
  return e;
}

function selectSiNoNa() {
  const s = el('select');
  ['—','Sí','No','N.A.'].forEach(v => s.appendChild(el('option', { value:v, text:v })));
  return s;
}

function addRow(prefill = null) {
  const tbody = document.getElementById('tbody');
  const idx = tbody.children.length + 1;
  const tr = el('tr');

  const tdIdx = el('td', { text: idx.toString() });
  const tdTipo = el('td'); const inTipo = el('input', { type:'text', placeholder:'Ej.: Amoladora' }); tdTipo.appendChild(inTipo);
  const tdUbic = el('td'); const inUbic = el('input', { type:'text', placeholder:'Ej.: Taller / Patio' }); tdUbic.appendChild(inUbic);

  tr.appendChild(tdIdx);
  tr.appendChild(tdTipo);
  tr.appendChild(tdUbic);

  const selects = [];
  for (let i=0;i<QUESTIONS.length;i++) {
    const td = el('td');
    const s = selectSiNoNa();
    td.appendChild(s);
    selects.push(s);
    tr.appendChild(td);
  }

  const tdObs = el('td'); const inObs = el('textarea', { rows:'2', placeholder:'Observaciones' }); tdObs.appendChild(inObs);
  tr.appendChild(tdObs);

  tbody.appendChild(tr);

  if (prefill) {
    inTipo.value = prefill.tipo || '';
    inUbic.value = prefill.ubic || '';
    selects.forEach((s, i) => s.value = (prefill['q'+(i+1)] || '—'));
    inObs.value = prefill.obs || '';
  }
}

function clearRows(){
  document.getElementById('tbody').innerHTML = '';
}

function resetForm(){
  document.getElementById('estacion').value = '';
  document.getElementById('inspector').value = '';
  document.getElementById('fecha').value = '';
  document.getElementById('firma').value = '';
  clearRows();
}

function collectData(){
  const rows = [];
  const tbody = document.getElementById('tbody');
  for (const tr of tbody.children) {
    const tds = tr.querySelectorAll('td');
    const tipo = tds[1].querySelector('input').value;
    const ubic = tds[2].querySelector('input').value;
    const qs = Array.from(tds).slice(3, 3+QUESTIONS.length).map(td => td.querySelector('select').value);
    const obs = tds[3+QUESTIONS.length].querySelector('textarea').value;
    const row = { tipo, ubic };
    qs.forEach((v,i)=> row['q'+(i+1)] = v);
    row.obs = obs;
    rows.push(row);
  }
  return {
    estacion: document.getElementById('estacion').value,
    inspector: document.getElementById('inspector').value,
    fecha: document.getElementById('fecha').value,
    firma: document.getElementById('firma').value,
    rows
  };
}

function toHTMLForPDF(data){
  const container = el('div', { id:'pdf-root', style:'padding:16px;font-family:Arial, sans-serif' });
  container.appendChild(el('h2', { text:'FS.033 – Inspección de Herramientas', style:'margin:0 0 8px 0' }));
  container.appendChild(el('div', { text:'INSPECCIÓN DE HERRAMIENTAS PORTÁTILES Y AUTOMÁTICAS (Manuales y eléctricas)'.slice(0,180) }));
  container.appendChild(el('hr'));

  const meta = el('table', { style:'width:100%;border-collapse:collapse;margin-bottom:10px;font-size:12px' });
  const mtbody = el('tbody');
  const mrow1 = el('tr', {}, [
    el('td', { style:'border:1px solid #999;padding:6px' , text:'Estación/Campamento/Sitio: '+(data.estacion||'') }),
    el('td', { style:'border:1px solid #999;padding:6px' , text:'Inspector: '+(data.inspector||'') }),
    el('td', { style:'border:1px solid #999;padding:6px' , text:'Fecha: '+(data.fecha||'') }),
  ]);
  mtbody.appendChild(mrow1); meta.appendChild(mtbody); container.appendChild(meta);

  const table = el('table', { style:'width:100%;border-collapse:collapse;font-size:11px' });
  const thead = el('thead');
  const hr1 = el('tr');
  const headers = ['Ítem','Tipo/Clase de herramienta','Ubicación/Uso', ...QUESTIONS.map((q,i)=>'Q'+(i+1)), 'Observaciones'];
  headers.forEach(h=> hr1.appendChild(el('th', { style:'border:1px solid #999;background:#eee;padding:4px;text-align:left' , text:h })));
  thead.appendChild(hr1); table.appendChild(thead);

  const tbody = el('tbody');
  (data.rows || []).forEach((row, i) => {
    const tr = el('tr');
    const cells = [
      (i+1).toString(),
      row.tipo || '',
      row.ubic || '',
      ...Array.from({length:QUESTIONS.length}, (_,k)=> row['q'+(k+1)] || '—'),
      row.obs || ''
    ];
    cells.forEach(val => tr.appendChild(el('td', { style:'border:1px solid #999;padding:4px;vertical-align:top' , text: val })));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  container.appendChild(el('div', { style:'margin-top:12px', text:'Firma V°B° Inspector: ' + (data.firma||'') }));
  return container;
}

async function exportPDF(){
  const data = collectData();
  const pdfRoot = toHTMLForPDF(data);
  document.body.appendChild(pdfRoot); // temporal

  if (typeof html2pdf === 'undefined') {
    alert('Para exportar a PDF necesita internet (cargar html2pdf.js).');
    pdfRoot.remove();
    return;
  }

  const archivo = `FS033_{(new Date().toISOString().slice(0,10))}.pdf`;
  const opt = {
    margin:       8,
    filename:     archivo,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  await html2pdf().from(pdfRoot).set(opt).save();
  pdfRoot.remove();
}

async function sharePDF(){
  const data = collectData();
  const pdfRoot = toHTMLForPDF(data);
  document.body.appendChild(pdfRoot);

  if (typeof html2pdf === 'undefined') {
    alert('Para compartir PDF necesita internet (cargar html2pdf.js).');
    pdfRoot.remove();
    return;
  }

  const opt = {
    margin: 8,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  const worker = html2pdf().from(pdfRoot).set(opt);
  const pdfBlob = await new Promise(resolve => worker.outputPdf('blob').then(resolve));
  pdfRoot.remove();

  if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], 'FS033.pdf', { type: 'application/pdf' })] })) {
    const file = new File([pdfBlob], 'FS033.pdf', { type: 'application/pdf' });
    await navigator.share({
      title: 'FS.033 – Inspección de Herramientas',
      text: 'Reporte generado desde el formulario móvil.',
      files: [file]
    });
  } else {
    // Fallback: descarga directa
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url; a.download = 'FS033.pdf'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    alert('El PDF se descargó. Compártalo desde su gestor de archivos.');
  }
}

function saveLocal(){
  const data = collectData();
  localStorage.setItem('fs033:data', JSON.stringify(data));
  alert('Guardado localmente.');
}

function loadLocal(){
  const raw = localStorage.getItem('fs033:data');
  if (!raw) return alert('No hay datos guardados.');
  const data = JSON.parse(raw);
  document.getElementById('estacion').value = data.estacion || '';
  document.getElementById('inspector').value = data.inspector || '';
  document.getElementById('fecha').value = data.fecha || '';
  document.getElementById('firma').value = data.firma || '';
  clearRows();
  (data.rows||[]).forEach(r => addRow(r));
}

window.addEventListener('load', () => {
  // Prefijar fecha de hoy y una fila
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('fecha').value = today;
  if (document.getElementById('tbody').children.length === 0) addRow();
});
