// Core application logic moved from index.html
const APP = {
    notes: [],
    goals: [],
    templates: { en: [], ar: [] },
    lang: localStorage.getItem('lang') || 'en',
    dark: localStorage.getItem('dark') === 'true',
    color: 'blue',
    currentNote: null,
    currentTemplate: null
};

const T = {
    en: { appTitle:"HeliumNotes",t1:"📝 Notes",t2:"🌿 Garden",t3:"🎯 Goals",t4:"📊 Analytics",t5:"⚙️ Settings", h1:"📝 Create Note",l1:"Template",l2:"Notebook",l3:"Title",l4:"Content",l5:"Color",b1:"✨ Add Note", h2:"Your Notes",h3:"📋 Templates",p1:"Select a template to structure your note",h4:"🌿 Your Garden", p2:"Each note grows a plant in your garden",h5:"🎯 Goals",b2:"Add Goal",h6:"📊 Analytics", sl1:"Total",sl2:"Done",sl3:"Today",sl4:"Plants",h7:"⚙️ Settings",h8:"Import/Export", b3:"📥 Export Notes",b4:"🗑️ Clear All",b5:"📄 Export PDF" },
    ar: { appTitle:"ملاحظات هيليوم",t1:"📝 الملاحظات",t2:"🌿 الحديقة",t3:"🎯 الأهداف",t4:"📊 التحليلات",t5:"⚙️ الإعدادات", h1:"📝 إنشاء ملاحظة",l1:"القالب",l2:"دفتر الملاحظات",l3:"العنوان",l4:"المحتوى",l5:"اللون",b1:"✨ إضافة ملاحظة", h2:"ملاحظاتك",h3:"📋 القوالب",p1:"اختر قالباً لتنظيم ملاحظتك",h4:"🌿 حديقتك", p2:"كل ملاحظة تنمو نبتة في حديقتك",h5:"🎯 الأهداف",b2:"إضافة هدف",h6:"📊 التحليلات", sl1:"الإجمالي",sl2:"المكتملة",sl3:"اليوم",sl4:"النباتات",h7:"⚙️ الإعدادات",h8:"استيراد/تصدير", b3:"📥 تصدير الملاحظات",b4:"🗑️ مسح الكل",b5:"📄 تصدير PDF" }
};

const PLANTS = {blue:'🌸',green:'🌱',amber:'🌻',red:'🌹',purple:'🌷',pink:'💐'};

async function init(){
    await loadTemplatesFromFiles();
    loadData();
    applyLang();
    if(APP.dark){ document.body.classList.add('dark-mode'); document.getElementById('themeBtn').textContent = '☀️'; }
    renderTemplates(); renderNotes(); renderGarden(); renderGoals(); updateStats();
}

function loadData(){ APP.notes = JSON.parse(localStorage.getItem('notes') || '[]'); APP.goals = JSON.parse(localStorage.getItem('goals') || '[]'); }
function saveData(){ localStorage.setItem('notes', JSON.stringify(APP.notes)); localStorage.setItem('goals', JSON.stringify(APP.goals)); }

function toggleLang(){ APP.lang = APP.lang === 'en' ? 'ar' : 'en'; localStorage.setItem('lang', APP.lang); applyLang(); renderTemplates(); }

function applyLang(){ const html = document.documentElement; html.setAttribute('lang', APP.lang); html.setAttribute('dir', APP.lang === 'ar' ? 'rtl' : 'ltr'); Object.keys(T[APP.lang]).forEach(k => { const el = document.getElementById(k); if(el) el.textContent = T[APP.lang][k]; }); }

function toggleTheme(){ APP.dark = !APP.dark; localStorage.setItem('dark', APP.dark); document.body.classList.toggle('dark-mode'); document.getElementById('themeBtn').textContent = APP.dark ? '☀️' : '🌙'; }

function switchTab(i){ document.querySelectorAll('.tab-btn').forEach((b,j) => { b.classList.toggle('active', i===j); }); document.querySelectorAll('.tab-content').forEach((c,j) => { c.classList.toggle('active', i===j); }); }

function selectColor(btn){ document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); APP.color = btn.dataset.color; }

function renderTemplates(){ const sel = document.getElementById('template'); const grid = document.getElementById('templateGrid'); const temps = APP.templates[APP.lang] || [];
    sel.innerHTML = `<option value="">${APP.lang==='en'?'Choose Template':'اختر قالباً'}</option>` + temps.map(t => `<option value="${t.id}">${t.emoji} ${t.name}</option>`).join('');
    grid.innerHTML = temps.map(t => `
        <div style="padding:12px;border:2px solid var(--border);border-radius:8px;cursor:pointer;text-align:center" onclick="document.getElementById('template').value='${t.id}';loadTemplate()">
            <div style="font-size:24px">${t.emoji}</div>
            <div style="font-size:13px;font-weight:600;margin-top:5px">${t.name}</div>
        </div>
    `).join('');
    renderInspiration();
}

function renderInspiration(){ const sel = document.getElementById('template'); const insp = document.getElementById('templateInspiration'); if(!insp) return; const id = sel.value; if(!id){ insp.innerHTML = `<div class="template-inspiration"><h4>Template Inspiration</h4><p>Select a template to see short story prompts that inspire your writing.</p></div>`; return; } const temps = APP.templates[APP.lang] || []; const t = temps.find(x => x.id===id); if(!t){ insp.innerHTML=''; return; } const html = [`<div class="template-inspiration"><h4>${t.emoji} ${t.name} — Writing Prompts</h4>`].concat((t.stories||[]).map(s=>`<p>• ${s}</p>`)).join('') + `</div>`; insp.innerHTML = html; }

function loadTemplate(){ const id = document.getElementById('template').value; const container = document.getElementById('templateFields'); const inspSelect = document.getElementById('templateInspiration'); if(!id){ container.innerHTML = ''; APP.currentTemplate = null; renderInspiration(); return; } const temp = APP.templates[APP.lang].find(t => t.id === id); APP.currentTemplate = temp; container.innerHTML = temp.fields.map((f,i) => `
        <div class="template-field">
            <label style="color:var(--accent);font-weight:600;margin-bottom:5px">${f.label}</label>
            ${f.type==='textarea' ? `<textarea id="tf${i}" rows="3"></textarea>` : `<input type="text" id="tf${i}">`}
        </div>
    `).join(''); renderInspiration(); }

function addNote(){ const title = document.getElementById('noteTitle').value.trim(); if(!title){ notify(APP.lang==='en'?'Please enter a title':'الرجاء إدخال عنوان'); return; }
    let tData = {}; if(APP.currentTemplate){ APP.currentTemplate.fields.forEach((f,i)=>{ const el = document.getElementById(`tf${i}`); if(el && el.value) tData[f.label]=el.value; }); }
    const note = { id:Date.now(), title, content:document.getElementById('noteContent').value, notebook:document.getElementById('notebook').value, template:APP.currentTemplate?.name||'', templateData:tData, color:APP.color, done:false, date:new Date().toLocaleDateString(), timestamp:Date.now() };
    APP.notes.unshift(note); saveData(); clearForm(); renderNotes(); renderGarden(); updateStats(); notify(APP.lang==='en'?'✅ Note added!':'✅ تمت الإضافة!'); }

function clearForm(){ document.getElementById('noteTitle').value=''; document.getElementById('noteContent').value=''; document.getElementById('notebook').value=''; document.getElementById('template').value=''; document.getElementById('templateFields').innerHTML=''; APP.currentTemplate=null; renderInspiration(); }

function renderNotes(){ const list = document.getElementById('notesList'); const search = (document.getElementById('searchNotes').value||'').toLowerCase(); const filtered = APP.notes.filter(n => n.title.toLowerCase().includes(search) || (n.content||'').toLowerCase().includes(search)); if(filtered.length===0){ list.innerHTML = `<div style="text-align:center;color:var(--text-light);padding:30px">${APP.lang==='en'?'No notes yet':'لا توجد ملاحظات'}</div>`; return; } list.innerHTML = filtered.map(n=>`
        <div class="note-item ${n.done?'completed':''}">
            <div class="note-info" onclick="viewNote(${n.id})">
                <div class="note-title">${esc(n.title)}</div>
                <div class="note-meta">${n.notebook||''} • ${n.date}</div>
            </div>
            <div class="note-actions">
                <button class="btn-icon" onclick="toggleDone(${n.id})">${n.done?'✅':'○'}</button>
                <button class="btn-icon" onclick="deleteNote(${n.id})">🗑️</button>
            </div>
        </div>
    `).join(''); }

function viewNote(id){ const note = APP.notes.find(n=>n.id===id); if(!note) return; APP.currentNote = note; let html = `<h2 style="color:var(--primary);margin-bottom:10px">${esc(note.title)}</h2><p style="font-size:12px;color:var(--text-light);margin-bottom:15px">${note.date} • ${note.notebook||''}</p>`; if(note.templateData && Object.keys(note.templateData).length>0){ html += '<div style="background:var(--bg-light);padding:15px;border-radius:8px;margin-bottom:15px">'; Object.entries(note.templateData).forEach(([k,v])=>{ if(v) html += `<div style="margin-bottom:10px"><strong style="color:var(--accent)">${esc(k)}:</strong><p style="margin-top:5px">${esc(v)}</p></div>`; }); html += '</div>'; } if(note.content){ html += `<div style="background:var(--bg-light);padding:15px;border-radius:8px"><strong>${APP.lang==='en'?'Content':'المحتوى'}:</strong><p style="margin-top:8px;white-space:pre-wrap">${esc(note.content)}</p></div>`; } document.getElementById('modalContent').innerHTML = html; document.getElementById('modal').classList.add('active'); }
function closeModal(){ document.getElementById('modal').classList.remove('active'); APP.currentNote=null; }
function toggleDone(id){ const note = APP.notes.find(n=>n.id===id); if(note){ note.done=!note.done; saveData(); renderNotes(); updateStats(); } }
function deleteNote(id){ if(confirm(APP.lang==='en'?'Delete this note?':'حذف هذه الملاحظة؟')){ APP.notes = APP.notes.filter(n=>n.id!==id); saveData(); renderNotes(); renderGarden(); updateStats(); } }
function renderGarden(){ const garden = document.getElementById('garden'); if(APP.notes.length===0){ garden.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-light)">${APP.lang==='en'?'🌱 No plants yet':'🌱 لا توجد نباتات'}</div>`; return; } garden.innerHTML = APP.notes.map(n=>`
        <div class="plant">
            <div class="plant-visual">${PLANTS[n.color]||'🌱'}</div>
            <div class="plant-label">${esc(n.title.substring(0,10))}</div>
        </div>
    `).join(''); }
function addGoal(){ const title=document.getElementById('goalTitle').value.trim(); const target=parseInt(document.getElementById('goalTarget').value)||1; const period=document.getElementById('goalPeriod').value; if(!title){ notify(APP.lang==='en'?'Enter goal title':'أدخل عنوان الهدف'); return; } APP.goals.push({ id:Date.now(), title, target, period, current:0, date:new Date().toLocaleDateString() }); saveData(); document.getElementById('goalTitle').value=''; renderGoals(); notify(APP.lang==='en'?'✅ Goal added!':'✅ تم إضافة الهدف!'); }
function renderGoals(){ const list=document.getElementById('goalsList'); if(APP.goals.length===0){ list.innerHTML=`<div style="text-align:center;color:var(--text-light);padding:30px">${APP.lang==='en'?'No goals yet':'لا توجد أهداف'}</div>`; return; } list.innerHTML = APP.goals.map(g=>{ const pct = Math.min((g.current/g.target)*100,100); return `
        <div style="background:var(--bg-light);padding:15px;border-radius:8px;margin-bottom:12px;border-left:4px solid var(--accent)">
            <div style="font-weight:600;margin-bottom:5px">${esc(g.title)}</div>
            <div style="font-size:12px;color:var(--text-light);margin-bottom:10px">${g.current}/${g.target} ${g.period}</div>
            <div style="width:100%;height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:10px">
                <div style="height:100%;background:linear-gradient(90deg,var(--primary),var(--accent));width:${pct}%;transition:width 0.3s"></div>
            </div>
            <button class="btn btn-small btn-secondary" onclick="incGoal(${g.id})">➕</button>
            <button class="btn btn-small btn-danger" onclick="delGoal(${g.id})">🗑️</button>
        </div>
    `; }).join(''); }
function incGoal(id){ const goal = APP.goals.find(g=>g.id===id); if(goal && goal.current<goal.target){ goal.current++; saveData(); renderGoals(); } }
function delGoal(id){ if(confirm(APP.lang==='en'?'Delete goal?':'حذف الهدف؟')){ APP.goals = APP.goals.filter(g=>g.id!==id); saveData(); renderGoals(); } }
function updateStats(){ document.getElementById('statTotal').textContent = APP.notes.length; document.getElementById('statDone').textContent = APP.notes.filter(n=>n.done).length; const today = new Date().toLocaleDateString(); document.getElementById('statToday').textContent = APP.notes.filter(n=>n.date===today).length; document.getElementById('statPlants').textContent = APP.notes.length; }
function exportData(){ const data = JSON.stringify({notes:APP.notes, goals:APP.goals}, null, 2); const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `helium-notes-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); notify(APP.lang==='en'?'✅ Exported!':'✅ تم التصدير!'); }
function importData(e){ const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (ev)=>{ try{ const data = JSON.parse(ev.target.result); if(data.notes && Array.isArray(data.notes)){ if(confirm(APP.lang==='en'?`Import ${data.notes.length} notes?`:`استيراد ${data.notes.length} ملاحظة؟`)){ APP.notes = [...APP.notes, ...data.notes]; if(data.goals) APP.goals = [...APP.goals, ...data.goals]; saveData(); renderNotes(); renderGarden(); renderGoals(); updateStats(); notify(APP.lang==='en'?'✅ Imported!':'✅ تم الاستيراد!'); } } }catch(err){ alert(APP.lang==='en'?'Invalid file':'ملف غير صالح'); } }; reader.readAsText(file); e.target.value=''; }
function clearData(){ if(confirm(APP.lang==='en'?'Delete ALL data?':'حذف كل البيانات؟')){ if(confirm(APP.lang==='en'?'Are you sure?':'هل أنت متأكد؟')){ APP.notes=[]; APP.goals=[]; saveData(); renderNotes(); renderGarden(); renderGoals(); updateStats(); notify(APP.lang==='en'?'✅ Cleared!':'✅ تم المسح!'); } } }
function exportPDF(){ if(!APP.currentNote) return; const {jsPDF} = window.jspdf; const doc = new jsPDF(); const note = APP.currentNote; let y=20; doc.setFontSize(18); doc.setTextColor(16,185,129); doc.text(note.title,20,y); y+=10; doc.setFontSize(10); doc.setTextColor(107,114,128); doc.text(`${note.date} ${note.notebook?'• '+note.notebook:''}`,20,y); y+=15; doc.setFontSize(12); doc.setTextColor(31,41,55); if(note.templateData && Object.keys(note.templateData).length>0){ Object.entries(note.templateData).forEach(([k,v])=>{ if(v){ doc.setFont(undefined,'bold'); doc.text(k+':',20,y); y+=7; doc.setFont(undefined,'normal'); const lines = doc.splitTextToSize(v,170); doc.text(lines,20,y); y += lines.length*7 + 5; if(y>270){ doc.addPage(); y=20; } } }); } if(note.content){ doc.setFont(undefined,'bold'); doc.text('Content:',20,y); y+=7; doc.setFont(undefined,'normal'); const lines = doc.splitTextToSize(note.content,170); lines.forEach(line=>{ if(y>270){ doc.addPage(); y=20; } doc.text(line,20,y); y+=7; }); } doc.save(`${note.title.replace(/[^a-z0-9]/gi,'_')}.pdf`); notify(APP.lang==='en'?'✅ PDF exported!':'✅ تم تصدير PDF!'); }
function notify(msg){ const n=document.createElement('div'); n.className='notification'; n.textContent=msg; document.body.appendChild(n); setTimeout(()=>n.remove(),3000); }
function esc(str){ const div=document.createElement('div'); div.textContent=str; return div.innerHTML; }

// Load templates by fetching files from templates/index.json and each template file
async function loadTemplatesFromFiles(){ try{ const idxResp = await fetch('templates/index.json'); if(!idxResp.ok) throw new Error('templates index not found'); const idx = await idxResp.json(); const files = idx.templates || [];
        const templates = [];
        for(const f of files){ try{ const resp = await fetch(`templates/${f}`); if(!resp.ok) continue; const data = await resp.json(); templates.push(data); }catch(e){ console.warn('failed to load',f,e); } }
        // Build language-specific arrays (we'll duplicate english names into ar if not present)
        APP.templates.en = templates.map(t=>t);
        // Create a deep copy for the Arabic templates to prevent data corruption.
        // A shallow copy (Object.assign) would cause both languages to share the same 'fields' array reference.
        APP.templates.ar = JSON.parse(JSON.stringify(templates));
        // A real app would provide fully translated JSON files. For now, we just ensure they are separate.
        // Example of how you might translate if the data was available:
        // APP.templates.ar.forEach(t => { t.name = t.name_ar || t.name; t.fields.forEach(f => f.label = f.label_ar || f.label); });
    }catch(err){ console.warn('Could not load templates folder, falling back to built-in templates', err);
        // fallback to original inline set
        APP.templates = {
            en: [ {id:'brain',name:'Brain Dump',emoji:'🧠',fields:[{label:'Thoughts',type:'textarea'}]}, {id:'problem',name:'Problem Solver',emoji:'💡',fields:[{label:'Problem',type:'text'},{label:'Solutions',type:'textarea'}]}, {id:'goal',name:'Goal Tracker',emoji:'🎯',fields:[{label:'Goal',type:'text'},{label:'Steps',type:'textarea'}]}, {id:'study',name:'Study Notes',emoji:'📚',fields:[{label:'Topic',type:'text'},{label:'Key Points',type:'textarea'}]} ],
            ar: [ {id:'brain',name:'تفريغ الأفكار',emoji:'🧠',fields:[{label:'الأفكار',type:'textarea'}]}, {id:'problem',name:'حل المشاكل',emoji:'💡',fields:[{label:'المشكلة',type:'text'},{label:'الحلول',type:'textarea'}]}, {id:'goal',name:'متتبع الأهداف',emoji:'🎯',fields:[{label:'الهدف',type:'text'},{label:'الخطوات',type:'textarea'}]}, {id:'study',name:'ملاحظات الدراسة',emoji:'📚',fields:[{label:'الموضوع',type:'text'},{label:'النقاط الأساسية',type:'textarea'}]} ]
        };
    } }

// Initialize the app
init();
