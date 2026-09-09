import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, Bell, Box, CheckCircle2, ChevronRight, CircleStop, Cloud, Code2, Database, ExternalLink, FileText, GitBranch, LayoutDashboard, Maximize2, Minus, Moon, Play, RefreshCw, Server, Settings2, Sun, Terminal, X, Zap } from 'lucide-react';
import './styles.css';

const services = [
  { name: 'API Server', detail: 'Go · :8090', status: 'running', metric: '42 ms', icon: Server },
  { name: 'Web Client', detail: 'Flutter · web', status: 'running', metric: 'Ready', icon: Code2 },
  { name: 'PostgreSQL', detail: 'Docker · :5432', status: 'running', metric: '18.4 MB', icon: Database },
  { name: 'Realtime Hub', detail: 'WebSocket · :8091', status: 'attention', metric: '2 warnings', icon: Zap },
];
const events = [
  ['09:42:18', 'API Server', 'Health check passed', 'ok'],
  ['09:39:04', 'PostgreSQL', 'Backup completed · 184 MB', 'ok'],
  ['09:31:27', 'Realtime Hub', 'Reconnect threshold reached', 'warn'],
  ['09:16:03', 'Web Client', 'Build artifacts refreshed', 'ok'],
];

function App() {
  const [session, setSession] = useState(() => localStorage.getItem('link_manager_token'));
  if (!session) return <Login onLogin={(token) => { localStorage.setItem('link_manager_token', token); setSession(token); }} />;
  const [active, setActive] = useState('Overview');
  const [running, setRunning] = useState(true);
  const [notice, setNotice] = useState('');
  const [dark, setDark] = useState(false);
  const nav = [['Overview', LayoutDashboard], ['Services', Box], ['Activity log', Activity], ['Project files', FileText], ['Settings', Settings2]];
  const action = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600); };
  return <div className={dark ? 'shell dark' : 'shell'}>
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <aside className="sidebar">
      <div className="window-titlebar"><div className="brand"><div className="brand-mark"><GitBranch size={18}/></div><div><strong>LINK</strong><span>MANAGER</span></div></div><div className="window-controls"><button title="最小化"><Minus size={14}/></button><button title="最大化"><Maximize2 size={13}/></button><button title="关闭"><X size={14}/></button></div></div>
      <div className="workspace"><span className="eyebrow">WORKSPACE</span><div className="workspace-row"><span className="project-dot"/>Link <ChevronRight size={14}/></div><small>F:\AI\Link</small></div>
      <nav>{nav.map(([label, Icon]) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)}><Icon size={17}/><span>{label}</span>{label === 'Activity log' && <i>4</i>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="connection"><span className="pulse"/>Local machine<div><b>Connected</b><small>Windows · Tauri 2</small></div></div><button className="profile"><span>WM</span><div><b>Workspace admin</b><small>Local profile</small></div><ChevronRight size={14}/></button></div>
    </aside>
    <main className="content">
      <header className="topbar"><div><span className="breadcrumb">LINK / {active.toUpperCase()}</span><h1>{active === 'Overview' ? 'Project overview' : active}</h1></div><div className="top-actions"><button className="icon-button" title="Notifications"><Bell size={18}/><em>3</em></button><button className="refresh" onClick={() => action('Project status refreshed')}><RefreshCw size={15}/> Refresh</button><button className="avatar" onClick={() => {localStorage.removeItem('link_manager_token'); setSession(null)}} title="退出登录">WM</button></div></header>
      {notice && <div className="toast"><CheckCircle2 size={16}/>{notice}</div>}
      {active === 'Overview' ? <>
        <section className="hero-row"><div><p className="kicker"><span className="live-dot"/> LOCAL DEVELOPMENT</p><h2>Your project is <span>in sync.</span></h2><p className="hero-copy">A quiet command center for the City Link stack. Everything important, in one glance.</p></div><div className="hero-actions"><button className={running ? 'primary' : 'primary stopped'} onClick={() => {setRunning(!running); action(running ? 'All services stopped' : 'All services started')}}>{running ? <CircleStop size={17}/> : <Play size={17}/>} {running ? 'Stop all services' : 'Start all services'}</button><button className="secondary" onClick={() => action('Opening terminal...')}><Terminal size={17}/> Open terminal</button></div></section>
        <section className="stat-grid"><div className="stat"><span>PROJECT HEALTH</span><strong className="health"><span className="health-ring">✓</span> 96%</strong><small>All core systems operational</small></div><div className="stat"><span>ACTIVE SERVICES</span><strong>4 <small>/ 4</small></strong><small>Last checked just now</small></div><div className="stat"><span>UPTIME THIS SESSION</span><strong>02<span className="unit">h</span> 18<span className="unit">m</span></strong><small>Since today, 07:24</small></div><div className="stat"><span>GIT BRANCH</span><strong className="branch"><GitBranch size={17}/> develop</strong><small>3 commits ahead of main</small></div></section>
        <section className="section-head"><div><h3>Services</h3><p>Processes powering your local environment</p></div><button className="text-button" onClick={() => setActive('Services')}>View all <ChevronRight size={15}/></button></section>
        <section className="service-grid">{services.map(({name, detail, status, metric, icon: Icon}) => <article className="service-card" key={name}><div className="service-top"><div className="service-icon"><Icon size={18}/></div><span className={status === 'running' ? 'status running' : 'status attention'}><span/>{status === 'running' ? 'Running' : 'Attention'}</span></div><h4>{name}</h4><p>{detail}</p><div className="service-bottom"><b>{metric}</b><button title={`Open ${name}`} onClick={() => action(`${name} details opened`)}><ExternalLink size={15}/></button></div></article>)}</section>
        <section className="lower-grid"><div className="panel"><div className="panel-head"><div><h3>Recent activity</h3><p>Events from the last 24 hours</p></div><button className="text-button" onClick={() => setActive('Activity log')}>View log <ChevronRight size={15}/></button></div><div className="events">{events.map(([time, service, text, state]) => <div className="event" key={time}><span className="event-time">{time}</span><span className={`event-mark ${state}`}></span><div><b>{service}</b><p>{text}</p></div></div>)}</div></div><div className="panel deploy"><div className="panel-head"><div><h3>Environment</h3><p>Runtime configuration</p></div><Cloud size={18} className="muted"/></div><div className="env-row"><span>Mode</span><b>Development</b><span className="tag cyan">LOCAL</span></div><div className="env-row"><span>Last deploy</span><b>Aug 30, 2026</b></div><div className="env-row"><span>Runtime</span><b>Go 1.24 · Flutter 3.35</b></div><button className="outline-wide" onClick={() => action('Opening project settings')}><Settings2 size={15}/> Manage configuration</button></div></section>
      </> : <div className="empty-state"><div className="empty-icon"><Terminal size={24}/></div><h2>{active}</h2><p>This workspace view is ready for your next workflow.</p><button className="primary" onClick={() => setActive('Overview')}>Back to overview</button></div>}
      <div className="taskbar"><div className="taskbar-group"><button className="task-home" title="Link Manager"><GitBranch size={17}/></button><span className="task-separator"/><button className="task-running" onClick={() => setActive('Overview')}><LayoutDashboard size={16}/><span>Link Manager</span></button></div><div className="taskbar-group task-status"><button title="切换主题" onClick={() => setDark(!dark)}>{dark ? <Sun size={16}/> : <Moon size={16}/>}</button><span className="task-clock">LOCAL&nbsp; · &nbsp;{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div></div>
    </main>
  </div>
}

function Login({onLogin}) {
  const [username,setUsername]=useState('admin'); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  async function submit(e){e.preventDefault();setLoading(true);setError('');try{const base=import.meta.env.VITE_API_URL||'http://localhost:8090/api/v1';const res=await fetch(`${base}/admin/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});const data=await res.json();if(!res.ok)throw new Error(data.message||'登录失败');onLogin(data.token)}catch(err){setError(err.message)}finally{setLoading(false)}}
  return <div className="login-shell"><div className="login-window"><div className="login-brand"><div className="brand-mark"><GitBranch size={20}/></div><div><strong>LINK</strong><span>MANAGER</span></div></div><div className="login-copy"><span className="eyebrow">ADMINISTRATION</span><h1>Sign in to Link</h1><p>Manage your City Link workspace securely.</p></div><form onSubmit={submit}><label>Username<input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" required/></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" required/></label>{error&&<div className="login-error">{error}</div>}<button className="primary login-button" disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><small className="login-foot">Protected management API · City Link</small></div></div>
}
createRoot(document.getElementById('root')).render(<App />);
