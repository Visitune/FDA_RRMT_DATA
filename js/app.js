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
  history: [],
  log: []
};

/* ===== Helpers ===== */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function t(k){ return (I18N[state.lang] && I18N[state.lang][k]) || k; }
function toast(msg, type="ok"){ const el=$("#toast"); el.textContent=msg; el.className="toast show "+type; clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("show"),2600); }
function log(msg){ const ts=new Date().toLocaleTimeString(state.lang==="fr"?"fr-FR":"en-US"); const line=`[${ts}] ${msg}`; state.log.push({ts,msg}); if(state.log.length>100) state.log=state.log.slice(-50); const d=$("#log"); d.textContent=(d.textContent?d.textContent+"\n":"")+line; d.scrollTop=d.scrollHeight; const sr=$("#sr-live"); if(sr) sr.textContent=msg; }
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
          risk_factors: two.risk_factors || {},
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
    const upd = twoA.last_updated || "—";
    let stale = "";
    try { const d=new Date(upd); const age=(Date.now()-d.getTime())/(365.25*24*3600*1000); if(age>1) stale=" ⚠️ données > 1 an"; } catch(e){}
    $("#counts").textContent = `${n} denrées · ${state.data.twoA.length} profils 2A · màj ${upd}${stale}`;
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
  renderHistory();
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
  try { $("#auditNotes").value = localStorage.getItem("rrm-notes-"+item.code) || ""; } catch(e){}
  const score = item.risk_score!=null ? Math.round(item.risk_score*100) : 0;
  $("#aggScore").textContent = score? score+"%" : "—";
  $("#aggScore").style.color = riskColor(score);
  renderPairs();
  renderChart();
  renderRadar();
  renderList();
  renderHistory();
  log(`Ouverture : ${item.name} (${item.code})`);
  pushHistory(item.name);
  try { location.hash = encodeURIComponent(item.code||item.name); } catch(e){}
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

/* ===== Radar factors (Table 2A) ===== */
function renderRadar(){
  const canvas = $("#radarChart"); if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio||1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width*dpr; canvas.height = rect.height*dpr;
  ctx.scale(dpr,dpr);
  const W = rect.width, H = rect.height;
  ctx.clearRect(0,0,W,H);
  const item = state.current.item;
  if(!item || !item.risk_factors || Object.keys(item.risk_factors).length===0){
    $("#radarSub").textContent = "Aucun facteur";
    return;
  }
  $("#radarSub").textContent = item.risk_level || "—";
  const factors = item.risk_factors;
  const labels = Object.keys(factors);
  const values = labels.map(k=>factors[k]);
  const n = labels.length;
  const cx = W/2, cy = H/2;
  const radius = Math.min(W,H)/2 - 40;
  // grid
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  for(let r=1;r<=4;r++){
    ctx.beginPath();
    for(let i=0;i<n;i++){
      const ang = (Math.PI*2*i/n) - Math.PI/2;
      const rr = radius*(r/4);
      const x = cx + rr*Math.cos(ang);
      const y = cy + rr*Math.sin(ang);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.stroke();
  }
  // axes + labels
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-text-2").trim() || "#8ea0b3";
  ctx.font = "11px system-ui";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for(let i=0;i<n;i++){
    const ang = (Math.PI*2*i/n) - Math.PI/2;
    const x = cx + radius*Math.cos(ang);
    const y = cy + radius*Math.sin(ang);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.stroke();
    const lx = cx + (radius+18)*Math.cos(ang);
    const ly = cy + (radius+18)*Math.sin(ang);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-text-2").trim() || "#8ea0b3";
    const lbl = labels[i].replace(/_/g," ");
    ctx.fillText(lbl.length>18?lbl.slice(0,16)+"…":lbl, lx, ly);
  }
  // data polygon
  ctx.beginPath();
  for(let i=0;i<n;i++){
    const ang = (Math.PI*2*i/n) - Math.PI/2;
    const v = values[i];
    const rr = radius*v;
    const x = cx + rr*Math.cos(ang);
    const y = cy + rr*Math.sin(ang);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(55,178,77,0.25)";
  ctx.fill();
  ctx.strokeStyle = "var(--color-brand)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // points
  for(let i=0;i<n;i++){
    const ang = (Math.PI*2*i/n) - Math.PI/2;
    const v = values[i];
    const rr = radius*v;
    const x = cx + rr*Math.cos(ang);
    const y = cy + rr*Math.sin(ang);
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle = "#37b24d"; ctx.fill();
  }
}

function renderGlobal(){
  const q = ($("#globalQ").value||"").toLowerCase();
  const tbody = $("#globalBody");
  tbody.innerHTML = "";
  const rows = [];
  for(const it of (state.data.items||[])){
    for(const h of (it.hazards||[])){
      if(!q || it.name.toLowerCase().includes(q) || h.hazard.toLowerCase().includes(q)) rows.push({name:it.name,hazard:h.hazard,score:h.risk_score,level:h.risk_level});
    }
  }
  rows.sort((a,b)=>(b.score||0)-(a.score||0));
  $("#globalCount").textContent = rows.length+" résultats";
  const slice = rows.slice(0,50);
  for(const r of slice){
    const sc = r.score!=null? Math.round(r.score*100):0;
    const tr=document.createElement("tr");
    tr.innerHTML = `<td>${esc(r.name)}</td><td>${esc(r.hazard)}</td><td style="color:${riskColor(sc)};font-weight:700">${sc}%</td><td class="crit">${esc(r.level||"—")}</td>`;
    tr.style.cursor="pointer";
    tr.addEventListener("click",()=>selectCommodity(r.name));
    tbody.appendChild(tr);
  }
  if(rows.length>50){ const tr=document.createElement("tr"); tr.innerHTML=`<td colspan="4" style="text-align:center;color:var(--color-text-3);font-size:var(--t-xs)">… et ${rows.length-50} autres</td>`; tbody.appendChild(tr); }
}

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
function exportKDE(){
  if(!state.current.name){ toast("Sélectionnez d'abord une denrée","err"); return; }
  const item = state.current.item;
  const rows = [["CTE","KDE","Valeur","Notes"]];
  const ctes = ["Harvesting/Cooling","Initial Packing","First Receiver","Shipping","Receiving","Transformation"];
  for(const c of ctes){
    rows.push([c,"Traceability Lot Code","",""]);
    rows.push([c,"Quantity","",""]);
    rows.push([c,"Unit of Measure","",""]);
    rows.push([c,"Product Description",item.name,""]);
    rows.push([c,"Location","",""]);
    rows.push([c,"Date/Time","",""]);
  }
  const csv = rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
  downloadBlob(new Blob([csv],{type:"text/csv;charset=utf-8"}), `${item.code}_KDE_CTE_template.csv`);
  log("Template KDE/CTE généré."); toast("Template exporté");
}

/* ===== Project save/load ===== */
async function saveRRM(){
  if(!state.current.name){ toast("Sélectionnez d'abord une denrée","err"); return; }
  try {
    const zip = new JSZip();
    const item = state.current.item;
    const proj = { schemaVersion:"rrmft-project-1.0", savedAt:new Date().toISOString(), uiLang:state.lang,
      selection:{code:item.code, name:item.name, category:item.category},
      results: state.current.hazards,
      notes:{name:$("#projName").value, ref:$("#projRef").value, notes:$("#projNotes").value, audit:$("#auditNotes").value},
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
  const chips = $$("#filters .chip-filter");
  chips[0].textContent=t("all"); chips[1].textContent=t("ftlOnly"); chips[2].textContent=t("highScore");
  $$("[data-i18n]").forEach(el=>{ const k=el.getAttribute("data-i18n"); if(I18N[state.lang] && I18N[state.lang][k]) el.textContent=I18N[state.lang][k]; });
  renderList();
  renderHistory();
  if(state.current.name) selectCommodity(state.current.name);
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
  $("#exportKDE").addEventListener("click", exportKDE);
  $("#clearLog").addEventListener("click", ()=>{ $("#log").textContent=""; state.log=[]; });
  $("#btnTheme").addEventListener("click", ()=>setTheme(state.theme==="dark"?"light":"dark"));
  $("#btnSidebar").addEventListener("click", ()=>$("#sidebar").classList.toggle("open"));
  $("#btnPanel").addEventListener("click", ()=>$("#panel").classList.toggle("open"));
  $("#btnHelp").addEventListener("click", openGuide);
  $("#guidePrev").addEventListener("click", ()=>{ if(guideIndex>0){ guideIndex--; renderGuide(); } });
  $("#guideNext").addEventListener("click", ()=>{ if(guideIndex<GUIDE_SLIDES.length-1){ guideIndex++; renderGuide(); } else { closeGuide(); } });
  $("#guideClose").addEventListener("click", closeGuide);
  $("#modalGuide").addEventListener("click", e=>{ if(e.target.id==="modalGuide") closeGuide(); });
  $("#auditNotes").addEventListener("input", e=>{
    if(!state.current.code) return;
    try { localStorage.setItem("rrm-notes-"+state.current.code, e.target.value); } catch(err){}
  });
  $("#toggleAdvanced").addEventListener("click", ()=>{
    const show = $("#globalCard").style.display==="none";
    $("#globalCard").style.display = show?"block":"none";
    $("#radarCard").style.display = show?"block":"none";
    $("#toggleAdvanced").textContent = show?"🔧 Masquer les outils avancés":"🔧 Afficher les outils avancés (radar, recherche globale)";
    if(show){ renderGlobal(); renderRadar(); }
  });
  $("#globalQ").addEventListener("input", ()=>renderGlobal());
  document.addEventListener("keydown", e=>{
    if(e.key==="Escape"){ $("#modalHelp").classList.remove("open"); $("#modalGuide").classList.remove("open"); $("#sidebar").classList.remove("open"); $("#panel").classList.remove("open"); }
    if((e.ctrlKey||e.metaKey) && e.key==="s"){ e.preventDefault(); saveRRM(); }
    if((e.ctrlKey||e.metaKey) && e.key==="e"){ e.preventDefault(); exportCSV(); }
  });
  window.addEventListener("resize", ()=>{ if(state.current.code) renderChart(); });
}

/* ===== Guide (slideshow) ===== */
const GUIDE_SLIDES = [
  { title: "🎯 Objectif de l'outil",
    body: `<p>Cet assistant aide les <strong>professionnels de l'agroalimentaire</strong> (auditeurs, responsables qualité, importateurs) à :</p>
    <ul>
      <li>Évaluer les <strong>risques de traçabilité</strong> d'une denrée selon la méthodologie officielle <strong>FDA RRM-FT</strong>.</li>
      <li>Savoir si la denrée figure sur la <strong>Food Traceability List (FTL)</strong> → soumise à la règle <strong>FSMA 204</strong>.</li>
      <li>Préparer des <strong>dossiers d'audit et de conformité</strong> (export CSV/JSON, rapport imprimable).</li>
      <li>Travailler <strong>hors ligne</strong> sur le terrain (mode démo intégré).</li>
    </ul>
    <p style="background:var(--color-brand-soft);padding:var(--s-3);border-radius:var(--r-sm);border-left:3px solid var(--color-brand)">💡 <strong>Aucun recalcul</strong> : les scores affichés sont ceux de la FDA, copiés tels quels.</p>` },
  { title: "📋 Étape 1 — Comprendre la méthodologie FDA",
    body: `<p>La FDA évalue chaque <em>paire denrée × danger</em> selon <strong>7 critères (C1 à C7)</strong>, chacun noté, pour produire un <strong>score de risque (0–100)</strong>.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-2);margin:var(--s-3) 0">
      <div style="background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm)"><strong>C1</strong> — Fréquence de contamination</div>
      <div style="background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm)"><strong>C2</strong> — Gravité de la maladie</div>
      <div style="background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm)"><strong>C3</strong> — Difficulté de détection</div>
      <div style="background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm)"><strong>C4</strong> — Difficulté de traçabilité</div>
      <div style="background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm)"><strong>C5</strong> — Consommation / exposition</div>
      <div style="background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm)"><strong>C6</strong> — Impact économique</div>
      <div style="background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm);grid-column:1/-1"><strong>C7</strong> — Vulnérabilité de la chaîne d'approvisionnement</div>
    </div>
    <p>Légende des scores : <span style="color:var(--risk-high);font-weight:700">🔴 ≥ 80 = risque élevé</span> · <span style="color:var(--risk-med);font-weight:700">🟠 50–79 = moyen</span> · <span style="color:var(--risk-low);font-weight:700">🟢 &lt; 50 = faible</span>.</p>` },
  { title: "📋 Étape 2 — La Food Traceability List (FTL)",
    body: `<p>La FTL recense les aliments à <strong>haut risque</strong> pour lesquels la traçabilité renforcée s'applique. Exemples :</p>
    <ul>
      <li>🧀 Fromages frais au lait cru, beurres de noix</li>
      <li>🐟 Poissons, coquillages, crustacés, œufs en coquille</li>
      <li>🥬 Légumes feuilles, tomates, poivrons, concombres, melons</li>
      <li>🍓 Fruits tropicaux, herbes fraîches</li>
      <li>🥗 Salades préparées (RTE deli salads)</li>
    </ul>
    <p>Si votre denrée est sur la FTL → vous êtes <strong>soumis à la règle FSMA 204</strong>. Le badge <span class="pill ok">FTL</span> dans l'assistant l'indique.</p>` },
  { title: "📋 Étape 3 — Obligations pour les importateurs français",
    body: `<p>Les importateurs français exportant vers les États-Unis sont <strong>directement concernés</strong>. Obligations clés :</p>
    <ol>
      <li><strong>KDE / CTE</strong> — Enregistrer les Éléments de Données Clés à chaque Événement de Traçabilité Critique (réception, transformation, expédition).</li>
      <li><strong>Code de lot de traçabilité</strong> — attribuer et propager un identifiant unique par lot.</li>
      <li><strong>Délai de 24 h</strong> — fournir à la FDA, sur demande, les enregistrements sous forme de tableau triable dans les 24 heures.</li>
      <li><strong>Conservation 2 ans</strong> — garder les enregistrements 2 ans au-delà de la date de vente.</li>
      <li><strong>FSVP</strong> — l'importateur est responsable de la conformité de ses fournisseurs étrangers.</li>
    </ol>
    <p style="background:var(--color-warn-soft);padding:var(--s-3);border-radius:var(--r-sm);border-left:3px solid var(--color-warn)">⚠️ <strong>Sanction</strong> : refus d'entrée aux États-Unis pour les importations non conformes.</p>` },
  { title: "📅 Étape 4 — Calendrier de mise en œuvre",
    body: `<div style="display:flex;flex-direction:column;gap:var(--s-2)">
      <div style="display:flex;gap:var(--s-3);align-items:center;background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm)"><span style="font-weight:700;min-width:110px;color:var(--color-brand)">Nov. 2022</span><span>Publication de la règle finale FSMA 204</span></div>
      <div style="display:flex;gap:var(--s-3);align-items:center;background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm)"><span style="font-weight:700;min-width:110px;color:var(--color-brand)">Janv. 2023</span><span>Entrée en vigueur</span></div>
      <div style="display:flex;gap:var(--s-3);align-items:center;background:var(--color-err-soft);padding:var(--s-3);border-radius:var(--r-sm);border-left:3px solid var(--color-err)"><span style="font-weight:700;min-width:110px;color:var(--color-err)">20 janv. 2026</span><span><strong>Date de conformité</strong> — toutes les entreprises concernées doivent être conformes</span></div>
      <div style="display:flex;gap:var(--s-3);align-items:center;background:var(--color-bg-2);padding:var(--s-3);border-radius:var(--r-sm)"><span style="font-weight:700;min-width:110px;color:var(--color-brand)">Après 2026</span><span>Contrôles FDA, refus d'entrée possible</span></div>
    </div>` },
  { title: "🛠️ Étape 5 — Utiliser cet outil (pas à pas)",
    body: `<ol style="line-height:2">
      <li><strong>Rechercher</strong> une denrée dans la barre latérale (ou taper quelques lettres).</li>
      <li><strong>Cliquer</strong> sur la denrée → résumé (catégorie, FTL, score max coloré).</li>
      <li><strong>Consulter</strong> le tableau des paires danger, trié par score décroissant.</li>
      <li><strong>Filtrer</strong> par danger (texte) ou par score minimal (≥ 50 / 70 / 90).</li>
      <li><strong>Visualiser</strong> le graphique en barres (top 10) et le radar des facteurs de risque.</li>
      <li><strong>Annoter</strong> dans « Notes auditeur » (sauvegardées automatiquement).</li>
      <li><strong>Exporter</strong> en CSV/JSON, template KDE/CTE, ou imprimer en PDF.</li>
      <li><strong>Enregistrer</strong> un projet .RRM pour le reprendre plus tard.</li>
    </ol>` },
  { title: "🔗 Étape 6 — Fonctionnalités avancées",
    body: `<ul>
      <li><strong>Recherche globale</strong> — trouver toutes les denrées contenant un danger donné (ex. Salmonella).</li>
      <li><strong>Historique</strong> — les 10 dernières denrées consultées (sidebar).</li>
      <li><strong>Lien partageable</strong> — l'URL contient le code de la denrée sélectionnée (#030105).</li>
      <li><strong>Thème clair/sombre</strong> — toggle en haut à droite (persisté).</li>
      <li><strong>Mode hors ligne (PWA)</strong> — installable, fonctionne sans réseau après le premier chargement.</li>
      <li><strong>Version des données</strong> — date de mise à jour FDA affichée ; alerte si &gt; 1 an.</li>
    </ul>` },
  { title: "📚 Références FDA officielles",
    body: `<ul>
      <li>RRM-FT Results (Tables 2A/2B) — <a href="https://www.fda.gov/media/166880/download" target="_blank" rel="noopener">FDA PDF</a></li>
      <li>Food Traceability List — <a href="https://cfsanappsexternal.fda.gov/scripts/FDARiskRankingModelforFoodTracingfinalrule/" target="_blank" rel="noopener">FDA web tool</a></li>
      <li>CTE/KDE — FSMA 204 — <a href="https://www.fda.gov/media/163132/download" target="_blank" rel="noopener">FDA PDF</a></li>
      <li>Final Rule FSMA 204 — Federal Register (2022)</li>
    </ul>
    <p style="margin-top:var(--s-3);font-size:var(--t-xs);color:var(--color-text-3)">Données officielles FDA, aucun recalcul. Outil fourni à titre d'aide à la conformité — ne se substitue pas à un conseil réglementaire.</p>` }
];

let guideIndex = 0;
function renderGuide(){
  const s = GUIDE_SLIDES[guideIndex];
  $("#guideTitle").textContent = s.title;
  $("#guideBody").innerHTML = s.body;
  $("#guideCounter").textContent = (guideIndex+1)+" / "+GUIDE_SLIDES.length;
  const prog = $("#guideProgress"); if(prog) prog.style.width = ((guideIndex+1)/GUIDE_SLIDES.length*100)+"%";
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
function openGuide(){ guideIndex=0; renderGuide(); $("#modalGuide").classList.add("open"); 
  const modal=$("#modalGuide").querySelector(".modal");
  const focusables=modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
  if(focusables.length) focusables[0].focus();
  // focus trap
  $("#modalGuide")._trap = (e)=>{
    if(e.key!=="Tab") return;
    const f=modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if(!f.length) return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  };
  $("#modalGuide").addEventListener("keydown", $("#modalGuide")._trap);
}
function closeGuide(){ $("#modalGuide").classList.remove("open"); if($("#modalGuide")._trap){ $("#modalGuide").removeEventListener("keydown", $("#modalGuide")._trap); } }

function pushHistory(name){
  state.history = [name].concat(state.history.filter(n=>n!==name)).slice(0,9);
  try { localStorage.setItem("rrm-history", JSON.stringify(state.history)); } catch(e){}
  renderHistory();
}
function renderHistory(){
  const el = $("#historyList");
  if(!state.history.length){ el.textContent="—"; return; }
  el.innerHTML = state.history.map(n=>`<div style="cursor:pointer;padding:2px 0" data-h="${esc(n)}">${esc(n)}</div>`).join("");
  el.querySelectorAll("[data-h]").forEach(d=>d.addEventListener("click",()=>selectCommodity(d.dataset.h)));
}
document.addEventListener("DOMContentLoaded", async ()=>{
  const saved = localStorage.getItem("rrm-theme"); if(saved) setTheme(saved); else setTheme("dark");
  try { state.history = JSON.parse(localStorage.getItem("rrm-history")||"[]"); } catch(e){ state.history=[]; }
  bindEvents();
  applyLang();
  await loadAll();
  if('serviceWorker' in navigator){ try { navigator.serviceWorker.register('sw.js'); } catch(e){} }
  // hash routing
  const h = decodeURIComponent((location.hash||"").replace(/^#/,""));
  if(h){ const it=(state.data.items||[]).find(e=>e.code===h||e.name===h); if(it) selectCommodity(it.name); }
  if(!localStorage.getItem("rrm-guide-seen")){ openGuide(); localStorage.setItem("rrm-guide-seen","1"); }
  log("Application initialisée.");
});
