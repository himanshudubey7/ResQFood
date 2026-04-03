import { HiMenuAlt2, HiOutlineSearch, HiOutlineBell } from 'react-icons/hi';

const TopBar = ({ onMenuClick }) => {
  return (
    <header className="h-20 bg-white/95 border-b border-surface-200 flex items-center justify-between px-6 md:px-8 lg:px-10 shrink-0 z-10 backdrop-blur-md">
      
      <div className="flex items-center gap-6 md:gap-8 min-w-0">
        <button 
          className="lg:hidden p-3 -ml-3 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-colors"
          onClick={onMenuClick}
        >
          <HiMenuAlt2 className="w-7 h-7" />
        </button>
        
        <div className="hidden sm:flex items-center relative group">
          <HiOutlineSearch className="absolute left-4 text-surface-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search platform..." 
            className="pl-12 pr-5 py-3 w-72 md:w-80 lg:w-96 bg-surface-100/80 hover:bg-surface-100 border-2 border-transparent rounded-2xl text-base font-medium text-surface-900 placeholder:text-surface-500 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-3 text-surface-500 hover:text-surface-900 bg-surface-50 hover:bg-surface-100 border-2 border-surface-200 rounded-full transition-colors">
          <HiOutlineBell className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-danger-500 border-2 border-white" />
        </button>
      </div>

    </header>
  );
};

export default TopBar;