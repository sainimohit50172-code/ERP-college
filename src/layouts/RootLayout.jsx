import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar.jsx';
import Topbar from '../components/navigation/Topbar.jsx';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="ml-0 md:ml-80 xl:ml-80 transition-all duration-300">
        <Topbar />
        <main className="min-h-screen bg-slate-50 px-4 pb-10 pt-6 md:px-8 xl:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
