'use client';

import { useEffect, useMemo, useState } from 'react';

const JOBS_KEY = 'printlink3d_jobs_v2';
const SESSION_KEY = 'printlink3d_session_v2';
const money = (n) => `$${Math.round(n || 0).toLocaleString('es-AR')}`;
const uid = () => Math.random().toString(36).slice(2, 10);

const initialJobs = [
  {
    id: 'job-001', title: 'Soporte modular para auriculares', material: 'PLA', quantity: 1, color: 'Negro',
    description: 'Necesito una pieza resistente, buena terminación y color negro. Puedo enviar medidas de referencia.',
    delivery: 'A coordinar', budget: '$40.000–$48.000', status: 'Con ofertas', modelId: 'pl3d-001', saved: false,
    offers: [
      { id: 'offer-001', creatorName: 'Taller Mislej 3D', material: 'PLA negro', price: 42896, deliveryDays: 4, notes: 'Relleno 35%, buena resistencia y entrega a coordinar.', status: 'Enviada' },
      { id: 'offer-002', creatorName: 'Cubo Norte Prints', material: 'PETG', price: 39760, deliveryDays: 6, notes: 'Material resistente, terminación mate.', status: 'Enviada' },
    ],
  },
  {
    id: 'job-002', title: 'Miniatura para D&D', material: 'Resina', quantity: 1, color: 'Gris',
    description: 'Figura de fantasía de detalle alto para pintar. Altura aproximada 8 cm.',
    delivery: 'Retiro', budget: '$18.000–$28.000', status: 'Publicada', modelId: 'pl3d-004', saved: false, offers: [],
  },
];

function calc(model, extras = 1500) {
  if (!model) return { materialCost: 0, timeCost: 0, creatorSubtotal: 0, platformFee: 0, finalPrice: 0 };
  const materialCost = model.weightGrams * model.pricing.gramPrice;
  const timeCost = Math.round((model.printTimeMinutes / 60) * model.pricing.hourPrice);
  const creatorSubtotal = materialCost + timeCost + extras;
  const platformFee = Math.round(creatorSubtotal * 0.12);
  return { materialCost, timeCost, extras, creatorSubtotal, platformFee, finalPrice: creatorSubtotal + platformFee };
}

export default function Page() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('home');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJobId, setSelectedJobId] = useState(initialJobs[0].id);
  const [query, setQuery] = useState('soporte');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');

  useEffect(() => {
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    const jobsRaw = localStorage.getItem(JOBS_KEY);
    if (sessionRaw) setSession(JSON.parse(sessionRaw));
    if (jobsRaw) setJobs(JSON.parse(jobsRaw));
    loadModels();
  }, []);

  useEffect(() => { localStorage.setItem(JOBS_KEY, JSON.stringify(jobs)); }, [jobs]);

  const model = selectedModel || models[0];
  const quote = useMemo(() => calc(model), [model]);
  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  async function loadModels() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (material) params.set('material', material);
    const res = await fetch(`/api/models?${params.toString()}`);
    const data = await res.json();
    setModels(data.models || []);
    if (!selectedModel && data.models?.[0]) setSelectedModel(data.models[0]);
  }

  function login(role) {
    const next = { role, name: role === 'buyer' ? 'Tobías' : 'Taller Mislej 3D' };
    setSession(next);
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setView(role === 'buyer' ? 'home' : 'studio');
  }

  function logout() { setSession(null); localStorage.removeItem(SESSION_KEY); setView('home'); }
  function switchRole() { login(session.role === 'buyer' ? 'maker' : 'buyer'); }

  function publishJob() {
    const job = {
      id: `job-${uid()}`, title: model.name, material: model.material, quantity: 1, color: 'A definir',
      description: 'Solicitud creada desde el modelo seleccionado. Necesito confirmar material, color, entrega y terminación.',
      delivery: 'A coordinar', budget: `${money(quote.finalPrice * .9)}–${money(quote.finalPrice * 1.15)}`,
      status: 'Publicada', modelId: model.id, saved: false, offers: [],
    };
    setJobs([job, ...jobs]); setSelectedJobId(job.id); setView('jobs');
  }

  function saveJob(id) { setJobs(jobs.map(j => j.id === id ? { ...j, saved: !j.saved } : j)); }
  function sendOffer(id) {
    const offer = { id: `offer-${uid()}`, creatorName: 'Taller Mislej 3D', material: 'PLA / PETG a coordinar', price: quote.finalPrice || 42896, deliveryDays: 4, notes: 'Oferta demo guardada localmente. Incluye revisión de medidas y coordinación de entrega.', status: 'Enviada' };
    setJobs(jobs.map(j => j.id === id ? { ...j, status: 'Con ofertas', offers: [offer, ...j.offers] } : j));
    setSelectedJobId(id); setView('studio');
  }
  function acceptOffer(jobId, offerId) {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'Oferta aceptada', offers: j.offers.map(o => ({ ...o, status: o.id === offerId ? 'Aceptada' : 'Rechazada' })) } : j));
    setSelectedJobId(jobId); setView('chat');
  }

  if (!session) return <Login onLogin={login} />;

  const nav = session.role === 'buyer'
    ? [['home','Inicio'],['models','Modelos'],['quote','Cotizador'],['jobs','Solicitudes'],['chat','Acuerdo']]
    : [['studio','Panel'],['jobs','Trabajos'],['portfolio','Portfolio'],['chat','Acuerdo']];

  return <main className="app">
    <aside className="sidebar">
      <Logo />
      <nav className="nav">{nav.map(([id,label]) => <button key={id} className={view===id?'active':''} onClick={() => setView(id)}>{label}</button>)}</nav>
      <div className="session"><span className="badge cyan">Sesión demo</span><h3>{session.name}</h3><p className="muted">{session.role === 'buyer' ? 'Compra de impresiones' : 'Taller de impresión'}</p><div className="stack" style={{marginTop:12}}><button className="btn ghost small" onClick={switchRole}>Cambiar modo</button><button className="btn ghost small" onClick={logout}>Salir</button></div></div>
    </aside>
    <section className="content">
      {view === 'home' && <Home jobs={jobs} go={setView} />}
      {view === 'models' && <Models models={models} query={query} setQuery={setQuery} category={category} setCategory={setCategory} material={material} setMaterial={setMaterial} loadModels={loadModels} select={(m)=>{setSelectedModel(m);setView('quote')}} />}
      {view === 'quote' && <Quote model={model} quote={quote} publish={publishJob} back={()=>setView('models')} />}
      {view === 'jobs' && <Jobs role={session.role} jobs={jobs} saveJob={saveJob} sendOffer={sendOffer} acceptOffer={acceptOffer} openOffers={(id)=>{setSelectedJobId(id);setView('offers')}} openChat={(id)=>{setSelectedJobId(id);setView('chat')}} publish={publishJob} />}
      {view === 'offers' && <Offers job={selectedJob} acceptOffer={acceptOffer} back={()=>setView('jobs')} />}
      {view === 'chat' && <Chat job={selectedJob} back={()=>setView(session.role==='buyer'?'jobs':'studio')} />}
      {view === 'studio' && <Studio jobs={jobs} saveJob={saveJob} sendOffer={sendOffer} go={setView} />}
      {view === 'portfolio' && <Portfolio />}
    </section>
  </main>
}

function Login({ onLogin }) { return <main className="login"><section className="login-card"><div className="login-hero"><Logo dark /><h1>Entrá, elegí un modelo y convertí una idea en objeto.</h1><p>Una web demo lista para GitHub y Vercel, con API local, solicitudes, trabajos guardados y ofertas.</p></div><div className="login-box"><span className="badge orange">Prototipo publicable</span><h2>Elegí cómo entrar</h2><p className="muted">No hay autenticación real. La selección solo cambia la vista.</p><div className="role-grid"><button className="role-card" onClick={()=>onLogin('buyer')}><span className="badge cyan">Buscar</span><h3>Comprar impresión</h3><p className="muted">Buscar modelos, publicar solicitudes y aceptar ofertas.</p><div className="btn" style={{marginTop:18}}>Entrar</div></button><button className="role-card orange" onClick={()=>onLogin('maker')}><span className="badge orange">Taller</span><h3>Ofrecer impresión</h3><p className="muted">Guardar trabajos, ofertar y mostrar portfolio.</p><div className="btn orange" style={{marginTop:18}}>Entrar</div></button></div></div></section></main> }
function Logo({ dark=false }) { return <div className="logo"><svg viewBox="0 0 260 210"><g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="18"><path stroke="#20D6C7" d="M28 67 88 32l60 35v70l-60 35-60-35z"/><path stroke="#20D6C7" d="M28 67l60 35 60-35M88 102v70"/><path stroke="#FF7A45" d="M112 78l55-32 55 32v64l-55 32-55-32z"/><path stroke="#FF7A45" d="M112 78l55 32 55-32M167 110v64"/></g><path fill="#101A20" d="M128 75l24-14 18 11-24 14z"/></svg><b style={dark?{color:'#101A20'}:{}}>PrintLink<span>3D</span></b></div> }
function Art(){return <div className="model-art"><Logo /></div>}
function Header({title,subtitle,action}){return <div className="top"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>}
function Metric({label,value}){return <div className="metric"><span>{label}</span><b>{value}</b></div>}
function Status({s}){let c=s.includes('aceptada')?'green':s.includes('ofertas')?'orange':'cyan';return <span className={`badge ${c}`}>{s}</span>}
function Breakdown({q}){return <div className="breakdown"><div className="line"><span>Material</span><b>{money(q.materialCost)}</b></div><div className="line"><span>Tiempo máquina</span><b>{money(q.timeCost)}</b></div><div className="line"><span>Subtotal taller</span><b>{money(q.creatorSubtotal)}</b></div><div className="line"><span>Comisión</span><b>{money(q.platformFee)}</b></div><div className="line total"><span>Total</span><span>{money(q.finalPrice)}</span></div></div>}
function Home({jobs,go}){return <><Header title="Inicio" subtitle="Solicitudes, ofertas y accesos principales."/><div className="grid2"><section className="panel hero-panel"><span className="badge cyan">Acción principal</span><h2>Buscá un modelo y publicá tu pedido.</h2><p>La app conecta catálogo, cotización, solicitudes y ofertas en un flujo único.</p><div style={{display:'flex',gap:12,marginTop:26}}><button className="btn" onClick={()=>go('models')}>Buscar modelos</button><button className="btn orange" onClick={()=>go('jobs')}>Ver solicitudes</button></div></section><section className="panel"><h3>Actividad</h3><Metric label="Solicitudes" value={jobs.length}/><Metric label="Ofertas" value={jobs.reduce((a,j)=>a+j.offers.length,0)}/><Metric label="Aceptadas" value={jobs.filter(j=>j.status==='Oferta aceptada').length}/></section></div><div className="grid3" style={{marginTop:18}}>{jobs.slice(0,3).map(j=><section className="panel" key={j.id}><Status s={j.status}/><h3 style={{marginTop:12}}>{j.title}</h3><p className="muted">{j.material} · {j.quantity} unidad/es · {j.budget}</p></section>)}</div></>}
function Models({models,query,setQuery,category,setCategory,material,setMaterial,loadModels,select}){const cats=[...new Set(models.map(m=>m.category))];const mats=[...new Set(models.map(m=>m.material))];return <><Header title="Modelos 3D" subtitle="API local con 20 modelos de prueba."/><section className="panel"><div className="filters"><input className="field" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar..."/><select className="field" value={category} onChange={e=>setCategory(e.target.value)}><option value="">Categoría</option>{cats.map(c=><option key={c}>{c}</option>)}</select><select className="field" value={material} onChange={e=>setMaterial(e.target.value)}><option value="">Material</option>{mats.map(m=><option key={m}>{m}</option>)}</select><button className="btn" onClick={loadModels}>Buscar</button></div></section><div className="grid3" style={{marginTop:18}}>{models.map(m=><button key={m.id} className="model-card" onClick={()=>select(m)}><Art/><h3>{m.name}</h3><p>{m.description}</p><div className="chips"><span className="badge">{m.weightGrams} g</span><span className="badge">{Math.round(m.printTimeMinutes/60*10)/10} h</span><span className="badge cyan">{m.material}</span></div><div className="price" style={{marginTop:12}}>{money(m.pricing.finalPrice)}</div></button>)}</div></>}
function Quote({model,quote,publish,back}){if(!model)return null;return <><Header title={model.name} subtitle="Detalle técnico y precio estimado." action={<button className="btn orange" onClick={publish}>Publicar solicitud</button>}/><div className="grid2"><section className="panel"><Art/><div className="chips" style={{marginTop:16}}><span className="badge">{model.category}</span><span className="badge cyan">{model.material}</span><span className="badge">{model.license}</span><span className="badge">{model.author}</span></div></section><section className="panel"><h3>Datos técnicos</h3><div className="grid3" style={{marginTop:14}}><Metric label="Peso" value={`${model.weightGrams} g`}/><Metric label="Tiempo" value={`${Math.round(model.printTimeMinutes/60*10)/10} h`}/><Metric label="Material" value={model.material}/></div><p className="muted" style={{marginTop:16}}>{model.description}</p><div style={{marginTop:16}}><Breakdown q={quote}/></div><div style={{display:'flex',gap:12,marginTop:16}}><button className="btn ghost" onClick={back}>Cambiar modelo</button><button className="btn orange" onClick={publish}>Publicar solicitud</button></div></section></div></>}
function Jobs({role,jobs,saveJob,sendOffer,acceptOffer,openOffers,openChat,publish}){return <><Header title={role==='buyer'?'Solicitudes':'Trabajos disponibles'} subtitle={role==='buyer'?'Publicá pedidos y aceptá ofertas.':'Guardá trabajos y enviá ofertas.'} action={role==='buyer'?<button className="btn orange" onClick={publish}>Publicar solicitud demo</button>:null}/>{jobs.map(j=><section className="job" key={j.id}><div><Status s={j.status}/><h3>{j.title}</h3><p>{j.description}</p><div className="chips"><span className="badge">{j.material}</span><span className="badge">{j.quantity} unidad/es</span><span className="badge orange">{j.budget}</span></div></div><div className="stack">{role==='maker'?<><button className="btn ghost" onClick={()=>saveJob(j.id)}>{j.saved?'Guardado':'Guardar trabajo'}</button><button className="btn orange" onClick={()=>sendOffer(j.id)}>Enviar oferta</button></>:<><button className="btn orange" onClick={()=>openOffers(j.id)}>Ver ofertas ({j.offers.length})</button>{j.offers[0]&&<button className="btn" onClick={()=>acceptOffer(j.id,j.offers[0].id)}>Aceptar mejor oferta</button>}<button className="btn ghost" onClick={()=>openChat(j.id)}>Abrir acuerdo</button></>}</div></section>)}</>}
function Offers({job,acceptOffer,back}){return <><Header title="Ofertas recibidas" subtitle={job.title} action={<button className="btn ghost" onClick={back}>Volver</button>}/><section className="panel"><Status s={job.status}/><h3 style={{marginTop:12}}>{job.title}</h3><p className="muted">{job.description}</p></section><div className="grid3" style={{marginTop:18}}>{job.offers.length?job.offers.map(o=><section className="panel" key={o.id}><div className="avatar">{o.creatorName.split(' ').map(w=>w[0]).slice(0,2).join('')}</div><h3 style={{marginTop:14}}>{o.creatorName}</h3><p className="muted">{o.notes}</p><Metric label="Entrega" value={`${o.deliveryDays} días`}/><Metric label="Material" value={o.material}/><div className="price" style={{marginTop:12}}>{money(o.price)}</div><button className="btn orange" style={{marginTop:12,width:'100%'}} onClick={()=>acceptOffer(job.id,o.id)}>{o.status==='Aceptada'?'Aceptada':'Aceptar oferta'}</button></section>):<section className="panel"><h3>Sin ofertas todavía</h3><p className="muted">Cuando un taller envíe una oferta aparecerá acá.</p></section>}</div></>}
function Studio({jobs,saveJob,sendOffer,go}){return <><Header title="Panel de taller" subtitle="Solicitudes disponibles, trabajos guardados y ofertas enviadas." action={<button className="btn orange" onClick={()=>go('portfolio')}>Editar portfolio</button>}/><div className="grid4"><Metric label="Solicitudes" value={jobs.length}/><Metric label="Guardados" value={jobs.filter(j=>j.saved).length}/><Metric label="Ofertas" value={jobs.reduce((a,j)=>a+j.offers.filter(o=>o.creatorName==='Taller Mislej 3D').length,0)}/><Metric label="Rating" value="4.8"/></div><div style={{marginTop:18}}>{jobs.map(j=><section className="job" key={j.id}><div><Status s={j.status}/><h3>{j.title}</h3><p>{j.description}</p><div className="chips"><span className="badge">{j.material}</span><span className="badge orange">{j.budget}</span></div></div><div className="stack"><button className="btn ghost" onClick={()=>saveJob(j.id)}>{j.saved?'Trabajo guardado':'Guardar trabajo'}</button><button className="btn orange" onClick={()=>sendOffer(j.id)}>Enviar oferta</button></div></section>)}</div></>}
function Chat({job,back}){const offer=job.offers.find(o=>o.status==='Aceptada')||job.offers[0];return <><Header title="Acuerdo del trabajo" subtitle={job.title} action={<button className="btn ghost" onClick={back}>Volver</button>}/><div className="chat"><section className="panel"><div className="message">Hola, puedo imprimirlo en {offer?.material||job.material}. Entrega estimada: {offer?.deliveryDays||4} días.</div><div className="message me">Perfecto. Necesito buena terminación y resistencia.</div><div className="message">No hay problema. Ajusto parámetros antes de imprimir y confirmo medidas.</div><div className="message me">Confirmado. Avancemos.</div><div style={{display:'grid',gridTemplateColumns:'1fr 100px',gap:10,marginTop:260}}><div className="field" style={{display:'flex',alignItems:'center',color:'var(--steel)'}}>Escribir mensaje demo...</div><button className="btn">Enviar</button></div></section><section className="panel"><h3>Resumen</h3><Metric label="Pedido" value={job.title}/><Metric label="Material" value={offer?.material||job.material}/><Metric label="Entrega" value={`${offer?.deliveryDays||4} días`}/><Metric label="Total" value={money(offer?.price||0)}/><button className="btn orange" style={{marginTop:14,width:'100%'}}>Marcar en producción</button></section></div></>}
function Portfolio(){const works=[['Soporte modular','PLA · 80 g'],['Miniatura en resina','Resina · 6 h'],['Repuesto técnico','PETG · funcional'],['Caja electrónica','PETG · prototipo'],['Organizador','PLA · escritorio'],['Maceta low-poly','PLA · decoración']];return <><Header title="Portfolio del taller" subtitle="Perfil público editable para mostrar trabajos anteriores."/><div className="grid2"><section className="panel"><div style={{display:'flex',gap:14,alignItems:'center'}}><div className="avatar">TM</div><div><h3>Taller Mislej 3D</h3><p className="muted">Piezas funcionales, prototipos, accesorios y miniaturas.</p></div></div><Metric label="Materiales" value="PLA · PETG · Resina"/><Metric label="Precio desde" value="$250/g"/><button className="btn orange" style={{marginTop:14}}>Guardar cambios</button></section><section className="panel"><h3>Presentación</h3><p className="muted" style={{marginTop:12}}>Taller de impresión 3D orientado a piezas funcionales, prototipos, accesorios y figuras personalizadas.</p></section></div><div className="portfolio" style={{marginTop:18}}>{works.map(w=><section className="panel work" key={w[0]}><div className="work-img"></div><div className="work-body"><h3>{w[0]}</h3><p className="muted">{w[1]}</p></div></section>)}</div></>}
