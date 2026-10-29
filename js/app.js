/* ===== i18n ===== */
const I18N = {
  fr: {
    search: "Rechercher une denrée…",
    all: "Toutes", ftlOnly: "FTL uniquement", highScore: "Score élevé",
    loading: "Chargement…", ready: "Prêt", error: "Erreur",
    selectCommodity: "Sélectionnez une denrée",
    selectHint: "Choisissez un produit dans la liste à gauche (ou recherchez) pour afficher les paires danger et les scores de risque.",
    tryDemo: "Essayer la démo (Tomates)",
    hazardPairs: "Paires danger (C1…C7 → score)",
    filterHazards: "Filtrer les dangers…",
    allScores: "Tous les scores",
    resetSort: "Réinitialiser tri",
    maxScore: "Score max",
    top10: "Top 10 paires",
    project: "Projet", export: "Export", log: "Journal",
    name: "Nom", ref: "Réf./Client", notes: "Notes", attachments: "Pièces jointes",
    save: "💾 Enregistrer (.RRM)", load: "📂 Charger .RRM",
    exportCSV: "Exporter CSV (EN)", exportJSON: "Exporter JSON", exportPrint: "Imprimer / PDF",
    clearLog: "Effacer le journal",
    noData: "Aucune donnée",
    hazards: "dangers",
    commodity: "Denrée", category: "Catégorie", onFTL: "Sur la FTL",
    help: "Aide"
  },
  en: {
    search: "Search a commodity…",
    all: "All", ftlOnly: "FTL only", highScore: "High score",
    loading: "Loading…", ready: "Ready", error: "Error",
    selectCommodity: "Select a commodity",
    selectHint: "Pick a product from the list on the left (or search) to display hazard pairs and C1–C7 scores.",
    tryDemo: "Try demo (Tomatoes)",
    hazardPairs: "Hazard pairs (C1…C7 → score)",
    filterHazards: "Filter hazards…",
    allScores: "All scores",
    resetSort: "Reset sort",
    maxScore: "Max score",
    top10: "Top 10 pairs",
    project: "Project", export: "Export", log: "Log",
    name: "Name", ref: "Ref./Client", notes: "Notes", attachments: "Attachments",
    save: "💾 Save (.RRM)", load: "📂 Open .RRM",
    exportCSV: "Export CSV (EN)", exportJSON: "Export JSON", exportPrint: "Print / PDF",
    clearLog: "Clear log",
    noData: "No data",
    hazards: "hazards",
    commodity: "Commodity", category: "Category", onFTL: "On FTL",
    help: "Help"
  }
};

/* ===== Sample data (offline fallback) ===== */
const SAMPLE = {
  twoA: [
    { commodity:"Tomatoes", code:"030105", risk_score:0.58, risk_level:"Medium-High", risk_factors:{contamination_frequency:0.30,severity:0.75,traceability_difficulty:0.60,consumer_exposure:0.70,economic_impact:0.55} },
    { commodity:"Leafy greens", code:"030101", risk_score:0.66, risk_level:"High", risk_factors:{contamination_frequency:0.40,severity:0.80,traceability_difficulty:0.70,consumer_exposure:0.75,economic_impact:0.65} },
    { commodity:"Finfish, histamine producing species", code:"020101", risk_score:0.58, risk_level:"Medium-High", risk_factors:{contamination_frequency:0.25,severity:0.70,traceability_difficulty:0.75,consumer_exposure:0.55,economic_impact:0.65} },
    { commodity:"RTE deli salads", code:"040101", risk_score:0.65, risk_level:"High", risk_factors:{contamination_frequency:0.40,severity:0.80,traceability_difficulty:0.70,consumer_exposure:0.70,economic_impact:0.65} },
    { commodity:"Cheese, made from pasteurized milk, fresh soft or soft unripened", code:"010101", risk_score:0.50, risk_level:"Medium", risk_factors:{contamination_frequency:0.15,severity:0.75,traceability_difficulty:0.60,consumer_exposure:0.45,economic_impact:0.55} }
  ],
  oneA: [
    { commodity:"Tomatoes", code:"030105" }, { commodity:"Leafy greens", code:"030101" },
    { commodity:"Finfish, histamine producing species", code:"020101" },
    { commodity:"RTE deli salads", code:"040101" }
  ],
  pairs: {
    "Tomatoes": { commodity:"Tomatoes", code:"080105", hazard_pairs:[
      {hazard:"Salmonella spp.", severity:0.8, contamination_frequency:0.10, risk_score:0.52, risk_level:"Medium-High"},
      {hazard:"E. coli O157:H7", severity:0.85, contamination_frequency:0.08, risk_score:0.54, risk_level:"Medium-High"},
      {hazard:"Listeria monocytogenes", severity:0.75, contamination_frequency:0.06, risk_score:0.47, risk_level:"Medium"},
      {hazard:"Norovirus", severity:0.7, contamination_frequency:0.12, risk_score:0.47, risk_level:"Medium"}
    ]},
    "Leafy greens": { commodity:"Leafy greens", code:"080101", hazard_pairs:[
      {hazard:"E. coli O157:H7", severity:0.85, contamination_frequency:0.12, risk_score:0.54, risk_level:"Medium-High"},
      {hazard:"Salmonella spp.", severity:0.8, contamination_frequency:0.10, risk_score:0.52, risk_level:"Medium-High"}
    ]}
  }
};

/* ===== State ===== */
const state = {
  lang: "fr",
  theme: "dark",
  data: { twoA: [], oneA: [], twoAMap: {}, oneASet: new Set(), items: [], pairsCache: {} },
  current: { code: null, name: null, item: null, hazards: [] },
  sort: { key: "risk_score", dir: -1 },
  filter: "all",
  hazardFilter: "",
  scoreMin: 0,
  log: []
};

/* ===== Helpers ===== */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function t(k){ return (I18N[state.lang] && I18N[state.lang][k]) || k; }
function toast(msg, type="ok"){ const el=$("#toast"); el.textContent=msg; el.className="toast show "+type; clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("show"),2600); }
function log(msg){ const ts=new Date().toLocaleTimeString(state.lang==="fr"?"fr-FR":"en-US"); const line=`[${ts}] ${msg}`; state.log.push({ts,msg}); if(state.log.length>100) state.log=state.log.slice(-50); const d=$("#log"); d.textContent=(d.textContent?d.textContent+"\n":"")+line; d.scrollTop=d.scrollHeight; }
function riskColor(v){ if(v>=80) return "var(--risk-high)"; if(v>=50) return "var(--risk-med)"; return "var(--risk-low)"; }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

/* ===== Data loading ===== */
const BASE = "https://raw.githubusercontent.com/Visitune/FDA_RRMT_DATA/main/";
async function fetchJSON(path){
  const r = await fetch(BASE+path, {cache:"no-store"});
  if(!r.ok) throw new Error("HTTP "+r.status);
  return r.json();
}
async function loadAll(){
  $("#statusBadge").className="pill warn"; $("#statusBadge").textContent=t("loading");
  try {
    const [twoA, oneA, manifest] = await Promise.all([
      fetchJSON("en/commodities_table_2A.json"),
      fetchJSON("en/ftl_table_1A.json"),
      fetchJSON("manifest.json")
    ]);
    state.data.twoA = twoA.data || [];
    state.data.oneA = oneA.data || [];
    state.data.twoAMap = {};
    for(const c of state.data.twoA) state.data.twoAMap[normName(c.commodity)] = c;
    state.data.oneASet = new Set(state.data.oneA.map(c=>normName(c.commodity)));
    // load pairs files from manifest
    const paths = (manifest.sources||[]).map(s=>s.path).filter(p=>/pairs_table_2B\//.test(p) && /\.json$/.test(p));
    const items = [];
    for(const p of paths){
      try {
        const j = await fetchJSON(p);
        const name = j.commodity;
        const two = state.data.twoAMap[normName(name)] || {};
        items.push({
          path: p,
          name: name,
          code: j.code || two.code,
          category: two.category || (state.data.oneA.find(c=>normName(c.commodity)===normName(name))||{}).category || "—",
          ftl: state.data.oneASet.has(normName(name)),
          risk_score: (two.risk_score!=null? two.risk_score : null),
          risk_level: two.risk_level || "—",
          hazards: (j.hazard_pairs||[]).map(hp=>({
            hazard: hp.hazard,
            severity: hp.severity,
            contam: hp.contamination_frequency,
            risk_score: hp.risk_score,
            risk_level: hp.risk_level
          }))
        });
        state.data.pairsCache[name] = items[items.length-1].hazards;
      } catch(e){ /* ignore */ }
    }
    state.data.items = items.sort((a,b)=>a.name.localeCompare(b.name));
    const n = items.length;
    $("#counts").textContent = `${n} denrées · ${state.data.twoA.length} profils 2A`;
    $("#statusBadge").className="pill ok"; $("#statusBadge").textContent=t("ready");
    log("Données FDA chargées ("+n+" denrées).");
  } catch(e){
    // fallback sample
    state.data.twoA = SAMPLE.twoA;
    state.data.oneA = SAMPLE.oneA;
    state.data.twoAMap = {};
    for(const c of state.data.twoA) state.data.twoAMap[normName(c.commodity)] = c;
    state.data.oneASet = new Set(state.data.oneA.map(c=>normName(c.commodity)));
    state.data.items = Object.keys(SAMPLE.pairs).map(name=>{
      const two = state.data.twoAMap[normName(name)]||{};
      return {
        path: null, name, code: two.code, category: two.category||"—",
        ftl: state.data.oneASet.has(normName(name)),
        risk_score: two.risk_score, risk_level: two.risk_level||"—",
        hazards: SAMPLE.pairs[name].hazard_pairs.map(hp=>({hazard:hp.hazard,severity:hp.severity,contam:hp.contamination_frequency,risk_score:hp.risk_score,risk_level:hp.risk_level}))
      };
    }).sort((a,b)=>a.name.localeCompare(b.name));
    for(const it of state.data.items) state.data.pairsCache[it.name]=it.hazards;
    $("#counts").textContent = `${state.data.items.length} denrées (mode démo)`;
    $("#statusBadge").className="pill warn"; $("#statusBadge").textContent="Mode démo";
    log("Mode démo activé (données FDA indisponibles).");
  }
  renderList();
}
function normName(s){ return String(s||"").toLowerCase().replace(/\s+/g," ").trim(); }

/* ===== List rendering ===== */
function renderList(){
  const q = ($("#q").value||"").toLowerCase();
  const list = $("#list");
  let filtered = (state.data.items||[]).filter(e => {
    if(q && !e.name.toLowerCase().includes(q) && !(e.category||"").toLowerCase().includes(q) && !(e.code||"").toLowerCase().includes(q)) return false;
    if(state.filter==="ftl" && !e.ftl) return false;
    if(state.filter==="high" && !(e.risk_score>=0.6)) return false;
    return true;
  });
  const groups = {};
  for(const e of filtered){ (groups[e.category||"Autre"] = groups[e.category||"Autre"]||[]).push(e); }
  list.innerHTML = "";
  if(filtered.length===0){ list.innerHTML = `<div class="empty">Aucun résultat</div>`; return; }
  for(const cat of Object.keys(groups).sort()){
    const g = document.createElement("div");
    const title = document.createElement("div"); title.className="group-title"; title.textContent = cat; g.appendChild(title);
    for(const e of groups[cat]){
      const item = document.createElement("div");
      item.className = "item" + (e.name===state.current.name?" selected":"");
      item.setAttribute("role","option");
      item.setAttribute("aria-selected", e.name===state.current.name);
      item.tabIndex = 0;
      const score = e.risk_score!=null ? Math.round(e.risk_score*100) : "—";
      item.innerHTML = `${e.ftl?'<span class="ftl-dot" title="FTL"></span>':''}<span style="flex:1">${esc(e.name)}</span><span class="code">${score}</span>`;
      item.addEventListener("click", ()=>selectCommodity(e.name));
      item.addEventListener("keydown", ev=>{ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); selectCommodity(e.name); } });
      g.appendChild(item);
    }
    list.appendChild(g);
  }
}

/* ===== Select commodity ===== */
async function selectCommodity(nameOrCode){
  const item = (state.data.items||[]).find(e=> e.name===nameOrCode || e.code===nameOrCode);
  if(!item) return;
  state.current.name = item.name;
  state.current.code = item.code;
  state.current.item = item;
  state.current.hazards = item.hazards || [];
  // show summary
  $("#summaryEmpty").classList.add("hidden");
  $("#summaryContent").classList.remove("hidden");
  $("#commodityName").textContent = item.name;
  $("#commodityMeta").textContent = `${item.category||"—"} · ${item.code||"—"}`;
  const badges = $("#commodityBadges");
  badges.innerHTML = "";
  if(item.ftl) badges.innerHTML += `<span class="pill ok">FTL</span>`;
  badges.innerHTML += `<span class="pill info">${esc(item.category||"—")}</span>`;
  if(item.risk_level && item.risk_level!=="—") badges.innerHTML += `<span class="pill muted">${esc(item.risk_level)}</span>`;
  const score = item.risk_score!=null ? Math.round(item.risk_score*100) : 0;
  $("#aggScore").textContent = score? score+"%" : "—";
  $("#aggScore").style.color = riskColor(score);
  renderPairs();
  renderChart();
  renderList();
  log(`Ouverture : ${item.name} (${item.code})`);
}

/* ===== Render pairs table ===== */
 function renderPairs(){
   const hazards = state.current.hazards || [];
   const filter = ($("#hazardFilter").value||"").toLowerCase();
   const min = state.scoreMin;
   let rows = hazards.map(h=>({...h})).filter(r=>{
     if(filter && !r.hazard.toLowerCase().includes(filter)) return false;
     const sc = r.risk_score!=null ? Math.round(r.risk_score*100) : 0;
     if(min && sc < min) return false;
     return true;
   });
   const {key,dir} = state.sort;
   rows.sort((a,b)=>{
     const va = key==="hazard"? a.hazard : (key==="severity"? (a.severity||0) : (key==="contam"? (a.contam||0) : (a.risk_score||0)));
     const vb = key==="hazard"? b.hazard : (key==="severity"? (b.severity||0) : (key==="contam"? (b.contam||0) : (b.risk_score||0)));
     if(typeof va==="string") return dir*va.localeCompare(vb);
     return dir*(va-vb);
   });
   const tbody = $("#pairsBody");
   tbody.innerHTML = "";
   if(rows.length===0){
     const tr=document.createElement("tr");
     tr.innerHTML=`<td colspan="5" style="text-align:center;padding:32px;color:var(--color-text-3)">Aucune donnée</td>`;
     tbody.appendChild(tr);
     $("#pairsCount").textContent = "0 danger";
     return;
   }
   $("#pairsCount").textContent = `${rows.length} danger${rows.length>1?"s":""}`;
   for(const r of rows){
     const sc = r.risk_score!=null ? Math.round(r.risk_score*100) : 0;
     const tr=document.createElement("tr");
     tr.innerHTML = `
       <th scope="row">${esc(r.hazard)}</th>
       <td class="crit">${r.severity!=null? r.severity.toFixed(2):"—"}</td>
       <td class="crit">${r.contam!=null? r.contam.toFixed(2):"—"}</td>
       <td>
         <div class="score-cell">
           <div class="score-bar"><span style="width:${sc}%;background:${riskColor(sc)}"></span></div>
           <span class="score-num" style="color:${riskColor(sc)}">${sc}%</span>
         </div>
       </td>
       <td class="crit">${esc(r.risk_level||"—")}</td>`;
     tbody.appendChild(tr);
   }
   $$("#pairsTable thead th").forEach(th=>{
     th.classList.remove("sorted");
     const ind = th.querySelector(".sort-ind");
     if(ind) ind.textContent="";
     if(th.dataset.key===key){ th.classList.add("sorted"); if(ind) ind.textContent = dir>0?"▲":"▼"; }
   });
 }

/* ===== Chart ===== */
function renderChart(){
  const canvas = $("#chart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio||1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width*dpr; canvas.height = rect.height*dpr;
  ctx.scale(dpr,dpr);
  const W = rect.width, H = rect.height;
  ctx.clearRect(0,0,W,H);
  const hazards = state.current.hazards || [];
  const rows = hazards.map(h=>({h:h.hazard, s: h.risk_score!=null? Math.round(h.risk_score*100):0})).sort((a,b)=>b.s-a.s).slice(0,10);
  if(rows.length===0) return;
  const max = Math.max(...rows.map(r=>r.s),1);
  const barH = Math.min(18, (H-20)/rows.length);
  const gap = 4;
  const labelW = 160;
  const chartW = W - labelW - 40;
  rows.forEach((r,i)=>{
    const y = 10 + i*(barH+gap);
    const w = (r.s/max)*chartW;
    // label
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-text-1").trim() || "#c5d1db";
    ctx.font = "12px system-ui";
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const lbl = r.h.length>22 ? r.h.slice(0,20)+"…" : r.h;
    ctx.fillText(lbl, labelW-6, y+barH/2);
    // bar
    ctx.fillStyle = riskColor(r.s);
    roundRect(ctx, labelW, y, w, barH, 4);
    ctx.fill();
    // value
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-text-0").trim() || "#eaf2f8";
    ctx.textAlign = "left";
    ctx.fillText(r.s, labelW+w+6, y+barH/2);
  });
}
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

/* ===== Export ===== */
function exportCSV(){
  if(!state.current.name){ toast("Sélectionnez d'abord une denrée","err"); return; }
  const item = state.current.item;
  const rows=[["Category","Commodity","Hazard","Severity","ContaminationFreq","RiskScore","RiskLevel"]];
  for(const h of (state.current.hazards||[])){
    rows.push([item.category,item.name,h.hazard,h.severity,h.contam,Math.round((h.risk_score||0)*100),h.risk_level]);
  }
  const csv=rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
  downloadBlob(new Blob([csv],{type:"text/csv;charset=utf-8"}), `${state.current.code||"export"}_EN.csv`);
  log("Export CSV généré."); toast("CSV exporté");
}
function exportJSON(){
  if(!state.current.name){ toast("Sélectionnez d'abord une denrée","err"); return; }
  const item = state.current.item;
  const data = { exportDate:new Date().toISOString(), commodity:{code:item.code,name:item.name,category:item.category,ftl:item.ftl,risk_score:item.risk_score,risk_level:item.risk_level}, pairs: (state.current.hazards||[]).map(h=>({hazard:h.hazard,severity:h.severity,contamination_frequency:h.contam,risk_score:h.risk_score,risk_level:h.risk_level})).sort((a,b)=>(b.risk_score||0)-(a.risk_score||0)) };
  downloadBlob(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}), `${state.current.code||"export"}.json`);
  log("Export JSON généré."); toast("JSON exporté");
}
function downloadBlob(blob,name){ const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href); }

/* ===== Project save/load ===== */
async function saveRRM(){
  if(!state.current.name){ toast("Sélectionnez d'abord une denrée","err"); return; }
  try {
    const zip = new JSZip();
    const item = state.current.item;
    const proj = { schemaVersion:"rrmft-project-1.0", savedAt:new Date().toISOString(), uiLang:state.lang,
      selection:{code:item.code, name:item.name, category:item.category},
      results: state.current.hazards,
      notes:{name:$("#projName").value, ref:$("#projRef").value, notes:$("#projNotes").value},
      log: state.log };
    zip.file("project.json", JSON.stringify(proj,null,2));
    const files = $("#files").files;
    for(const f of files){ zip.file("attachments/"+f.name, await f.arrayBuffer()); }
    const blob = await zip.generateAsync({type:"blob"});
    downloadBlob(blob, `${item.code||"project"}.rrm`);
    log("Projet sauvegardé (.RRM)."); toast("Projet enregistré");
  } catch(e){ log("Erreur save: "+e.message); toast("Erreur","err"); }
}
async function openRRM(file){
  if(!file) return;
  try {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const proj = JSON.parse(await zip.file("project.json").async("string"));
    state.lang = proj.uiLang||state.lang; $("#lang").value=state.lang; applyLang();
    $("#projName").value = proj?.notes?.name||"";
    $("#projRef").value = proj?.notes?.ref||"";
    $("#projNotes").value = proj?.notes?.notes||"";
    if(proj?.log) state.log = proj.log;
    if(proj?.selection?.name){ await selectCommodity(proj.selection.name); } else if(proj?.selection?.code){ await selectCommodity(proj.selection.code); }
    log("Projet chargé (.RRM)."); toast("Projet chargé");
  } catch(e){ log("Erreur load: "+e.message); toast("Erreur","err"); }
}

/* ===== Lang / theme ===== */
function applyLang(){
  document.documentElement.lang = state.lang;
  $("#q").placeholder = t("search");
  $("#hazardFilter").placeholder = t("filterHazards");
  const opts = $("#scoreFilter").options;
  opts[0].text=t("allScores");
  // chips
  const chips = $$("#filters .chip-filter");
  chips[0].textContent=t("all"); chips[1].textContent=t("ftlOnly"); chips[2].textContent=t("highScore");
  // topbar help
  // re-render list labels
  renderList();
}
function setTheme(th){
  state.theme = th;
  document.documentElement.setAttribute("data-theme", th);
  localStorage.setItem("rrm-theme", th);
}

/* ===== Events ===== */
function bindEvents(){
  $("#q").addEventListener("input", ()=>renderList());
  $("#lang").addEventListener("change", e=>{ state.lang=e.target.value; applyLang(); });
  $$("#filters .chip-filter").forEach(b=>b.addEventListener("click",()=>{
    $$("#filters .chip-filter").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); state.filter=b.dataset.filter; renderList();
  }));
  $("#hazardFilter").addEventListener("input", ()=>renderPairs());
  $("#scoreFilter").addEventListener("change", e=>{ state.scoreMin=+e.target.value; renderPairs(); });
  $("#sortReset").addEventListener("click", ()=>{ state.sort={key:"score",dir:-1}; renderPairs(); });
  $$("#pairsTable thead th").forEach(th=>{
    th.addEventListener("click", ()=>{
      const key = th.dataset.key; if(!key) return;
      if(state.sort.key===key) state.sort.dir *= -1; else state.sort={key,dir: key==="hazard"?1:-1};
      renderPairs();
    });
  });
  $("#saveRRM").addEventListener("click", saveRRM);
  $("#openRRMBtn").addEventListener("click", ()=>$("#openRRM").click());
  $("#openRRM").addEventListener("change", e=>{ if(e.target.files[0]) openRRM(e.target.files[0]); });
  $("#exportCSV").addEventListener("click", exportCSV);
  $("#exportJSON").addEventListener("click", exportJSON);
  $("#exportPrint").addEventListener("click", ()=>window.print());
  $("#clearLog").addEventListener("click", ()=>{ $("#log").textContent=""; state.log=[]; });
  $("#btnTheme").addEventListener("click", ()=>setTheme(state.theme==="dark"?"light":"dark"));
  $("#btnSidebar").addEventListener("click", ()=>$("#sidebar").classList.toggle("open"));
  $("#btnPanel").addEventListener("click", ()=>$("#panel").classList.toggle("open"));
  $("#btnHelp").addEventListener("click", openGuide);
  $("#guidePrev").addEventListener("click", ()=>{ if(guideIndex>0){ guideIndex--; renderGuide(); } });
  $("#guideNext").addEventListener("click", ()=>{ if(guideIndex<GUIDE_SLIDES.length-1){ guideIndex++; renderGuide(); } else { closeGuide(); } });
  $("#guideClose").addEventListener("click", closeGuide);
  $("#modalGuide").addEventListener("click", e=>{ if(e.target.id==="modalGuide") closeGuide(); });
  $("#demoBtn").addEventListener("click", ()=>selectCommodity("Tomatoes"));
  document.addEventListener("keydown", e=>{
    if(e.key==="Escape"){ $("#modalHelp").classList.remove("open"); $("#modalGuide").classList.remove("open"); $("#sidebar").classList.remove("open"); $("#panel").classList.remove("open"); }
    if((e.ctrlKey||e.metaKey) && e.key==="s"){ e.preventDefault(); saveRRM(); }
    if((e.ctrlKey||e.metaKey) && e.key==="e"){ e.preventDefault(); exportCSV(); }
  });
  window.addEventListener("resize", ()=>{ if(state.current.code) renderChart(); });
}

/* ===== Guide (slideshow) ===== */
const GUIDE_SLIDES = [
  { title: "1. Qu'est-ce que le RRM-FT ?",
    body: `<p>Le <strong>Risk Ranking Model for Food Tracing (RRM-FT)</strong> est l'outil officiel de la FDA pour classer les risques de traçabilité des aliments selon la règle <strong>FSMA 204</strong> (Food Traceability Rule).</p>
    <p>Il évalue, pour chaque <em>denrée</em>, les paires <em>denrée × danger</em> selon <strong>7 critères (C1 à C7)</strong> pour produire un <strong>score de risque</strong>. Ce score détermine si la denrée figure sur la <strong>Food Traceability List (FTL)</strong>.</p>
    <p>Cet assistant utilise les données officielles FDA — <strong>aucun recalcul</strong>, les scores sont ceux de la FDA.</p>` },
  { title: "2. Les 7 critères C1–C7",
    body: `<ul>
      <li><strong>C1</strong> — Fréquence de contamination</li>
      <li><strong>C2</strong> — Gravité de la maladie</li>
      <li><strong>C3</strong> — Difficulté de détection</li>
      <li><strong>C4</strong> — Difficulté de traçabilité</li>
      <li><strong>C5</strong> — Consommation / exposition</li>
      <li><strong>C6</strong> — Impact économique</li>
      <li><strong>C7</strong> — Vulnérabilité de la chaîne d'approvisionnement</li>
    </ul>
    <p>Le score final (0–100) est la combinaison pondérée. <span style="color:var(--risk-high);font-weight:700">≥ 80 = risque élevé</span>, <span style="color:var(--risk-med);font-weight:700">50–79 = moyen</span>, <span style="color:var(--risk-low);font-weight:700">&lt; 50 = faible</span>.</p>` },
  { title: "3. La Food Traceability List (FTL)",
    body: `<p>La FTL recense les aliments à haut risque pour lesquels la traçabilité renforcée s'applique : fromages frais au lait cru, poissons, coquillages, crustacés, légumes feuilles, tomates, poivrons, concombres, melons, fruits tropicaux, herbes fraîches, salades préparées, beurres de noix, œufs en coquille, etc.</p>
    <p>Si votre denrée est sur la FTL, vous êtes soumis à la règle FSMA 204.</p>` },
  { title: "4. Exigences pour les importateurs français",
    body: `<ul>
      <li><strong>KDE / CTE</strong> : enregistrer les Éléments de Données Clés à chaque Événement de Traçabilité Critique (réception, transformation, expédition).</li>
      <li><strong>Code de lot de traçabilité</strong> : attribuer et propager un identifiant unique par lot.</li>
      <li><strong>Délai de 24 h</strong> : fournir à la FDA, sur demande, les enregistrements sous forme de tableau triable dans les 24 heures.</li>
      <li><strong>Conservation 2 ans</strong> : garder les enregistrements 2 ans au-delà de la date de vente.</li>
      <li><strong>Vérification des fournisseurs étrangers (FSVP)</strong> : l'importateur est responsable de la conformité de ses fournisseurs.</li>
    </ul>` },
  { title: "5. Calendrier de mise en œuvre",
    body: `<ul>
      <li><strong>Nov. 2022</strong> — Publication de la règle finale FSMA 204.</li>
      <li><strong>Janv. 2023</strong> — Entrée en vigueur.</li>
      <li><strong>20 janv. 2026</strong> — <strong>Date de conformité</strong> : toutes les entreprises concernées doivent être conformes.</li>
      <li><strong>Après 2026</strong> — Contrôles FDA, possibilité de refus d'entrée pour les importations non conformes.</li>
    </ul>
    <p><em>Les importateurs français exportant vers les États-Unis sont directement concernés.</em></p>` },
  { title: "6. Comment utiliser cet outil",
    body: `<ol>
      <li><strong>Recherchez</strong> une denrée dans la barre latérale (ou tapez quelques lettres).</li>
      <li><strong>Cliquez</strong> sur la denrée pour afficher le résumé (catégorie, FTL, score max).</li>
      <li><strong>Consultez</strong> le tableau des paires danger, trié par score.</li>
      <li><strong>Filtrez</strong> par danger ou par score minimal (≥ 50/70/90).</li>
      <li><strong>Exportez</strong> en CSV/JSON ou imprimez pour votre dossier.</li>
      <li><strong>Enregistrez</strong> un projet .RRM pour le reprendre plus tard.</li>
    </ol>` },
  { title: "7. Références FDA",
    body: `<ul>
      <li>RRM-FT Results (Tables 2A/2B) — <a href="https://www.fda.gov/media/166880/download" target="_blank" rel="noopener">FDA PDF</a></li>
      <li>Food Traceability List — <a href="https://cfsanappsexternal.fda.gov/scripts/FDARiskRankingModelforFoodTracingfinalrule/" target="_blank" rel="noopener">FDA web tool</a></li>
      <li>CTE/KDE — FSMA 204 — <a href="https://www.fda.gov/media/163132/download" target="_blank" rel="noopener">FDA PDF</a></li>
      <li>Final Rule FSMA 204 — Federal Register</li>
    </ul>
    <p style="margin-top:var(--s-3);font-size:var(--t-xs);color:var(--color-text-3)">Données officielles FDA, aucun recalcul. Outil fourni à titre d'aide à la conformité.</p>` }
];

let guideIndex = 0;
function renderGuide(){
  const s = GUIDE_SLIDES[guideIndex];
  $("#guideTitle").textContent = s.title;
  $("#guideBody").innerHTML = s.body;
  $("#guideCounter").textContent = (guideIndex+1)+" / "+GUIDE_SLIDES.length;
  const dots = $("#guideDots"); dots.innerHTML="";
  GUIDE_SLIDES.forEach((_,i)=>{
    const d=document.createElement("span");
    d.style.cssText="width:8px;height:8px;border-radius:50%;background:"+(i===guideIndex?"var(--color-brand)":"var(--color-bg-3)")+";display:inline-block;cursor:pointer";
    d.addEventListener("click",()=>{guideIndex=i;renderGuide();});
    dots.appendChild(d);
  });
  $("#guidePrev").disabled = guideIndex===0;
  $("#guideNext").textContent = guideIndex===GUIDE_SLIDES.length-1 ? "Terminer ✓" : "Suivant ▶";
}
function openGuide(){ guideIndex=0; renderGuide(); $("#modalGuide").classList.add("open"); }
function closeGuide(){ $("#modalGuide").classList.remove("open"); }

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", async ()=>{
  const saved = localStorage.getItem("rrm-theme"); if(saved) setTheme(saved); else setTheme("dark");
  bindEvents();
  applyLang();
  await loadAll();
  if(!localStorage.getItem("rrm-guide-seen")){ openGuide(); localStorage.setItem("rrm-guide-seen","1"); }
  log("Application initialisée.");
});
