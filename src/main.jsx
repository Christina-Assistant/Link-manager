import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, Bell, CalendarDays, ChevronLeft, ChevronRight, CircleAlert,
  FileText, GitBranch, LayoutDashboard, LogOut, Menu, RefreshCw, Search,
  Settings2, ShieldCheck, ShoppingBag, SlidersHorizontal, Trash2, UserRound, Users, X
} from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090/api/v1';
const nav = [
  ['Overview', LayoutDashboard, '概览'],
  ['Users', Users, '用户'],
  ['Posts', FileText, '动态'],
  ['Events', CalendarDays, '活动'],
  ['Listings', ShoppingBag, '闲置'],
  ['Reports', CircleAlert, '举报'],
  ['Permissions', SlidersHorizontal, '权限管理'],
  ['Activity log', Activity, '审计日志'],
];

function apiRequest(path, token, options = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  }).then(async (res) => {
    if (res.status === 401) throw new Error('登录已过期，请重新登录');
    const data = res.status === 204 ? null : await res.json();
    if (!res.ok) throw new Error(data?.message || '请求失败');
    return data;
  });
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('link_manager_token'));
  const [active, setActive] = useState('Overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [error, setError] = useState('');
  const signOut = useCallback(() => { localStorage.removeItem('link_manager_token'); setToken(null); }, []);
  if (!token) return <Login onLogin={(value) => { localStorage.setItem('link_manager_token', value); setToken(value); }} />;
  return <AdminShell token={token} active={active} setActive={setActive} mobileNav={mobileNav}
    setMobileNav={setMobileNav} error={error} setError={setError} signOut={signOut} />;
}

function AdminShell({ token, active, setActive, mobileNav, setMobileNav, error, setError, signOut }) {
  const [dashboard, setDashboard] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const loadDashboard = useCallback(async () => {
    try { setDashboard(await apiRequest('/admin/dashboard', token)); setError(''); setLastRefresh(new Date()); }
    catch (e) { setError(e.message); if (e.message.includes('过期')) signOut(); }
  }, [token, setError, signOut]);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  const page = active === 'Overview'
    ? <Overview dashboard={dashboard} onRefresh={loadDashboard} setActive={setActive} />
    : active === 'Reports'
      ? <Reports count={dashboard?.reports} />
      : active === 'Activity log'
        ? <ActivityLog />
        : active === 'Permissions'
          ? <PermissionsPage token={token} setError={setError} />
        : <ContentPage type={active} token={token} setError={setError} />;
  return <div className="admin-shell">
    <aside className={mobileNav ? 'admin-sidebar open' : 'admin-sidebar'}>
      <div className="admin-brand"><div className="brand-mark"><GitBranch size={18} /></div><div><strong>CITY LINK</strong><span>ADMIN CONSOLE</span></div><button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18} /></button></div>
      <div className="workspace-label">运营工作区</div>
      <nav>{nav.map(([key, Icon, label]) => <button key={key} className={active === key ? 'admin-nav active' : 'admin-nav'} onClick={() => { setActive(key); setMobileNav(false); }}><Icon size={17} /><span>{label}</span>{key === 'Reports' && dashboard?.reports > 0 && <b>{dashboard.reports}</b>}</button>)}</nav>
      <div className="admin-sidebar-bottom"><div className="api-status"><span />管理 API 在线<small>{API_URL.replace('/api/v1', '')}</small></div><button className="admin-nav" onClick={signOut}><LogOut size={17} />退出登录</button></div>
    </aside>
    {mobileNav && <button className="nav-overlay" onClick={() => setMobileNav(false)} aria-label="关闭导航" />}
    <main className="admin-main">
      <header className="admin-header"><div className="header-title"><button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button><div><span className="breadcrumb">CITY LINK / {active.toUpperCase()}</span><h1>{nav.find(([key]) => key === active)?.[2] || active}</h1></div></div><div className="header-actions"><span className="last-sync">同步于 {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><button className="header-icon" onClick={loadDashboard} title="刷新"><RefreshCw size={17} /></button><button className="admin-avatar" onClick={signOut} title="退出登录">AD</button></div></header>
      {error && <div className="admin-alert"><CircleAlert size={17} />{error}<button onClick={() => setError('')}><X size={15} /></button></div>}
      {page}
    </main>
  </div>;
}

function Overview({ dashboard, onRefresh, setActive }) {
  const cards = [['用户总数', dashboard?.users, UserRound, '注册用户'], ['动态', dashboard?.posts, FileText, '社区内容'], ['活动', dashboard?.events, CalendarDays, '已发布活动'], ['闲置', dashboard?.listings, ShoppingBag, '闲置商品']];
  return <div className="page-body">
    <section className="page-intro"><div><span className="section-kicker">运营总览</span><h2>把 City Link 运营得更好。</h2><p>查看社区规模、内容状态和需要关注的举报。</p></div><button className="outline-button" onClick={onRefresh}><RefreshCw size={16} />刷新数据</button></section>
    <section className="metric-grid">{cards.map(([label, value, Icon, note]) => <div className="metric-card" key={label}><div className="metric-icon"><Icon size={18} /></div><span>{label}</span><strong>{value ?? '—'}</strong><small>{note}</small></div>)}</section>
    <section className="overview-grid"><div className="surface-card welcome-card"><div><span className="section-kicker">平台状态</span><h3>社区运行正常</h3><p>管理员 API 已连接，数据来自生产数据库。</p></div><ShieldCheck size={38} /></div><div className="surface-card attention-card"><div className="card-heading"><div><span className="section-kicker">需要处理</span><h3>举报队列</h3></div><CircleAlert size={19} /></div><strong>{dashboard?.reports ?? '—'}</strong><p>条待审核举报</p><button className="link-button" onClick={() => setActive('Reports')}>查看举报 <ChevronRight size={15} /></button></div></section>
    <section className="surface-card quick-card"><div className="card-heading"><div><span className="section-kicker">快捷操作</span><h3>内容管理</h3></div></div><div className="quick-actions">{[['Users', UserRound, '查看用户'], ['Posts', FileText, '审核动态'], ['Events', CalendarDays, '管理活动'], ['Listings', ShoppingBag, '管理闲置']].map(([key, Icon, label]) => <button key={key} onClick={() => setActive(key)}><Icon size={18} /><span>{label}</span><ChevronRight size={15} /></button>)}</div></section>
  </div>;
}

function ContentPage({ type, token, setError }) {
  const config = useMemo(() => ({ Users: ['用户', '昵称、手机号或城市', 'users'], Posts: ['动态', '内容或城市', 'posts'], Events: ['活动', '标题或城市', 'events'], Listings: ['闲置', '标题或城市', 'listings'] }[type]), [type]);
  const [query, setQuery] = useState(''); const [data, setData] = useState(null); const [page, setPage] = useState(1); const [loading, setLoading] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { setData(await apiRequest(`/admin/${config[2]}?page=${page}&page_size=10&q=${encodeURIComponent(query)}`, token)); setError(''); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [config, page, query, token, setError]);
  useEffect(() => { load(); }, [load]);
  async function remove(id) { if (!window.confirm('确定删除这条内容吗？此操作不可撤销。')) return; try { await apiRequest(`/admin/${config[2]}/${id}`, token, { method: 'DELETE' }); load(); } catch (e) { setError(e.message); } }
  const rows = data?.items || []; const pagination = data?.pagination; const isUsers = type === 'Users';
  return <div className="page-body"><section className="page-intro compact"><div><span className="section-kicker">数据管理 / {config[0]}</span><h2>{config[0]}</h2><p>搜索、查看和管理平台上的{config[0]}。</p></div></section><section className="surface-card data-card"><div className="toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder={`搜索${config[1]}`} /></div><button className="outline-button" onClick={load}><RefreshCw size={15} />刷新</button></div><div className="data-table"><div className="table-head"><span>ID</span><span>{isUsers ? '用户' : '内容'}</span><span>{isUsers ? '联系方式' : '发布者'}</span><span>{isUsers ? '城市' : '城市 / 时间'}</span><span>操作</span></div>{loading && <div className="table-empty">正在加载…</div>}{!loading && rows.map(row => <div className="table-line" key={row.id}><span className="muted-cell">#{row.id}</span><span><b>{isUsers ? (row.nickname || '未设置昵称') : (row.title || row.content?.slice(0, 34) || '无标题')}</b>{isUsers && <small>{row.is_verified ? '已认证' : '未认证'}</small>}</span><span>{isUsers ? row.phone : (row.user?.nickname || '未知用户')}</span><span>{row.city || '—'}{!isUsers && <small>{formatDate(row.created_at)}</small>}</span><span>{!isUsers && <button className="danger-button" onClick={() => remove(row.id)} title="删除"><Trash2 size={15} /></button>}</span></div>)}{!loading && rows.length === 0 && <div className="table-empty">没有找到匹配数据</div>}</div><div className="pagination"><span>共 {pagination?.total ?? 0} 条</span><div><button disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={15} /></button><b>{page} / {pagination?.total_pages || 1}</b><button disabled={page >= (pagination?.total_pages || 1)} onClick={() => setPage(page + 1)}><ChevronRight size={15} /></button></div></div></section></div>;
}

function Reports({ count }) { return <div className="page-body"><section className="page-intro compact"><div><span className="section-kicker">安全与审核</span><h2>举报</h2><p>集中处理用户提交的社区举报。</p></div></section><div className="surface-card empty-panel"><CircleAlert size={30} /><h3>{count ?? 0} 条待处理举报</h3><p>举报查询接口准备就绪后，这里会显示详细队列。</p></div></div>; }
function ActivityLog() { return <div className="page-body"><section className="page-intro compact"><div><span className="section-kicker">安全与审核</span><h2>审计日志</h2><p>记录管理员登录和内容管理操作。</p></div></section><div className="surface-card empty-panel"><Activity size={30} /><h3>审计日志接口待接入</h3><p>后端已记录管理员操作，管理查询接口将在下一步开放。</p></div></div>; }
function PermissionsPage({ token, setError }) {
  const [roles, setRoles] = useState([]); const [permissions, setPermissions] = useState([]); const [selected, setSelected] = useState(null); const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { try { const [roleData, permissionData] = await Promise.all([apiRequest('/admin/roles', token), apiRequest('/admin/permissions', token)]); setRoles(roleData); setPermissions(permissionData); setSelected(roleData[0]?.id || null); setError(''); } catch (e) { setError(e.message); } }, [token, setError]);
  useEffect(() => { load(); }, [load]);
  const role = roles.find(item => item.id === selected);
  function toggle(id) { if (!role) return; setRoles(items => items.map(item => item.id === role.id ? { ...item, permissions: item.permissions.some(permission => permission.id === id) ? item.permissions.filter(permission => permission.id !== id) : [...item.permissions, permissions.find(permission => permission.id === id)] } : item)); }
  async function save() { if (!role) return; setSaving(true); try { const updated = await apiRequest(`/admin/roles/${role.id}/permissions`, token, { method: 'PATCH', body: JSON.stringify({ permission_ids: role.permissions.map(permission => permission.id) }) }); setRoles(items => items.map(item => item.id === updated.id ? updated : item)); setError(''); } catch (e) { setError(e.message); } finally { setSaving(false); } }
  return <div className="page-body"><section className="page-intro compact"><div><span className="section-kicker">访问控制</span><h2>权限管理</h2><p>按角色配置管理后台可执行的操作权限。</p></div><button className="outline-button" onClick={load}><RefreshCw size={15} />刷新</button></section><div className="permission-layout"><section className="surface-card role-list"><div className="card-heading"><div><span className="section-kicker">角色</span><h3>管理角色</h3></div></div>{roles.map(item => <button key={item.id} className={item.id === selected ? 'role-item selected' : 'role-item'} onClick={() => setSelected(item.id)}><ShieldCheck size={17} /><span><b>{item.name}</b><small>{item.permissions.length} 项权限</small></span><ChevronRight size={15} /></button>)}{roles.length === 0 && <div className="table-empty">暂无角色数据</div>}</section><section className="surface-card permission-card"><div className="permission-heading"><div><span className="section-kicker">权限清单</span><h3>{role ? `${role.name} 的权限` : '选择一个角色'}</h3></div><button className="primary save-permissions" disabled={!role || saving} onClick={save}>{saving ? '保存中…' : '保存权限'}</button></div>{role ? <div className="permission-grid">{permissions.map(permission => <label className="permission-option" key={permission.id}><input type="checkbox" checked={role.permissions.some(item => item.id === permission.id)} onChange={() => toggle(permission.id)} /><span><b>{permission.name}</b><small>{permission.key}</small></span></label>)}</div> : <div className="table-empty">请选择角色</div>}</section></div></div>;
}
function formatDate(value) { return value ? new Date(value).toLocaleDateString('zh-CN') : ''; }

function Login({ onLogin }) {
  const [username, setUsername] = useState('admin'); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(e) { e.preventDefault(); setLoading(true); setError(''); try { const res = await fetch(`${API_URL}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }); const data = await res.json(); if (!res.ok) throw new Error(data.message || '登录失败'); onLogin(data.token); } catch (e) { setError(e.message); } finally { setLoading(false); } }
  return <div className="login-shell"><div className="login-window"><div className="login-brand"><div className="brand-mark"><GitBranch size={20} /></div><div><strong>CITY LINK</strong><span>ADMIN CONSOLE</span></div></div><div className="login-copy"><span className="eyebrow">安全管理平台</span><h1>登录管理后台</h1><p>管理用户、内容与社区秩序。</p></div><form onSubmit={submit}><label>管理员账号<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required /></label><label>密码<input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" required /></label>{error && <div className="login-error">{error}</div>}<button className="primary login-button" disabled={loading}>{loading ? '登录中…' : '登录管理后台'}</button></form><small className="login-foot">City Link · Protected administration</small></div></div>;
}

createRoot(document.getElementById('root')).render(<App />);
