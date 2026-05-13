import React from 'react';
import TopBar from './components/layout/TopBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/RegisterPage';
import RenewalPage from './pages/RenewalPage';
import VerifyPage from './pages/VerifyPage';
import StatusPage from './pages/StatusPage';
import StaffLoginPage from './pages/StaffLoginPage';
import AdminPortalPage from './pages/AdminPortalPage';
import DealingAssistantPage from './pages/DealingAssistantPage';
import RegistrarPage from './pages/RegistrarPage';
import { COLORS } from './styles/theme';

<<<<<<< HEAD
// Staff-only pages that require an active session to display
const ROLE_PAGE = {
  SUPERUSER:         'admin',
  REGISTRAR:         'registrar',
  DEALING_ASSISTANT: 'da',
};
const STAFF_PAGES = Object.values(ROLE_PAGE);

export default function App() {
  const [staffSession, setStaffSession] = React.useState(() => {
    const saved = localStorage.getItem("staffSession");
    return saved ? JSON.parse(saved) : null;
  });

  // BUG FIX: If the last saved page was a staff page but there is no active
  // staff session (e.g. the session was cleared or expired), fall back to
  // "home" so the user sees the full page instead of just the TopBar.
  const [page, setPage] = React.useState(() => {
    const saved = localStorage.getItem("page") || "home";
    const session = (() => {
      try { return JSON.parse(localStorage.getItem("staffSession")); }
      catch { return null; }
    })();
    if (STAFF_PAGES.includes(saved)) {
  if (!session) return "home";
  if (ROLE_PAGE[session.role] !== saved) return ROLE_PAGE[session.role] || "home";
}
    return saved;
  });

  React.useEffect(() => {
    localStorage.setItem("page", page);
  }, [page]);
=======
export default function App() {
  const [page, setPage] = React.useState(() => {
  return localStorage.getItem("page") || "home";});
  const [staffSession, setStaffSession] = React.useState(() => {
  const saved = localStorage.getItem("staffSession");
  return saved ? JSON.parse(saved) : null;});

  React.useEffect(() => {
  localStorage.setItem("page", page);
}, [page]);
>>>>>>> 3febec9e26692bdbade2840104f812eca5f04e9d

  const publicNavItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "register", label: "New Registration" },
    { id: "renew", label: "Renewal" },
    { id: "verify", label: "Verify Certificate" },
    { id: "status", label: "Track Application" },
    { id: "staff-login", label: "Staff Login" },
  ];

  function handleStaffLogin(data) {
<<<<<<< HEAD
    console.log("STAFF SESSION =", data);
    setStaffSession(data);
    localStorage.setItem("staffSession", JSON.stringify(data));
    // Route to correct dashboard based on role
    if (data.role === 'SUPERUSER') setPage('admin');
    else if (data.role === 'REGISTRAR') setPage('registrar');
    else if (data.role === 'DEALING_ASSISTANT') setPage('da');
  }

  function handleLogout() {
    setStaffSession(null);
    localStorage.removeItem("staffSession");
    setPage('home');
  }

  // Staff navigation bar shown when logged in
  const staffNavItems = staffSession ? [
  staffSession.role === 'SUPERUSER'         && { id: 'admin',     label: '⚙ Admin Portal' },
  staffSession.role === 'REGISTRAR'         && { id: 'registrar', label: '📋 Registrar' },
  staffSession.role === 'DEALING_ASSISTANT' && { id: 'da',        label: '🗂 Applications' },
].filter(Boolean) : [];

  const isStaffPage = STAFF_PAGES.includes(page);
=======

  setStaffSession(data);

  localStorage.setItem(
    "staffSession",
    JSON.stringify(data)
  );

  // Route to correct dashboard based on role
  if (data.role === 'SUPERUSER') setPage('admin');
  else if (data.role === 'REGISTRAR') setPage('registrar');
  else if (data.role === 'DEALING_ASSISTANT') setPage('da');
}

 function handleLogout() {
  setStaffSession(null);

  localStorage.removeItem("staffSession");

  setPage('home');
}

  // Staff navigation bar shown when logged in
  const staffNavItems = staffSession ? [
    staffSession.role === 'SUPERUSER' && { id: 'admin', label: '⚙ Admin Portal' },
    (staffSession.role === 'REGISTRAR' || staffSession.role === 'SUPERUSER') && { id: 'registrar', label: '📋 Registrar' },
    { id: 'da', label: '🗂 Applications' },
  ].filter(Boolean) : [];

  const isStaffPage = ['admin', 'registrar', 'da'].includes(page);
>>>>>>> 3febec9e26692bdbade2840104f812eca5f04e9d

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif", background: COLORS.offWhite, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Source+Sans+3:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        select option { background: white; color: #1a1a2e; }
      `}</style>

      <TopBar />

      {/* Staff session banner */}
      {staffSession && (
        <div style={{
          background: COLORS.primaryDark, color: '#fff', padding: '8px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13
        }}>
          <span>
            Logged in as <strong>{staffSession.fullName}</strong>
            <span style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 4,
              padding: '2px 8px', marginLeft: 10, fontSize: 11, fontWeight: 600
            }}>{staffSession.role?.replace('_', ' ')}</span>
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            {staffNavItems.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                background: page === n.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: '#fff', border: 'none', cursor: 'pointer', padding: '4px 12px',
                borderRadius: 6, fontSize: 13, fontWeight: page === n.id ? 600 : 400
              }}>{n.label}</button>
            ))}
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
              padding: '4px 14px', borderRadius: 6, fontSize: 13
            }}>Sign Out</button>
          </div>
        </div>
      )}

      {!isStaffPage && (
        <Navbar page={page} setPage={setPage} navItems={publicNavItems} />
      )}

      <main>
        {page === "home" && <HomePage setPage={setPage} />}
        {page === "about" && <AboutPage />}
        {page === "register" && <RegisterPage />}
        {page === "renew" && <RenewalPage />}
        {page === "verify" && <VerifyPage />}
        {page === "status" && <StatusPage />}
        {page === "staff-login" && !staffSession && (
          <StaffLoginPage onLogin={handleStaffLogin} />
        )}
        {page === "admin" && staffSession?.role === 'SUPERUSER' && (
<<<<<<< HEAD
  <AdminPortalPage token={staffSession.token} />
)}

{page === "registrar" && staffSession?.role === 'REGISTRAR' && (
  <RegistrarPage token={staffSession.token} />
)}

{page === "da" && staffSession?.role === 'DEALING_ASSISTANT' && (
  <DealingAssistantPage token={staffSession.token} />
)}
=======
          <AdminPortalPage token={staffSession.token} />
        )}
        {page === "registrar" && staffSession && (
          <RegistrarPage token={staffSession.token} />
        )}
        {page === "da" && staffSession && (
          <DealingAssistantPage token={staffSession.token} />
        )}
>>>>>>> 3febec9e26692bdbade2840104f812eca5f04e9d
      </main>

      {!isStaffPage && <Footer setPage={setPage} />}
    </div>
  );
}
