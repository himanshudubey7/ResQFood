import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import useSocket from '../../hooks/useSocket';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useSocket();

  return (
    <div className="flex h-screen w-full bg-surface-50 font-sans overflow-hidden selection:bg-primary-100 selection:text-primary-900">
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto px-6 pb-12 pt-8 md:px-10 md:pb-16 md:pt-10 lg:px-12 lg:pb-20 lg:pt-12 scroll-smooth">
          <div className="mx-auto w-full max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;