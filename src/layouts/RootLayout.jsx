import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/navigation/Sidebar.jsx';
import Topbar from '../components/navigation/Topbar.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import PageTitleStrip from '../components/ui/PageTitleStrip.jsx';

export default function RootLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isDashboardRoute = location.pathname === '/';

  useEffect(() => {
    // lock body scroll when sidebar drawer is open on mobile
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
  }, [isSidebarOpen]);

  return (
    <div className="erp-app-shell min-h-screen overflow-x-hidden bg-[#eef2f5] text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative min-h-screen w-full overflow-x-hidden transition-all duration-200 md:ml-[200px] md:w-[calc(100%-200px)] bg-[#eef2f5]">
        <Topbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        <PageTitleStrip />
        <main className="erp-main-canvas min-h-screen overflow-x-hidden bg-[#eef2f5] pb-24 pt-[165px]">
          <div className="erp-content-wrapper">
            <ErrorBoundary>
              <div className="pt-1">
                {isDashboardRoute ? <Outlet /> : <div className="erp-page-shell"><Outlet /></div>}
              </div>
            </ErrorBoundary>
          </div>
        </main>
        <footer className="fixed bottom-0 left-0 z-30 flex h-[25px] w-full items-center justify-center border-t border-white/20 bg-[#101824] px-4 py-0 text-center text-[11px] text-white sm:px-6 md:left-[200px] md:w-[calc(100%-200px)] lg:px-8">
          © 2026 HARIDWAR UNIVERSITY - Campus Automation Partner
        </footer>
      </div>
    </div>
  );
}
