const fs = require('fs');

const cssPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.module.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace sidebar, sideNav, logout styles with proper scroller and anchored logout button
const newSidebarCss = `.dashboard { min-height: 100vh; color: #18202a; background: #f6f7f9; }
.sidebar {
  position: fixed;
  z-index: 60;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 265px;
  height: 100vh;
  padding: 18px 14px 14px;
  border-right: 1px solid #e8e9ed;
  background: #ffffff;
  box-sizing: border-box;
}
.brandRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 10px;
  border-bottom: 1px solid #f1f3f5;
  flex-shrink: 0;
}
.brand { display: inline-flex; align-items: center; padding: 0; border: 0; color: #e11d48; background: transparent; cursor: pointer; }
.brand span { font: italic 900 1.65rem/1 Arial, sans-serif; letter-spacing: -.08em; }
.brand b { margin-left: 7px; padding: 4px 7px 3px; border-radius: 5px; color: #171717; background: #ffd338; font-size: .6rem; letter-spacing: .18em; }
.closeSidebar { display: none; border: 0; background: transparent; cursor: pointer; color: #64748b; }
.profileCard {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0 12px;
  padding: 9px 11px;
  border: 1px solid #eceef1;
  border-radius: 12px;
  background: #fafbfc;
  flex-shrink: 0;
}
.profileCard > div {
  display: grid; flex: 0 0 36px; height: 36px; border-radius: 10px; color: #fff; place-items: center;
  background: linear-gradient(135deg, #e11d48, #ff4655); font: 700 0.95rem Inter, sans-serif;
}
.profileCard span { display: grid; min-width: 0; gap: 1px; }
.profileCard strong, .profileCard small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.profileCard strong { font-size: .76rem; color: #0f172a; }.profileCard small { color: #89919a; font-size: .62rem; }

.sideNav {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.sideNav::-webkit-scrollbar {
  width: 5px;
}
.sideNav::-webkit-scrollbar-track {
  background: transparent;
}
.sideNav::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.sideNav::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.navGroup {
  margin-bottom: 10px;
}
.navGroupTitle {
  display: block;
  padding: 8px 10px 4px;
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sideNav button {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 7px 11px;
  border: 0;
  border-radius: 9px;
  color: #475569;
  background: transparent;
  font-size: 13px;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
}
.sideNav button:hover { color: #0f172a; background: #f1f5f9; }
.sideNav .activeNav { color: #e11d48; background: #fff1f2; font-weight: 750; }

.logoutFooter {
  flex-shrink: 0;
  padding-top: 10px;
  border-top: 1px solid #f1f3f5;
}
.logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #fee2e2;
  border-radius: 10px;
  color: #dc2626;
  background: #fef2f2;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  transition: all 0.2s ease;
}
.logout:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
}

.workspace { min-height: 100vh; margin-left: 265px; }
.topbar { position: sticky; z-index: 40; top: 0; display: flex; align-items: center; justify-content: space-between; height: 70px; padding: 0 28px; border-bottom: 1px solid #e6e8eb; background: rgb(255 255 255 / 94%); backdrop-filter: blur(16px); }
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; }
.breadcrumb strong { color: #0f172a; font-weight: 800; }
.topActions { display: flex; align-items: center; gap: 12px; }
.quickExportBtn {
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 9px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.quickExportBtn:hover { background: #1e293b; }
.topLogoutBtn {
  background: #fff;
  border: 1.5px solid #fee2e2;
  color: #dc2626;
  border-radius: 9px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s;
}
.topLogoutBtn:hover { background: #fef2f2; }
.notificationWrap { position: relative; }.notificationWrap > button { position: relative; display: grid; width: 40px; height: 40px; border: 1px solid #e1e4e8; border-radius: 10px; place-items: center; background: #fff; cursor: pointer; }
.notificationWrap > button span { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; border: 2px solid #fff; border-radius: 50%; background: #e11d48; }
.notifications { position: absolute; top: 48px; right: 0; width: 280px; padding: 16px; border: 1px solid #e6e8eb; border-radius: 12px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 50; }
.mobileMenu { display: none; border: 0; background: transparent; cursor: pointer; color: #334155; }
`;

// Extract everything from .welcome onwards in existing CSS
const splitIndex = css.indexOf('.welcome');
const restOfCss = splitIndex !== -1 ? css.slice(splitIndex) : '';

fs.writeFileSync(cssPath, newSidebarCss + '\n' + restOfCss, 'utf8');
console.log('Successfully updated DashboardPage.module.css with clean sidebar scroller and logout styling');
