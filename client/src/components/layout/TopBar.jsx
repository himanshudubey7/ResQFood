import { HiMenuAlt2, HiOutlineSearch, HiOutlineBell } from 'react-icons/hi';

const TopBar = ({ onMenuClick }) => {
  return (
    <header className="h-18 bg-white/95 border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0 z-10 backdrop-blur-sm">
      
      <div className="flex items-center gap-4 md:gap-6 min-w-0">
        <button 
          className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          onClick={onMenuClick}
        >
          <HiMenuAlt2 className="w-6 h-6" />
        </button>
        
        <div className="hidden sm:flex items-center relative group">
          <HiOutlineSearch className="absolute left-3.5 text-zinc-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search platform..." 
            className="pl-10 pr-4 py-2.5 w-64 md:w-72 lg:w-80 bg-zinc-100/80 hover:bg-zinc-100 border border-transparent rounded-xl text-sm text-zinc-900 placeholder:text-zinc-500 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2.5 text-zinc-500 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-full transition-colors">
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
        </button>
      </div>

    </header>
  );
};

export default TopBar;