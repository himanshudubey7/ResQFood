import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import useSocket from '../../hooks/useSocket';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useSocket();

  return (
    <div className="flex h-screen w-full bg-zinc-50 font-sans overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-6 pt-4 md:px-6 md:pb-8 md:pt-5 lg:px-8 lg:pb-10 lg:pt-6 scroll-smooth">
          <div className="mx-auto w-full max-w-315">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;