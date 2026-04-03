import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiHome, HiPlusCircle, HiClipboardList, HiUsers, HiTruck, HiLightningBolt, HiLogout, HiX, HiShieldCheck } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';

const roleNavItems = {
  donor: [
    { path: '/donor', icon: HiHome, label: 'Overview' },
    { path: '/donor/create', icon: HiPlusCircle, label: 'Create Listing' },
    { path: '/donor/listings', icon: HiClipboardList, label: 'My Listings' },
  ],
  ngo: [
    { path: '/ngo', icon: HiHome, label: 'Overview' },
    { path: '/ngo/feed', icon: HiLightningBolt, label: 'Live Feed' },
    { path: '/ngo/claims', icon: HiClipboardList, label: 'My Claims' },
  ],
  volunteer: [
    { path: '/volunteer', icon: HiHome, label: 'Overview' },
    { path: '/volunteer/active', icon: HiTruck, label: 'Active Pickups' },
    { path: '/volunteer/history', icon: HiClipboardList, label: 'Delivery Log' },
  ],
  admin: [
    { path: '/admin', icon: HiHome, label: 'Dashboard' },
    { path: '/admin/users', icon: HiUsers, label: 'Users' },
    { path: '/admin/listings', icon: HiClipboardList, label: 'Listing Monitor' },
  ],
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = roleNavItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-surface-950/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-80 bg-surface-950 border-r border-surface-900 flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}
      `}>
        
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-surface-900/80 shrink-0">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center text-xl font-bold text-surface-950">R</div>
            <h1 className="text-xl font-bold tracking-tight text-white heading-font">ResQFood</h1>
          </Link>
          <button className="lg:hidden text-surface-400 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-6 py-8 shrink-0 border-b border-surface-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-800 text-primary-400 flex items-center justify-center font-bold text-xl uppercase shadow-inner">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <HiShieldCheck className="w-4 h-4 text-primary-500" />
                <p className="text-xs text-primary-500 font-extrabold tracking-widest uppercase">{user?.role || 'Volunteer'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== `/${user?.role}` && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}
                className={`
                  relative flex items-center gap-4 px-5 py-3.5 rounded-2xl text-base font-bold transition-all group
                  ${isActive ? 'text-primary-400 bg-surface-900' : 'text-surface-400 hover:text-surface-100 hover:bg-surface-900/50'}
                `}
              >
                {isActive && <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-primary-500 rounded-r-md" />}
                <item.icon className={`w-6 h-6 ${isActive ? 'text-primary-400' : 'text-surface-500 group-hover:text-surface-300'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-surface-900/80 shrink-0">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl text-sm font-bold text-surface-400 hover:text-white hover:bg-surface-900 transition-all">
            <HiLogout className="w-6 h-6" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;