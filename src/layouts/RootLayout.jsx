import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar.jsx';
import Topbar from '../components/navigation/Topbar.jsx';

export default function RootLayout() {
  return (
    <div className="min-h-screen text-slate-900">
      <Sidebar />
      <div className="ml-0 md:ml-80 xl:ml-80 transition-all duration-300">
        <Topbar />
        <main className="min-h-screen px-4 pb-10 pt-6 md:px-6 lg:px-8 xl:px-10 2xl:px-0">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
