const StatCard = ({ icon, label, title, value, trend, trendUp, className = '' }) => {
  const heading = label || title || '';

  return (
    <div className={`bg-white rounded-[2rem] border border-surface-200 p-6 md:p-8 card-hover min-h-36 premium-shadow ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-[13px] md:text-sm font-extrabold text-surface-500 mb-3 uppercase tracking-widest">{heading}</p>
          <p className="text-4xl md:text-5xl font-black text-surface-950 leading-none heading-font tracking-tight">{value}</p>
          {trend && (
            <div className="mt-4">
              <span className={`text-xs md:text-sm font-bold flex inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${trendUp ? 'text-primary-700 bg-primary-100/50' : 'text-danger-700 bg-danger-100/50'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 md:p-5 rounded-3xl bg-primary-50/80 border border-primary-100 text-primary-600 text-2xl md:text-3xl shrink-0 shadow-[inset_0_2px_10px_rgba(0,230,118,0.1)]">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
