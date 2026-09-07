const fs = require('fs');

const dashPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.jsx';
let code = fs.readFileSync(dashPath, 'utf8');

// Update sidebar rendering to use navGroup, navGroupTitle, and logoutFooter
const oldSidebarNav = `<nav className={styles.sideNav}>
          {['CORE', 'SERVICES', 'MANAGEMENT', 'SYSTEM'].map(group => {
            const items = navItems.filter(i => i.group === group)
            return (
              <div key={group} style={{ marginBottom: 12 }}>
                <small style={{ padding: '0 16px', fontSize: 10, fontWeight: 800, color: '#94A3B8', letterSpacing: 1 }}>{group}</small>
                {items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={activeNav === id ? styles.activeNav : ''}
                    type="button"
                    onClick={() => {
                      setActiveNav(id)
                      setSidebarOpen(false)
                    }}
                  >
                    <Icon size={18} /> <span>{label}</span>
                  </button>
                ))}
              </div>
            )
          })}
        </nav>

        <button className={styles.logout} type="button" onClick={logout}><LogOut size={18} /> Log out</button>`;

const newSidebarNav = `<nav className={styles.sideNav}>
          {['CORE', 'SERVICES', 'MANAGEMENT', 'SYSTEM'].map(group => {
            const items = navItems.filter(i => i.group === group)
            return (
              <div key={group} className={styles.navGroup}>
                <span className={styles.navGroupTitle}>{group}</span>
                {items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={activeNav === id ? styles.activeNav : ''}
                    type="button"
                    onClick={() => {
                      setActiveNav(id)
                      setSidebarOpen(false)
                    }}
                  >
                    <Icon size={17} /> <span>{label}</span>
                  </button>
                ))}
              </div>
            )
          })}
        </nav>

        <div className={styles.logoutFooter}>
          <button className={styles.logout} type="button" onClick={logout}>
            <LogOut size={16} /> <span>Log Out</span>
          </button>
        </div>`;

if (code.includes(oldSidebarNav)) {
  code = code.replace(oldSidebarNav, newSidebarNav);
}

// Also add a Topbar Logout button next to Export Report
const oldTopActions = `<div className={styles.topActions}>
            <button
              type="button"
              className={styles.quickExportBtn}
              onClick={() => window.open('http://localhost:4000/api/v1/admin/export/orders', '_blank')}
            >
              Export Report
            </button>`;

const newTopActions = `<div className={styles.topActions}>
            <button
              type="button"
              className={styles.quickExportBtn}
              onClick={() => window.open('http://localhost:4000/api/v1/admin/export/orders', '_blank')}
            >
              Export Report
            </button>
            <button
              type="button"
              className={styles.topLogoutBtn}
              onClick={logout}
              title="Sign out of Admin Session"
            >
              <LogOut size={14} /> Log out
            </button>`;

if (code.includes(oldTopActions)) {
  code = code.replace(oldTopActions, newTopActions);
}

fs.writeFileSync(dashPath, code, 'utf8');
console.log('Updated DashboardPage.jsx with clean sidebar layout and topbar logout button');
